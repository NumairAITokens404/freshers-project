import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { exchangeGoogleCode } from "../../server/googleDrive";

export const config = { runtime: "nodejs" };

function validState(state: string, secret: string) {
  const [issued, signature] = state.split(".");
  if (!issued || !signature || Date.now() - Number(issued) > 10 * 60 * 1000)
    return false;
  const expected = createHmac("sha256", secret).update(issued).digest("hex");
  return (
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  );
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const url = new URL(req.url || "", "https://jashn.invalid");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!code || !secret || !validState(state, secret)) {
    res.statusCode = 400;
    res.end("Invalid or expired Google authorization request.");
    return;
  }
  try {
    const refreshToken = await exchangeGoogleCode(code);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(
      `<!doctype html><html><body style="font-family:system-ui;max-width:760px;margin:60px auto;padding:20px"><h1>Drive connected</h1><p>Copy this refresh token into Vercel as <strong>GOOGLE_REFRESH_TOKEN</strong>, then close this page.</p><textarea readonly style="width:100%;height:140px">${refreshToken}</textarea><p>Keep this value private. Do not share it or commit it to Git.</p></body></html>`
    );
  } catch (error) {
    res.statusCode = 500;
    res.end(
      error instanceof Error ? error.message : "Google authorization failed."
    );
  }
}
