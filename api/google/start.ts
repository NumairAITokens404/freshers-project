import { createHmac } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { googleAuthorizationUrl } from "../../server/googleDrive";

export const config = { runtime: "nodejs" };

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  try {
    const issued = Date.now().toString();
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    if (!secret) throw new Error("GOOGLE_CLIENT_SECRET is not configured");
    const signature = createHmac("sha256", secret).update(issued).digest("hex");
    res.statusCode = 302;
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    res.setHeader("Location", googleAuthorizationUrl(`${issued}.${signature}`));
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
