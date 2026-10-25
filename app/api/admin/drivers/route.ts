import { getAdminAuth, getAdminFirestore } from "../../../../lib/firebase-admin";

const validStatuses = new Set(["pending", "active", "onRoute"]);

async function authorizeAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return { error: Response.json({ error: "Authentication required." }, { status: 401 }) };

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    const db = getAdminFirestore();
    const userDocument = await db.doc(`users/${decodedToken.uid}`).get();
    if (userDocument.data()?.role !== "admin") {
      return { error: Response.json({ error: "Admin access required." }, { status: 403 }) };
    }
    return { db };
  } catch (error) {
    console.error("Failed to authorize driver management request:", error);
    return { error: Response.json({ error: "Authentication failed." }, { status: 401 }) };
  }
}

export async function GET(request: Request) {
  const authorization = await authorizeAdmin(request);
  if ("error" in authorization) return authorization.error;

  try {
    const snapshot = await authorization.db.collection("drivers").get();
    const drivers = snapshot.docs.map((driverDocument) => {
      const data = driverDocument.data();
      return {
        id: driverDocument.id,
        name: typeof data.name === "string" ? data.name : "",
        phone: typeof data.phone === "string" ? data.phone : "",
        vehicle: typeof data.vehicle === "string" ? data.vehicle : "",
        status: validStatuses.has(data.status) ? data.status : "active",
      };
    });
    return Response.json({ drivers });
  } catch (error) {
    console.error("Failed to load drivers:", error);
    return Response.json({ error: "Could not load drivers." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeAdmin(request);
  if ("error" in authorization) return authorization.error;

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const vehicle = typeof body.vehicle === "string" ? body.vehicle.trim() : "";
    const status = typeof body.status === "string" && validStatuses.has(body.status) ? body.status : "active";
    if (!name || !phone || !vehicle) {
      return Response.json({ error: "Name, phone, and vehicle are required." }, { status: 400 });
    }

    const reference = await authorization.db.collection("drivers").add({
      name,
      phone,
      vehicle,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return Response.json({ id: reference.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to add driver:", error);
    return Response.json({ error: "Could not save driver." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authorization = await authorizeAdmin(request);
  if ("error" in authorization) return authorization.error;

  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const vehicle = typeof body.vehicle === "string" ? body.vehicle.trim() : "";
    const status = typeof body.status === "string" ? body.status : "";
    if (!id || !name || !phone || !vehicle || !validStatuses.has(status)) {
      return Response.json({ error: "Valid driver details are required." }, { status: 400 });
    }

    await authorization.db.doc(`drivers/${id}`).update({ name, phone, vehicle, status, updatedAt: new Date() });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to update driver:", error);
    return Response.json({ error: "Could not update driver." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authorization = await authorizeAdmin(request);
  if ("error" in authorization) return authorization.error;

  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return Response.json({ error: "Driver ID is required." }, { status: 400 });

    await authorization.db.doc(`drivers/${id}`).delete();
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete driver:", error);
    return Response.json({ error: "Could not delete driver." }, { status: 500 });
  }
}