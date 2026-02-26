/**
 * Property store — automatically selects backend based on environment:
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set → Supabase (used on Vercel)
 *   Neither set → local JSON file at data/properties.json (used in local dev)
 */

import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import { toSlug } from "@/lib/slug";
import { Property, PropertyInput } from "@/lib/types";

// ─── Helpers shared by both backends ─────────────────────────────────────────

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

// ─── Supabase backend ─────────────────────────────────────────────────────────

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function getSupabaseClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProperty(row: any): Property {
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

async function supabaseUniqueSlug(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = toSlug(title);
  let candidate = base;
  let counter = 2;

  for (let attempt = 0; attempt < 100; attempt++) {
    let query = client.from("properties").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query;
    if (!data || data.length === 0) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return `${base}-${randomUUID().slice(0, 8)}`;
}

async function supabaseListProperties(): Promise<Property[]> {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from("properties")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToProperty);
}

async function supabaseGetBySlug(slug: string): Promise<Property | null> {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return rowToProperty(data);
}

async function supabaseGetById(id: string): Promise<Property | null> {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return rowToProperty(data);
}

async function supabaseAdd(input: PropertyInput): Promise<Property> {
  const client = await getSupabaseClient();
  const normalized = normalizeInput(input);
  const id = randomUUID();
  const slug = await supabaseUniqueSlug(client, normalized.title);
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
  return rowToProperty(data);
}

async function supabaseUpdate(id: string, input: PropertyInput): Promise<Property | null> {
  const client = await getSupabaseClient();
  const normalized = normalizeInput(input);
  const existing = await supabaseGetById(id);
  if (!existing) return null;

  const slug =
    existing.title === normalized.title
      ? existing.slug
      : await supabaseUniqueSlug(client, normalized.title, id);

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
  return rowToProperty(data);
}

async function supabaseDelete(id: string): Promise<boolean> {
  const client = await getSupabaseClient();
  const { error, count } = await client
    .from("properties")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

// ─── File-based backend (local dev only) ─────────────────────────────────────

async function fileReadProperties(): Promise<Property[]> {
  const { access, mkdir, readFile, writeFile } = await import("fs/promises");
  const path = await import("path");

  const dataPath = path.join(process.cwd(), "data", "properties.json");
  const dir = path.dirname(dataPath);
  await mkdir(dir, { recursive: true });

  try {
    await access(dataPath);
  } catch {
    await writeFile(dataPath, "[]", "utf8");
  }

  const raw = await readFile(dataPath, "utf8");
  try {
    const parsed = JSON.parse(raw) as Property[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteProperties(properties: Property[]): Promise<void> {
  const { writeFile } = await import("fs/promises");
  const path = await import("path");
  const dataPath = path.join(process.cwd(), "data", "properties.json");
  await writeFile(dataPath, JSON.stringify(properties, null, 2), "utf8");
}

function fileUniqueSlug(title: string, existingSlugs: Set<string>): string {
  const base = toSlug(title);
  let candidate = base;
  let counter = 2;
  while (existingSlugs.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}

async function fileListProperties(): Promise<Property[]> {
  const properties = await fileReadProperties();
  return properties.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

async function fileGetBySlug(slug: string): Promise<Property | null> {
  const properties = await fileReadProperties();
  return properties.find((p) => p.slug === slug) ?? null;
}

async function fileGetById(id: string): Promise<Property | null> {
  const properties = await fileReadProperties();
  return properties.find((p) => p.id === id) ?? null;
}

async function fileAdd(input: PropertyInput): Promise<Property> {
  const properties = await fileReadProperties();
  const now = new Date().toISOString();
  const normalized = normalizeInput(input);
  const existingSlugs = new Set(properties.map((p) => p.slug));

  const property: Property = {
    id: randomUUID(),
    slug: fileUniqueSlug(normalized.title, existingSlugs),
    createdAt: now,
    updatedAt: now,
    ...normalized,
  };

  properties.push(property);
  await fileWriteProperties(properties);
  return property;
}

async function fileUpdate(id: string, input: PropertyInput): Promise<Property | null> {
  const properties = await fileReadProperties();
  const index = properties.findIndex((p) => p.id === id);
  if (index < 0) return null;

  const current = properties[index];
  const normalized = normalizeInput(input);
  const existingSlugs = new Set(
    properties.filter((p) => p.id !== id).map((p) => p.slug)
  );

  const slug =
    current.title === normalized.title
      ? current.slug
      : fileUniqueSlug(normalized.title, existingSlugs);

  const updated: Property = {
    ...current,
    ...normalized,
    slug,
    updatedAt: new Date().toISOString(),
  };

  properties[index] = updated;
  await fileWriteProperties(properties);
  return updated;
}

async function fileDelete(id: string): Promise<boolean> {
  const properties = await fileReadProperties();
  const next = properties.filter((p) => p.id !== id);
  if (next.length === properties.length) return false;
  await fileWriteProperties(next);
  return true;
}

// ─── Public API — routes to correct backend automatically ─────────────────────

export async function listProperties(): Promise<Property[]> {
  noStore();
  return isSupabaseConfigured() ? supabaseListProperties() : fileListProperties();
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  noStore();
  return isSupabaseConfigured() ? supabaseGetBySlug(slug) : fileGetBySlug(slug);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  noStore();
  return isSupabaseConfigured() ? supabaseGetById(id) : fileGetById(id);
}

export async function addProperty(input: PropertyInput): Promise<Property> {
  return isSupabaseConfigured() ? supabaseAdd(input) : fileAdd(input);
}

export async function updateProperty(id: string, input: PropertyInput): Promise<Property | null> {
  return isSupabaseConfigured() ? supabaseUpdate(id, input) : fileUpdate(id, input);
}

export async function deleteProperty(id: string): Promise<boolean> {
  return isSupabaseConfigured() ? supabaseDelete(id) : fileDelete(id);
}
