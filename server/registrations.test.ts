import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { createRegistration } from "./db";
import { uploadToDrive } from "./googleDrive";
import { identitySchema } from "../shared/registration";
import type { TrpcContext } from "./_core/context";
vi.mock("./db", () => ({
  createRegistration: vi.fn(),
  getRegistrationById: vi.fn(),
}));
vi.mock("./googleDrive", async importOriginal => {
  const original = await importOriginal<typeof import("./googleDrive")>();
  return { ...original, uploadToDrive: vi.fn() };
});
const photo = "data:image/jpeg;base64,YQ==";
const valid = {
  name: "A Junior",
  rollNo: "25261A3201",
  email: "juniorcsb253201@mgit.ac.in",
};
const caller = appRouter.createCaller({
  user: null,
  req: { protocol: "https", headers: {} },
  res: {},
} as TrpcContext);
beforeEach(() => {
  vi.mocked(createRegistration).mockReset();
  vi.mocked(uploadToDrive).mockReset();
  vi.mocked(uploadToDrive).mockResolvedValue({
    id: "photo-1",
    name: "photo.jpg",
    webViewLink: "https://drive.google.com/photo-1",
  });
});
describe("CSB entry validation", () => {
  it.each([
    valid,
    {
      ...valid,
      rollNo: "26261A321234",
      email: "long.namecsb26321234@mgit.ac.in",
    },
    { ...valid, rollNo: " 25261a3201 ", email: " JUNIORCSB253201@MGIT.AC.IN " },
  ])("accepts allowed batches and variable numeric suffixes", value => {
    expect(identitySchema.safeParse(value).success).toBe(true);
  });
  it.each([
    { ...valid, email: "junior@gmail.com" },
    { ...valid, email: "juniorcsb243201@mgit.ac.in" },
    { ...valid, email: "juniorcsb253201@mgit.ac.in.evil.com" },
    { ...valid, email: "juniorcsb2532@mgit.ac.in" },
    { ...valid, rollNo: "25261A3301" },
    { ...valid, rollNo: "25261A32" },
    { ...valid, rollNo: "25261A3201EXTRA" },
    { ...valid, rollNo: "26261A3201" },
  ])("rejects invalid identities at the API boundary", async value => {
    await expect(caller.registrations.create(value)).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(createRegistration).not.toHaveBeenCalled();
  });
  it("saves a normalized identity and its Drive photo", async () => {
    vi.mocked(createRegistration).mockResolvedValue({ id: 42 });
    await expect(
      caller.registrations.create({
        ...valid,
        name: " A Junior ",
        rollNo: "25261a3201",
        photo,
      })
    ).resolves.toEqual({ id: 42, photoFileId: "photo-1" });
    expect(createRegistration).toHaveBeenCalledWith({
      ...valid,
      photoUrl: "https://drive.google.com/photo-1",
    });
  });
  it("returns an actionable duplicate registration error", async () => {
    vi.mocked(createRegistration).mockRejectedValue({
      cause: { code: "ER_DUP_ENTRY" },
    });
    await expect(
      caller.registrations.create({ ...valid, photo })
    ).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });
  it("never issues a successful registration when persistence fails", async () => {
    vi.mocked(createRegistration).mockRejectedValue(
      new Error("Database is not available")
    );
    await expect(
      caller.registrations.create({ ...valid, photo })
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: expect.stringContaining("guest list is unavailable"),
    });
  });
});
