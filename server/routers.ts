import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createRegistration, getRegistrationById } from "./db";
import { identitySchema } from "../shared/registration";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { decodeDataUrl, safeFilePart, uploadToDrive } from "./googleDrive";

const registrationInput = identitySchema.and(
  z.object({ photo: z.string().max(3_000_000) })
);

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  registrations: router({
    create: publicProcedure
      .input(registrationInput)
      .mutation(async ({ input }) => {
        try {
          const { photo, ...identity } = input;
          const decoded = decodeDataUrl(photo, "image/");
          if (decoded.data.byteLength > 2_500_000)
            throw new Error("Processed photo is too large");
          const file = await uploadToDrive({
            folderId: process.env.GOOGLE_DRIVE_PHOTOS_FOLDER_ID || "",
            filename: `${safeFilePart(identity.rollNo)}_${safeFilePart(identity.name)}.jpg`,
            mimeType: decoded.mimeType,
            data: decoded.data,
          });
          const created = await createRegistration({
            ...identity,
            photoUrl: file.webViewLink || file.id || "",
          });
          return { ...created, photoFileId: file.id };
        } catch (error) {
          const cause = error as { code?: string; cause?: { code?: string } };
          if (
            cause.code === "ER_DUP_ENTRY" ||
            cause.cause?.code === "ER_DUP_ENTRY"
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "This roll number is already on the guest list. Contact your CSB organisers if you need a replacement pass.",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "The guest list is unavailable right now. Your details are still here — please try again shortly.",
          });
        }
      }),
    uploadPass: publicProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          name: z.string().min(2).max(180),
          rollNo: z.string().min(1).max(80),
          pdf: z.string().max(6_000_000),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const registration = await getRegistrationById(input.id);
          if (!registration || registration.rollNo !== input.rollNo)
            throw new Error("Registration could not be verified");
          const decoded = decodeDataUrl(input.pdf, "application/pdf");
          if (decoded.data.byteLength > 4_000_000)
            throw new Error("Pass PDF is too large");
          const file = await uploadToDrive({
            folderId: process.env.GOOGLE_DRIVE_PASSES_FOLDER_ID || "",
            filename: `${safeFilePart(input.rollNo)}_${safeFilePart(input.name)}_JASHN_PASS.pdf`,
            mimeType: "application/pdf",
            data: decoded.data,
          });
          return { fileId: file.id };
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Your pass downloaded, but its Drive backup failed. Please tell an organiser.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
