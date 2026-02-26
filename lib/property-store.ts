import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { toSlug } from "@/lib/slug";
import { Property, PropertyInput } from "@/lib/types";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, key);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProperty(row: any): Property {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    city: row.city as string,
    address: row.address as string,
    price: Number(row.price),
    beds: Number(row.beds),
    baths: Number(row.baths),
    sqft: Number(row.sqft),
    type: row.type as string,
    status: row.status as Property["status"],
    description: row.description as string,
    features: (row.features as string[]) ?? [],
    images: (row.images as string[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function normalizeInput(input: PropertyInput): PropertyInput {
  return {
    ...input,
    title: input.title.trim(),
    city: input.city.trim(),
    address: input.address.trim(),
    type: input.type.trim(),
    description: input.description.trim(),
    features: input.features.map((f) => f.trim()).filter(Boolean),
    images: input.images.filter(Boolean),
  };
}

async function withUniqueSlug(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: ReturnType<typeof createClient<any>>,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = toSlug(title);
  let candidate = base;
  let counter = 2;

  for (let attempt = 0; attempt < 100; attempt++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (client as any)
      .from("properties")
      .select("id")
      .eq("slug", candidate);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query;

    if (!data || data.length === 0) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return `${base}-${randomUUID().slice(0, 8)}`;
}

export async function listProperties(): Promise<Property[]> {
  const client = getClient();

  const { data, error } = await client
    .from("properties")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toProperty);
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const client = getClient();

  const { data, error } = await client
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return toProperty(data);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const client = getClient();

  const { data, error } = await client
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toProperty(data);
}

export async function addProperty(input: PropertyInput): Promise<Property> {
  const client = getClient();
  const normalized = normalizeInput(input);
  const id = randomUUID();
  const slug = await withUniqueSlug(client, normalized.title);
  const now = new Date().toISOString();

  const { data, error } = await client
    .from("properties")
    .insert({
      id,
      slug,
      title: normalized.title,
      city: normalized.city,
      address: normalized.address,
      price: normalized.price,
      beds: normalized.beds,
      baths: normalized.baths,
      sqft: normalized.sqft,
      type: normalized.type,
      status: normalized.status,
      description: normalized.description,
      features: normalized.features,
      images: normalized.images,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toProperty(data);
}

export async function updateProperty(id: string, input: PropertyInput): Promise<Property | null> {
  const client = getClient();
  const normalized = normalizeInput(input);

  const existing = await getPropertyById(id);
  if (!existing) return null;

  const slug =
    existing.title === normalized.title
      ? existing.slug
      : await withUniqueSlug(client, normalized.title, id);

  const { data, error } = await client
    .from("properties")
    .update({
      slug,
      title: normalized.title,
      city: normalized.city,
      address: normalized.address,
      price: normalized.price,
      beds: normalized.beds,
      baths: normalized.baths,
      sqft: normalized.sqft,
      type: normalized.type,
      status: normalized.status,
      description: normalized.description,
      features: normalized.features,
      images: normalized.images,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toProperty(data);
}

export async function deleteProperty(id: string): Promise<boolean> {
  const client = getClient();

  const { error, count } = await client
    .from("properties")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
