import { createHmac } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

export const config = { runtime: "nodejs" };

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  try {
    const issued = Date.now().toString();
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    if (!secret) throw new Error("GOOGLE_CLIENT_SECRET is not configured");
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not configured");
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!redirectUri) throw new Error("GOOGLE_REDIRECT_URI is not configured");
    const signature = createHmac("sha256", secret).update(issued).digest("hex");
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/drive.file");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("state", `${issued}.${signature}`);
    res.statusCode = 302;
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    res.setHeader("Location", authUrl.toString());
    res.end();
  } catch (error) {
    res.statusCode = 503;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(
      error instanceof Error
        ? `Google OAuth setup error: ${error.message}`
        : "Google OAuth is not configured."
    );
  }
}
