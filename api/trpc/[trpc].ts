import type { IncomingMessage, ServerResponse } from "node:http";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../../server/routers";
import type { TrpcContext } from "../../server/_core/context";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "", "http://localhost");
  const path = url.pathname.replace(/^\/api\/trpc\/?/, "");

  return nodeHTTPRequestHandler({
    ...(req.method === "HEAD" ? { methodMapper: { HEAD: "GET" } } : {}),
    req,
    res,
    path,
    router: appRouter,
    createContext: async (): Promise<TrpcContext> => ({
      req: req as TrpcContext["req"],
      res: Object.assign(res, {
        clearCookie(name: string) {
          res.setHeader("Set-Cookie", `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=None; Secure`);
        },
      }) as TrpcContext["res"],
      user: null,
    }),
  });
}
