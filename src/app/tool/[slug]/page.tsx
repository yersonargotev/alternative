
import SuggestAlternativeDialog from "@/components/suggest-alternative-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import VoteButton from "@/components/vote-button";
import { db } from "@/db";
import { toolAlternatives, tools, votes } from "@/db/schema";
import { calculateScore, formatNumber, getFaviconUrl } from "@/lib/utils";
import { and, count, desc, eq, sql } from "drizzle-orm";
import {
    ExternalLink,
    GitFork,
    Github,
    MessageSquareWarning,
    Star,
    ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type ToolPageProps = {
    params: { slug: string };
};

// Generate static paths for approved tools at build time (optional, good for SEO)
export async function generateStaticParams() {
    try {
        const approvedTools = await db
            .select({ slug: tools.slug })
            .from(tools)
            .where(eq(tools.status, "approved"))
            .limit(100); // Limit static generation for performance

        return approvedTools.map((tool) => ({
            slug: tool.slug,
        }));
    } catch (error) {
        console.error("Error generating static params:", error);
        return [];
    }
}

async function getToolDetails(slug: string) {
    try {
        // 1. Fetch the main tool by slug
        const mainToolResult = await db
            .select({
                tool: tools,
                userVotesCount: count(votes.id),
            })
            .from(tools)
            .where(and(eq(tools.slug, slug), eq(tools.status, "approved"))) // Ensure it's approved
            .leftJoin(votes, eq(tools.id, votes.toolId))
            .groupBy(tools.id)
            .limit(1);

        if (!mainToolResult || mainToolResult.length === 0) {
            return null; // Tool not found or not approved
        }

        const mainTool = {
            ...mainToolResult[0].tool,
            userVotesCount: mainToolResult[0].userVotesCount,
            score: calculateScore(
                mainToolResult[0].tool.githubStars,
                mainToolResult[0].userVotesCount,
            ),
        };

        // 2. Fetch its alternatives
        const alternativesQuery = db
            .select({
                alternative: tools,
                userVotesCount: count(votes.id),
            })
            .from(toolAlternatives)
            .innerJoin(tools, eq(toolAlternatives.alternativeToolId, tools.id))
            .where(
                and(
                    eq(toolAlternatives.originalToolId, mainTool.id),
                    eq(tools.status, "approved"), // Only show approved alternatives
                ),
            )
            .leftJoin(votes, eq(tools.id, votes.toolId))
            .groupBy(tools.id)
            .orderBy(
                desc(sql`(${tools.githubStars} * 0.8) + (count(${votes.id}) * 0.2)`),
            ); // Sort alternatives by score

        // 3. Fetch tools for which this tool is an alternative
        const alternativeToQuery = db
            .select({
                original: tools,
                userVotesCount: count(votes.id),
            })
            .from(toolAlternatives)
            .innerJoin(tools, eq(toolAlternatives.originalToolId, tools.id))
            .where(
                and(
                    eq(toolAlternatives.alternativeToolId, mainTool.id),
                    eq(tools.status, "approved"), // Only show approved originals
                ),
            )
            .leftJoin(votes, eq(tools.id, votes.toolId))
            .groupBy(tools.id)
            .orderBy(
                desc(sql`(${tools.githubStars} * 0.8) + (count(${votes.id}) * 0.2)`),
            ); // Sort by score

        const [alternativesResult, alternativeToResult] = await Promise.all([
            alternativesQuery,
            alternativeToQuery,
        ]);

        const alternatives = alternativesResult
            .map((r) => ({
                ...r.alternative,
                userVotesCount: r.userVotesCount,
                score: calculateScore(r.alternative.githubStars, r.userVotesCount),
            }))
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)); // Re-sort based on calculated score

        const alternativeTo = alternativeToResult
            .map((r) => ({
                ...r.original,
                userVotesCount: r.userVotesCount,
                score: calculateScore(r.original.githubStars, r.userVotesCount),
            }))
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)); // Re-sort based on calculated score

        return {
            tool: mainTool,
            alternatives,
            alternativeTo,
        };
    } catch (error) {
        console.error(`Error fetching tool details for slug ${slug}:`, error);
        return null; // Return null on error
    }
}

