import { db } from "@/db";
import { tools } from "@/db/schema";
import { generateSlug } from "@/schemas";
import { githubTrendingResponseSchema } from "@/schemas/external";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const TRENDING_API_URL_DAILY =
	"https://raw.githubusercontent.com/findmio/github-trending-api/main/raw/day.json";
const MIN_STARS_TO_CONSIDER_FOR_ADD = 100; // Minimum total stars for a new trending repo to be added
const MIN_CURRENT_PERIOD_STARS_TO_ADD = 50; // Minimum stars in current period for a new repo

export async function GET(request: NextRequest) {
	// First check Clerk authentication if available
	const { userId } = await auth();
	
	// Then check for cron secret
	const cronSecret = process.env.CRON_SECRET;
	const authHeader = request.headers.get("authorization");
	
	// Allow access if user is authenticated with Clerk OR if the cron secret is valid
	if (!userId && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
		console.warn("[CRON_INGEST_TRENDS] Unauthorized attempt");
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	console.info("[CRON_INGEST_TRENDS] Starting GitHub trends ingestion...");
	let itemsAdded = 0;
	let itemsUpdated = 0;
	let itemsSkipped = 0;

	try {
		const response = await fetch(TRENDING_API_URL_DAILY, {
			next: { revalidate: 0 }, // Ensure fresh data for each cron run
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch trending data: ${response.statusText}`);
		}

		const trendingDataJson = await response.json();
		const parseResult =
			githubTrendingResponseSchema.safeParse(trendingDataJson);

		if (!parseResult.success) {
			console.error(
				"[CRON_INGEST_TRENDS] Failed to parse trending data:",
				parseResult.error.flatten(),
			);
			throw new Error("Invalid data structure from trending API.");
		}

		const trendingItems = parseResult.data;
		console.info(
			`[CRON_INGEST_TRENDS] Fetched ${trendingItems.length} trending items.`,
		);

		for (const item of trendingItems) {
			try {
				const repoUrl = item.url;
				const toolName = item.name;
				const description =
					item.description ||
					`Trending repository: ${item.author}/${item.name}`;
				const stars = item.stars;
				const forks = item.forks;
				const language = item.language;
				const currentPeriodStars = item.currentPeriodStars;

				// Check if tool already exists
				const existingTool = await db.query.tools.findFirst({
					where: eq(tools.repoUrl, repoUrl),
				});

				if (existingTool) {
					// Update existing tool's stats if they differ significantly
					if (
						existingTool.githubStars !== stars ||
						existingTool.githubForks !== forks
					) {
						await db
							.update(tools)
							.set({
								githubStars: stars,
								githubForks: forks,
								description: description, // Update description too
								// We don't get githubLastCommit from this API
								updatedAt: new Date(),
							})
							.where(eq(tools.id, existingTool.id));
						itemsUpdated++;
						console.info(`[CRON_INGEST_TRENDS] Updated: ${repoUrl}`);
					} else {
						// console.info(`[CRON_INGEST_TRENDS] No significant update needed for: ${repoUrl}`);
						itemsSkipped++; // Or just don't count it
					}
				} else {
					// Add new tool if it meets criteria
					if (
						stars >= MIN_STARS_TO_CONSIDER_FOR_ADD &&
						currentPeriodStars >= MIN_CURRENT_PERIOD_STARS_TO_ADD
					) {
						const slug = generateSlug(toolName);
						const newToolTags: string[] = [];
						if (language) {
							newToolTags.push(language);
						}
						// Add a "trending" tag or similar if desired
						// newToolTags.push("trending");

						await db.insert(tools).values({
							name: toolName,
							slug: slug,
							description: description,
							repoUrl: repoUrl,
							websiteUrl: "", // Website URL is not in this API, user can add later
							tags: newToolTags,
							githubStars: stars,
							githubForks: forks,
							status: "approved", // Auto-approve significant trending items
							// submittedByUserId: 'cron-job', // Or null
						});
						itemsAdded++;
						console.info(`[CRON_INGEST_TRENDS] Added new tool: ${repoUrl}`);
					} else {
						itemsSkipped++;
						// console.info(`[CRON_INGEST_TRENDS] Skipped adding (below threshold): ${repoUrl} (Stars: ${stars}, CurrentPeriod: ${currentPeriodStars})`);
					}
				}

				// TODO: AI-based alternative classification
				// For now, this cron job focuses on populating the tool catalog.
				// A separate process or manual effort would be needed to establish "alternative to" relationships.
				// Example:
				// if (isNewlyAdded || significantUpdate) {
				//   queueForAlternativeAnalysis({ name: toolName, description, repoUrl });
				// }
			} catch (itemError) {
				console.error(
					`[CRON_INGEST_TRENDS] Error processing item ${item.url}:`,
					itemError,
				);
				// Continue to next item
			}
		}

		// Invalidate cache for the tools list after processing all items
		if (itemsAdded > 0 || itemsUpdated > 0) {
			revalidateTag("tools-list");
			console.info("[CRON_INGEST_TRENDS] Invalidated tools-list cache tag.");
		}

		const summary = `Ingestion complete. Added: ${itemsAdded}, Updated: ${itemsUpdated}, Skipped/No-Op: ${itemsSkipped}.`;
		console.info(`[CRON_INGEST_TRENDS] ${summary}`);
		return NextResponse.json({
			message: "GitHub trends ingestion successful.",
			summary,
		});
	} catch (error) {
		console.error(
			"[CRON_INGEST_TRENDS] Critical error during ingestion:",
			error,
		);
		return NextResponse.json(
			{ message: "Internal Server Error during cron job execution." },
			{ status: 500 },
		);
	}
}
