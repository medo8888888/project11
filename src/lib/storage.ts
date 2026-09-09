import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Local-disk attachment storage. Fine for a single-instance deployment or
// demo; swap for S3 / Vercel Blob / GCS before running multiple instances
// or anywhere the filesystem isn't persistent.
const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export async function saveUpload(projectId: string, fileName: string, buffer: Buffer) {
  const dir = path.join(UPLOAD_ROOT, projectId);
  await mkdir(dir, { recursive: true });
  const safeName = `${crypto.randomBytes(8).toString("hex")}-${sanitizeFileName(fileName)}`;
  const fullPath = path.join(dir, safeName);
  await writeFile(fullPath, buffer);
  return path.join(projectId, safeName); // stored as the relative `storagePath`
}

export async function readUpload(storagePath: string) {
  return readFile(path.join(UPLOAD_ROOT, storagePath));
}

export async function deleteUpload(storagePath: string) {
  await unlink(path.join(UPLOAD_ROOT, storagePath)).catch(() => {});
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}
