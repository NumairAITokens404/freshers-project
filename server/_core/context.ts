import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
  protocol?: string;
};

export type ResponseLike = {
  clearCookie(name: string, options?: Record<string, unknown>): unknown;
};

export type TrpcContext = {
  req: RequestLike;
  res: ResponseLike;
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req as Request);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req as RequestLike,
    res: opts.res as ResponseLike,
    user,
  };
}
