import { z } from "zod";

export const githubTrendingBuiltBySchema = z.object({
	href: z.string().url().optional(),
	avatar: z.string().url().optional(),
	username: z.string().optional(),
});

export const githubTrendingItemSchema = z.object({
	author: z.string(),
	name: z.string(),
	avatar: z.string().url(),
	sponsorUrl: z.string().url().optional().nullable(), // Renamed from 'sponsor' for clarity
	url: z
		.string()
		.url()
		.refine((val) => val.startsWith("https://github.com/"), {
			message: "URL must be a GitHub repository URL",
		}),
	description: z.string().nullable().optional(),
	language: z.string().nullable().optional(),
	languageColor: z.string().nullable().optional(),
	stars: z.number().int().nonnegative(),
	forks: z.number().int().nonnegative(), // Renamed from 'fork' for consistency
	currentPeriodStars: z.number().int().nonnegative(),
	builtBy: z.array(githubTrendingBuiltBySchema).optional(),
});

export const githubTrendingResponseSchema = z.array(githubTrendingItemSchema);

export type GithubTrendingItem = z.infer<typeof githubTrendingItemSchema>;
