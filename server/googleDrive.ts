const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function googleRedirectUri() {
  return required("GOOGLE_REDIRECT_URI");
}

export function googleAuthorizationUrl(state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", required("GOOGLE_CLIENT_ID"));
  url.searchParams.set("redirect_uri", googleRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "https://www.googleapis.com/auth/drive.file");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeGoogleCode(code: string) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: required("GOOGLE_CLIENT_ID"),
      client_secret: required("GOOGLE_CLIENT_SECRET"),
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  const body = (await response.json()) as {
    refresh_token?: string;
    error_description?: string;
  };
  if (!response.ok || !body.refresh_token)
    throw new Error(
      body.error_description || "Google did not return a refresh token"
    );
  return body.refresh_token;
}

async function accessToken() {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: required("GOOGLE_CLIENT_ID"),
      client_secret: required("GOOGLE_CLIENT_SECRET"),
      refresh_token: required("GOOGLE_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  });
  const body = (await response.json()) as {
    access_token?: string;
    error_description?: string;
  };
  if (!response.ok || !body.access_token)
    throw new Error(
      body.error_description || "Could not authorize Google Drive"
    );
  return body.access_token;
}

export async function uploadToDrive(input: {
  folderId: string;
  filename: string;
  mimeType: string;
  data: Buffer;
}) {
  if (!input.folderId) throw new Error("Google Drive folder is not configured");
  const token = await accessToken();
  const boundary = `jashn_${crypto.randomUUID().replace(/-/g, "")}`;
  const metadata = JSON.stringify({
    name: input.filename,
    parents: [input.folderId],
  });
  const before = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${input.mimeType}\r\n\r\n`
  );
  const after = Buffer.from(`\r\n--${boundary}--`);
  const response = await fetch(
    `${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,name,webViewLink`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: Buffer.concat([before, input.data, after]),
    }
  );
  const raw = await response.text();
  let body: {
    id?: string;
    name?: string;
    webViewLink?: string;
    error?: { message?: string };
  } = {};
  try {
    body = raw ? (JSON.parse(raw) as typeof body) : {};
  } catch {
    throw new Error(`Google Drive returned an invalid response (${response.status})`);
  }
  if (!response.ok || !body.id)
    throw new Error(body.error?.message || "Google Drive upload failed");
  return body;
}

export function decodeDataUrl(dataUrl: string, expectedPrefix: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!match || !match[1].startsWith(expectedPrefix))
    throw new Error("Invalid uploaded file data");
  return { mimeType: match[1], data: Buffer.from(match[2], "base64") };
}

export function safeFilePart(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