export default async function ToolDetailPage({ params }: ToolPageProps) {
    const data = await getToolDetails(params.slug);

    if (!data) {
        notFound(); // Trigger 404 page if tool not found or error occurred
    }

    const { tool, alternatives, alternativeTo } = data;

    return (
        <div className="space-y-8">
            {/* Tool Header */}
            <section>
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-4">
                    <div className="flex items-center gap-4">
                        <Image
                            src={getFaviconUrl(tool.websiteUrl)}
                            alt={`${tool.name} favicon`}
                            width={48}
                            height={48}
                            className="rounded-lg"
                            unoptimized
                        />
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                {tool.name}
                            </h1>
                            <p className="text-lg text-muted-foreground mt-1">
                                {tool.description}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0 mt-2 md:mt-0">
                        <span className="flex items-center gap-1" title="GitHub Stars">
                            <Star className="w-4 h-4 text-yellow-500" />{" "}
                            {formatNumber(tool.githubStars)}
                        </span>
                        <span className="flex items-center gap-1" title="GitHub Forks">
                            <GitFork className="w-4 h-4" /> {formatNumber(tool.githubForks)}
                        </span>
                        <span className="flex items-center gap-1" title="Open Issues">
                            <MessageSquareWarning className="w-4 h-4" />{" "}
                            {formatNumber(tool.githubIssues)}
                        </span>
                        <span
                            className="flex items-center gap-1 font-semibold text-primary"
                            title="User Votes"
                        >
                            <ThumbsUp className="w-4 h-4 text-blue-500" />{" "}
                            {formatNumber(tool.userVotesCount)}
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    {tool.websiteUrl && (
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={tool.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Website <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    )}
                    {tool.repoUrl && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={tool.repoUrl} target="_blank" rel="noopener noreferrer">
                                GitHub <Github className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    )}
                    {/* Vote Button Placeholder - Requires Client Component */}
                    <VoteButton toolId={tool.id} initialVotes={tool.userVotesCount} />
                    <span className="text-lg font-bold text-primary ml-auto">
                        {tool.score?.toFixed(1)} Score
                    </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {tool.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </section>

            <Separator />

            {/* Alternatives Section */}
            <section>
                <h2 className="text-2xl font-semibold tracking-tight mb-4">
                    Alternatives to {tool.name}
                </h2>
                {alternatives.length > 0 ? (
                    <div className="space-y-4">
                        {alternatives.map((alt) => (
                            <Card
                                key={alt.id}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4"
                            >
                                <div className="flex items-center gap-3 flex-grow">
                                    <Image
                                        src={getFaviconUrl(alt.websiteUrl)}
                                        alt={`${alt.name} favicon`}
                                        width={24}
                                        height={24}
                                        className="rounded flex-shrink-0"
                                        unoptimized
                                    />
                                    <div>
                                        <Link
                                            href={`/tool/${alt.slug}`}
                                            className="font-semibold text-lg hover:underline"
                                        >
                                            {alt.name}
                                        </Link>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {alt.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0 w-full sm:w-auto justify-end">
                                    <span
                                        className="flex items-center gap-1"
                                        title="GitHub Stars"
                                    >
                                        <Star className="w-4 h-4 text-yellow-500" />{" "}
                                        {formatNumber(alt.githubStars)}
                                    </span>
                                    <span className="flex items-center gap-1" title="User Votes">
                                        <ThumbsUp className="w-4 h-4 text-blue-500" />{" "}
                                        {formatNumber(alt.userVotesCount)}
                                    </span>
                                    <span className="font-semibold text-primary w-16 text-right">
                                        {alt.score?.toFixed(1)} Score
                                    </span>
                                    <Button variant="secondary" size="sm" asChild>
                                        <Link href={`/tool/${alt.slug}`}>View</Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No alternatives found yet.</p>
                )}
                {/* Suggest Alternative Placeholder - Requires Client Component */}
                <div className="mt-6">
                    <SuggestAlternativeDialog
                        originalToolId={tool.id}
                        originalToolName={tool.name}
                    />
                </div>
            </section>

            {/* Alternative To Section (Optional) */}
            {alternativeTo.length > 0 && (
                <>
                    <Separator />
                    <section>
                        <h2 className="text-2xl font-semibold tracking-tight mb-4">
                            {tool.name} is an alternative to:
                        </h2>
                        <div className="space-y-4">
                            {alternativeTo.map((orig) => (
                                <Card
                                    key={orig.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4"
                                >
                                    <div className="flex items-center gap-3 flex-grow">
                                        <Image
                                            src={getFaviconUrl(orig.websiteUrl)}
                                            alt={`${orig.name} favicon`}
                                            width={24}
                                            height={24}
                                            className="rounded flex-shrink-0"
                                            unoptimized
                                        />
                                        <div>
                                            <Link
                                                href={`/tool/${orig.slug}`}
                                                className="font-semibold text-lg hover:underline"
                                            >
                                                {orig.name}
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {orig.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0 w-full sm:w-auto justify-end">
                                        <span
                                            className="flex items-center gap-1"
                                            title="GitHub Stars"
                                        >
                                            <Star className="w-4 h-4 text-yellow-500" />{" "}
                                            {formatNumber(orig.githubStars)}
                                        </span>
                                        <span
                                            className="flex items-center gap-1"
                                            title="User Votes"
                                        >
                                            <ThumbsUp className="w-4 h-4 text-blue-500" />{" "}
                                            {formatNumber(orig.userVotesCount)}
                                        </span>
                                        <span className="font-semibold text-primary w-16 text-right">
                                            {orig.score?.toFixed(1)} Score
                                        </span>
                                        <Button variant="secondary" size="sm" asChild>
                                            <Link href={`/tool/${orig.slug}`}>View</Link>
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
