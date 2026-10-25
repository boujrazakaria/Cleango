import { getAdminFirestore } from "../../../../../lib/firebase-admin";
import { getPayPalAccessToken, getPayPalApiBase } from "../../../../../lib/paypal";

function redirectToResult(status: string) {
  const appUrl = process.env.APP_URL;
  if (!appUrl) return Response.json({ error: "APP_URL is not configured." }, { status: 503 });
  return Response.redirect(new URL(`/payment-result?status=${status}`, appUrl));
}

export async function GET(request: Request) {
  const appUrl = process.env.APP_URL;
  const paypalOrderId = new URL(request.url).searchParams.get("token");
  if (!appUrl || !paypalOrderId) return redirectToResult("failed");

  try {
    const accessToken = await getPayPalAccessToken();
    const paypalOrderResponse = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const paypalOrder = await paypalOrderResponse.json();
    const orderId = paypalOrder.purchase_units?.[0]?.custom_id;
    if (!paypalOrderResponse.ok || typeof orderId !== "string") return redirectToResult("failed");

    const db = getAdminFirestore();
    const orderReference = db.collection("orders").doc(orderId);
    const orderDocument = await orderReference.get();
    const order = orderDocument.data();
    if (!orderDocument.exists || order?.paypalOrderId !== paypalOrderId) return redirectToResult("failed");
    if (order.paymentStatus === "paid") return redirectToResult("success");

    let captureResult = paypalOrder;
    if (paypalOrder.status === "APPROVED") {
      const captureResponse = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": `capture-${paypalOrderId}`,
        },
        body: "{}",
        cache: "no-store",
      });
      captureResult = await captureResponse.json();
      if (!captureResponse.ok) {
        console.error("PayPal capture error:", captureResult);
        return redirectToResult("failed");
      }
    }

    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    if (captureResult.status !== "COMPLETED" || capture?.status !== "COMPLETED") {
      return redirectToResult("failed");
    }

    await orderReference.update({
      paymentStatus: "paid",
      paypalCaptureId: capture.id,
      paidAt: new Date(),
    });
    return redirectToResult("success");
  } catch (error) {
    console.error("Failed to capture PayPal payment:", error);
    return redirectToResult("failed");
  }
}
