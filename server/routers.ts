import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createRegistration } from "./db";
import { identitySchema } from "../shared/registration";
import { TRPCError } from "@trpc/server";

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
      .input(identitySchema)
      .mutation(async ({ input }) => {
        try {
          // Photos remain on the guest's device until photo storage is connected.
          return await createRegistration({ ...input, photoUrl: "" });
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
  }),
});

export type AppRouter = typeof appRouter;
