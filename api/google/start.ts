import { createHmac } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { googleAuthorizationUrl } from "../../server/googleDrive";

export const config = { runtime: "nodejs" };

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  const issued = Date.now().toString();
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) {
    res.statusCode = 503;
    res.end("Google OAuth is not configured.");
    return;
  }
  const signature = createHmac("sha256", secret).update(issued).digest("hex");
  res.statusCode = 302;
  res.setHeader("Location", googleAuthorizationUrl(`${issued}.${signature}`));
  res.end();
}
