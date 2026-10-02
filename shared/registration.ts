import { z } from "zod";

export const CSB_MESSAGE =
  "Nice try, undercover disco agent 🕵️ This floor is CSB-only. Use your MGIT CSB email and roll number.";
export const identitySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Give us your full name — at least 2 characters.")
      .max(180),
    rollNo: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^(25|26)261A32[0-9]+$/, CSB_MESSAGE)
      .max(80),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(CSB_MESSAGE)
      .max(320)
      .regex(/^[a-z0-9._%+-]+csb(25|26)32[0-9]+@mgit\.ac\.in$/, CSB_MESSAGE),
  })
  .superRefine((value, ctx) => {
    const batch = value.email.match(/csb(25|26)32[0-9]+@/);
    if (batch && !value.rollNo.startsWith(batch[1])) {
      ctx.addIssue({
        code: "custom",
        path: ["rollNo"],
        message:
          "Time traveller detected 🪩 Your email and roll number need to belong to the same batch.",
      });
    }
  });
export type Guest = z.infer<typeof identitySchema>;
