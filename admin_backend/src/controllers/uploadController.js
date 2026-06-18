import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../uploads");

function parseDataUrl(dataUrl = "") {
  const match = String(dataUrl).match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image payload.");
  }
  return {
    mimeType: match[1],
    base64Data: match[2]
  };
}

function extensionFromMime(mimeType = "") {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("gif")) return "gif";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("svg")) return "svg";
  return "bin";
}

export async function uploadImage(req, res) {
  const { dataUrl, filename = "upload" } = req.body;
  if (!dataUrl) {
    return res.status(400).json({ message: "Image data is required." });
  }

  const { mimeType, base64Data } = parseDataUrl(dataUrl);
  const ext = extensionFromMime(mimeType);
  const safeName = filename
    .toString()
    .replace(/[^a-z0-9_-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "upload";
  const finalName = `${safeName}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, finalName), Buffer.from(base64Data, "base64"));

  res.status(201).json({
    url: `/uploads/${finalName}`,
    fileName: finalName,
    mimeType
  });
}
