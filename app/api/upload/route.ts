import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isCurrentRequestAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function extensionForMimeType(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  return "jpg";
}

export async function POST(request: Request) {
  if (!isCurrentRequestAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP and AVIF images are supported." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image is too large. Max size is 10MB." },
      { status: 400 }
    );
  }

  const extension = extensionForMimeType(file.type);
  const filename = `${randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: store on Vercel Blob CDN
      const { put } = await import("@vercel/blob");
      const blob = await put(`properties/${filename}`, buffer, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    } else {
      // Local dev: store in public/uploads
      const { mkdir, writeFile } = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the uploaded file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
