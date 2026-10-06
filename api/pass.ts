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
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as { name?: string; rollNo?: string; pdf?: string };
}

function safe(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") { res.statusCode = 405; res.end(JSON.stringify({ error: "Method not allowed" })); return; }
  try {
    const body = await readBody(req);
    const match = body.pdf?.match(/^data:application\/pdf;base64,([\s\S]+)$/);
    if (!body.name || !body.rollNo || !match) throw new Error("Pass data is incomplete");
    const data = Buffer.from(match[1], "base64");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: env("GOOGLE_CLIENT_ID"), client_secret: env("GOOGLE_CLIENT_SECRET"), refresh_token: env("GOOGLE_REFRESH_TOKEN"), grant_type: "refresh_token" }),
    });
    const tokenBody = await tokenResponse.json() as { access_token?: string; error_description?: string };
    if (!tokenResponse.ok || !tokenBody.access_token) throw new Error(tokenBody.error_description || "Google authorization failed");
    const boundary = `jashn_${crypto.randomUUID().replace(/-/g, "")}`;
    const metadata = JSON.stringify({ name: `${safe(body.rollNo)}_${safe(body.name)}_JASHN_PASS.pdf`, parents: [env("GOOGLE_DRIVE_PASSES_FOLDER_ID")] });
    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
      method: "POST", headers: { Authorization: `Bearer ${tokenBody.access_token}`, "Content-Type": `multipart/related; boundary=${boundary}` },
      body: Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`), data, Buffer.from(`\r\n--${boundary}--`)]),
    });
    const uploaded = await response.json() as { id?: string; error?: { message?: string } };
    if (!response.ok || !uploaded.id) throw new Error(uploaded.error?.message || "Pass upload failed");
    res.statusCode = 200; res.end(JSON.stringify({ id: uploaded.id }));
  } catch (error) {
    res.statusCode = 500; res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Pass upload failed" }));
  }
}
