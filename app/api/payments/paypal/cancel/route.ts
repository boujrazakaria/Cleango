import { getAdminFirestore } from "../../../../../lib/firebase-admin";
import { getPayPalAccessToken, getPayPalApiBase } from "../../../../../lib/paypal";

function redirectToResult(status: string) {
  const appUrl = process.env.APP_URL;
  if (!appUrl) return Response.json({ error: "APP_URL is not configured." }, { status: 503 });
  return Response.redirect(new URL(`/payment-result?status=${status}`, appUrl));
}

export async function GET(request: Request) {
  const paypalOrderId = new URL(request.url).searchParams.get("token");
  if (!paypalOrderId) return redirectToResult("cancelled");

  try {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const paypalOrder = await response.json();
    const orderId = paypalOrder.purchase_units?.[0]?.custom_id;
    if (response.ok && typeof orderId === "string") {
      const db = getAdminFirestore();
      const orderReference = db.collection("orders").doc(orderId);
      const orderDocument = await orderReference.get();
      if (orderDocument.data()?.paypalOrderId === paypalOrderId && orderDocument.data()?.paymentStatus !== "paid") {
        await orderReference.update({ paymentStatus: "cancelled" });
      }
    }
  } catch (error) {
    console.error("Failed to mark PayPal order as cancelled:", error);
  }

  return redirectToResult("cancelled");
}
