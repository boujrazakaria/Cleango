import { createHash, timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../../../../lib/firebase-admin";

function matchesAccessCode(provided: string, expected: string) {
  const providedHash = createHash("sha256").update(provided).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

export async function POST(request: Request) {
  const expectedAccessCode = process.env.DRIVER_REGISTRATION_CODE;
  if (!expectedAccessCode || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return Response.json({ error: "Registration is not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const vehicle = typeof body.vehicle === "string" ? body.vehicle.trim() : "";
    const accessCode = typeof body.accessCode === "string" ? body.accessCode : "";

    if (!name || !phone || !vehicle || !accessCode) {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }

    if (!matchesAccessCode(accessCode, expectedAccessCode)) {
      return Response.json({ error: "Invalid access code." }, { status: 403 });
    }

    await getAdminFirestore().collection("drivers").add({
      name,
      phone,
      vehicle,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to register driver:", error);
    return Response.json({ error: "Registration failed." }, { status: 500 });
  }
}