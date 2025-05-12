import { z } from "zod";

export const voteSchema = z.object({
	id: z.number().int().positive(),
	userId: z.string().min(1), // Clerk User ID
	toolId: z.number().int().positive(),
	createdAt: z.date(),
});

export const createVoteSchema = voteSchema.omit({ id: true, createdAt: true });

export type Vote = z.infer<typeof voteSchema>;
export type CreateVote = z.infer<typeof createVoteSchema>;
