import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminFirestore } from "../../../lib/firebase-admin";
import { getMadToUsdRate, getPayPalAccessToken, getPayPalApiBase } from "../../../lib/paypal";

type CartItemInput = { serviceId: string; quantity: number };

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const idToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!idToken) return Response.json({ error: "Please sign in before placing an order." }, { status: 401 });

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    const body = await request.json();
    const details = body?.details;
    const paymentMethod = body?.paymentMethod;
    const inputs: CartItemInput[] = Array.isArray(body?.items) ? body.items : [];
    const address = typeof details?.address === "string" ? details.address.trim() : "";
    const phone = typeof details?.phone === "string" ? details.phone.trim() : "";
    const date = typeof details?.date === "string" ? details.date : "";
    const notes = typeof details?.notes === "string" ? details.notes.trim() : "";

    if (!address || !phone || !date || !inputs.length || !["cash", "paypal"].includes(paymentMethod)) {
      return Response.json({ error: "Complete the order details and choose a valid payment method." }, { status: 400 });
    }

    const db = getAdminFirestore();
    const items = await Promise.all(inputs.map(async (input) => {
      if (typeof input.serviceId !== "string" || !Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 100) {
        throw new Error("Invalid cart item.");
      }
      const serviceDocument = await db.collection("services").doc(input.serviceId).get();
      const service = serviceDocument.data();
      if (!serviceDocument.exists || typeof service?.price !== "number" || service.price < 0) {
        throw new Error("A selected service is no longer available.");
      }
      return {
        serviceId: input.serviceId,
        name: typeof service.name === "string" ? service.name : "Service",
        price: service.price,
        quantity: input.quantity,
        total: service.price * input.quantity,
      };
    }));
    const totalMad = items.reduce((sum, item) => sum + item.total, 0);
    if (!Number.isFinite(totalMad) || totalMad <= 0) {
      return Response.json({ error: "The order total is invalid." }, { status: 400 });
    }

    const orderReference = db.collection("orders").doc();
    const baseOrder = {
      userId: decodedToken.uid,
      userEmail: typeof decodedToken.email === "string" ? decodedToken.email : "",
      items,
      total: totalMad,
      currency: "MAD",
      status: "Pending",
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "cash_on_delivery" : "pending",
      date,
      address,
      phone,
      notes,
      createdAt: FieldValue.serverTimestamp(),
    };

    if (paymentMethod === "cash") {
      await orderReference.set(baseOrder);
      return Response.json({ success: true, orderId: orderReference.id }, { status: 201 });
    }

    const appUrl = process.env.APP_URL;
    if (!appUrl) return Response.json({ error: "Online payment is not configured." }, { status: 503 });

    let usdTotal: number;
    let exchangeRate: number;
    let paypalOrderId: string;
    let approvalUrl: string;

    try {
      const [accessToken, rate] = await Promise.all([getPayPalAccessToken(), getMadToUsdRate()]);
      exchangeRate = rate;
      usdTotal = Number((totalMad * rate).toFixed(2));
      if (usdTotal < 0.01) throw new Error("The converted total is too small for PayPal.");

      const paypalResponse = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": orderReference.id,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            reference_id: orderReference.id,
            custom_id: orderReference.id,
            amount: { currency_code: "USD", value: usdTotal.toFixed(2) },
            description: `CleanGo order ${orderReference.id}`,
          }],
          application_context: {
            brand_name: "CleanGo",
            user_action: "PAY_NOW",
            return_url: `${appUrl}/api/payments/paypal/capture`,
            cancel_url: `${appUrl}/api/payments/paypal/cancel`,
          },
        }),
        cache: "no-store",
      });
      const paypalOrder = await paypalResponse.json();
      if (!paypalResponse.ok || typeof paypalOrder.id !== "string") {
        console.error("PayPal create-order error:", paypalOrder);
        throw new Error("PayPal could not create the payment.");
      }
      const approvalLink = paypalOrder.links?.find((link: { rel?: string }) => link.rel === "approve")?.href;
      if (typeof approvalLink !== "string") throw new Error("PayPal did not return a payment link.");
      paypalOrderId = paypalOrder.id;
      approvalUrl = approvalLink;
    } catch (paymentError) {
      console.error("Failed to start PayPal payment:", paymentError);
      return Response.json({ error: "Could not start PayPal payment. Check the PayPal setup and try again." }, { status: 502 });
    }

    await orderReference.set({
      ...baseOrder,
      paymentStatus: "created",
      paymentCurrency: "USD",
      paymentAmount: usdTotal,
      exchangeRateMadToUsd: exchangeRate,
      paypalOrderId,
    });

    return Response.json({ approvalUrl }, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    const message = error instanceof Error ? error.message : "Could not create order.";
    const badRequest = message === "Invalid cart item." || message === "A selected service is no longer available.";
    return Response.json({ error: badRequest ? message : "Could not create order." }, { status: badRequest ? 400 : 500 });
  }
}
