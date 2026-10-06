import type { IncomingMessage, ServerResponse } from "node:http";

export const config = { runtime: "nodejs" };

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
    name?: string; rollNo?: string; email?: string; photo?: string;
  };
}

async function driveToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env("GOOGLE_CLIENT_ID"),
      client_secret: env("GOOGLE_CLIENT_SECRET"),
      refresh_token: env("GOOGLE_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  });
  const body = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !body.access_token) throw new Error(body.error_description || "Google authorization failed");
  return body.access_token;
}

async function uploadPhoto(filename: string, dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i);
  if (!match) throw new Error("Invalid photo data");
  const data = Buffer.from(match[2], "base64");
  if (data.byteLength > 2_000_000) throw new Error("Photo is too large");
  const boundary = `jashn_${crypto.randomUUID().replace(/-/g, "")}`;
  const metadata = JSON.stringify({ name: filename, parents: [env("GOOGLE_DRIVE_PHOTOS_FOLDER_ID")] });
  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
    method: "POST",
    headers: { Authorization: `Bearer ${await driveToken()}`, "Content-Type": `multipart/related; boundary=${boundary}` },
    body: Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${match[1]}\r\n\r\n`),
      data,
      Buffer.from(`\r\n--${boundary}--`),
    ]),
  });
  const body = await response.json() as { id?: string; error?: { message?: string } };
  if (!response.ok || !body.id) throw new Error(body.error?.message || "Photo upload failed");
  return body.id;
}

function safe(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }
  try {
    const body = await readBody(req);
    if (!body.name || !body.rollNo || !body.email || !body.photo) throw new Error("Registration details are incomplete");
    const id = Date.now();
    await uploadPhoto(`${safe(body.rollNo)}_${safe(body.name)}.jpg`, body.photo);
    res.statusCode = 200;
    res.end(JSON.stringify({ id }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Registration failed" }));
  }
}
