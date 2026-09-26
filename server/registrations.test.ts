import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("registrations.create", () => {
  it("rejects an invalid email before reaching the database", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.registrations.create({
        name: "A Junior",
        rollNo: "CSB26-001",
        email: "not-an-email",
        photoUrl: "https://drive.google.com/file/d/photo",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects a non-url photo link before reaching the database", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.registrations.create({
        name: "A Junior",
        rollNo: "CSB26-002",
        email: "junior@example.com",
        photoUrl: "drive-file-id-only",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
