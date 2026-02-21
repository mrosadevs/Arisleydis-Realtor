import { NextResponse } from "next/server";
import { isCurrentRequestAuthenticated } from "@/lib/auth";
import { deleteProperty, getPropertyById, updateProperty } from "@/lib/property-store";
import { PropertyInput, PropertyStatus } from "@/lib/types";

function normalizePayload(input: unknown): PropertyInput {
  const data = input as Record<string, unknown>;

  const title = typeof data.title === "string" ? data.title.trim() : "";
  const city = typeof data.city === "string" ? data.city.trim() : "";
  const address = typeof data.address === "string" ? data.address.trim() : "";
  const type = typeof data.type === "string" ? data.type.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";

  const statusValue = typeof data.status === "string" ? data.status : "For Sale";
  const validStatuses: PropertyStatus[] = ["For Sale", "For Rent", "Under Contract", "Sold"];
  const status: PropertyStatus = validStatuses.includes(statusValue as PropertyStatus)
    ? (statusValue as PropertyStatus)
    : "For Sale";

  const price = Number(data.price ?? 0);
  const beds = Number(data.beds ?? 0);
  const baths = Number(data.baths ?? 0);
  const sqft = Number(data.sqft ?? 0);

  const features = Array.isArray(data.features)
    ? data.features.map((item) => String(item)).map((item) => item.trim()).filter(Boolean)
    : [];

  const images = Array.isArray(data.images)
    ? data.images.map((item) => String(item)).map((item) => item.trim()).filter(Boolean)
    : [];

  if (!title || !city || !address || !type || !description || images.length === 0) {
    throw new Error(
      "Required fields are missing. Please include title, city, address, type, description and at least one image."
    );
  }

  if (Number.isNaN(price) || Number.isNaN(beds) || Number.isNaN(baths) || Number.isNaN(sqft)) {
    throw new Error("Price, beds, baths and sqft must be numeric values.");
  }

  return {
    title,
    city,
    address,
    type,
    description,
    status,
    price,
    beds,
    baths,
    sqft,
    features,
    images
  };
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id);

  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  return NextResponse.json({ property });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isCurrentRequestAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const payload = normalizePayload(body);
    const property = await updateProperty(params.id, payload);

    if (!property) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    return NextResponse.json({ property });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update property.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isCurrentRequestAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const removed = await deleteProperty(params.id);

  if (!removed) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
