const paypalApiBase = process.env.PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal is not configured.");

  const response = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok || typeof result.access_token !== "string") {
    throw new Error("Could not authenticate with PayPal.");
  }
  return result.access_token as string;
}

export async function getMadToUsdRate() {
  const response = await fetch("https://open.er-api.com/v6/latest/MAD", { cache: "no-store" });
  const result = await response.json();
  const rate = result?.result === "success" ? result?.rates?.USD : undefined;
  if (!response.ok || typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    throw new Error("Could not retrieve the MAD to USD exchange rate.");
  }
  return rate as number;
}

export function getPayPalApiBase() {
  return paypalApiBase;
}
