import { z } from "zod";

/**
 * Schema for user data from Clerk
 */
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

/**
 * Schema for user stats in the application
 */
export const userStatsSchema = z.object({
  userId: z.string(),
  voteCount: z.number().int().nonnegative(),
  submissionCount: z.number().int().nonnegative(),
});

export type User = z.infer<typeof userSchema>;
export type UserStats = z.infer<typeof userStatsSchema>;
