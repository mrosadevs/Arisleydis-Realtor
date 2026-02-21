import { randomUUID } from "crypto";
import { access, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { toSlug } from "@/lib/slug";
import { Property, PropertyInput } from "@/lib/types";

const dataPath = path.join(process.cwd(), "data", "properties.json");

async function ensureDataFile(): Promise<void> {
  const dir = path.dirname(dataPath);
  await mkdir(dir, { recursive: true });

  try {
    await access(dataPath);
  } catch {
    await writeFile(dataPath, "[]", "utf8");
  }
}

async function readProperties(): Promise<Property[]> {
  await ensureDataFile();
  const raw = await readFile(dataPath, "utf8");

  try {
    const parsed = JSON.parse(raw) as Property[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

async function writeProperties(properties: Property[]): Promise<void> {
  await ensureDataFile();
  await writeFile(dataPath, JSON.stringify(properties, null, 2), "utf8");
}

function withUniqueSlug(title: string, existingSlugs: Set<string>): string {
  const base = toSlug(title);
  let candidate = base;
  let counter = 2;

  while (existingSlugs.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function normalizeInput(input: PropertyInput): PropertyInput {
  const images = input.images.filter(Boolean);

  return {
    ...input,
    title: input.title.trim(),
    city: input.city.trim(),
    address: input.address.trim(),
    type: input.type.trim(),
    description: input.description.trim(),
    features: input.features.map((feature) => feature.trim()).filter(Boolean),
    images
  };
}

export async function listProperties(): Promise<Property[]> {
  const properties = await readProperties();
  return properties.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const properties = await readProperties();
  return properties.find((property) => property.slug === slug) ?? null;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const properties = await readProperties();
  return properties.find((property) => property.id === id) ?? null;
}

export async function addProperty(input: PropertyInput): Promise<Property> {
  const properties = await readProperties();
  const now = new Date().toISOString();
  const normalized = normalizeInput(input);
  const existingSlugs = new Set(properties.map((property) => property.slug));

  const property: Property = {
    id: randomUUID(),
    slug: withUniqueSlug(normalized.title, existingSlugs),
    createdAt: now,
    updatedAt: now,
    ...normalized
  };

  properties.push(property);
  await writeProperties(properties);
  return property;
}

export async function updateProperty(id: string, input: PropertyInput): Promise<Property | null> {
  const properties = await readProperties();
  const index = properties.findIndex((property) => property.id === id);

  if (index < 0) {
    return null;
  }

  const current = properties[index];
  const normalized = normalizeInput(input);

  const existingSlugs = new Set(
    properties.filter((property) => property.id !== id).map((property) => property.slug)
  );

  const slug = current.title === normalized.title ? current.slug : withUniqueSlug(normalized.title, existingSlugs);

  const updated: Property = {
    ...current,
    ...normalized,
    slug,
    updatedAt: new Date().toISOString()
  };

  properties[index] = updated;
  await writeProperties(properties);
  return updated;
}

export async function deleteProperty(id: string): Promise<boolean> {
  const properties = await readProperties();
  const next = properties.filter((property) => property.id !== id);

  if (next.length === properties.length) {
    return false;
  }

  await writeProperties(next);
  return true;
}
