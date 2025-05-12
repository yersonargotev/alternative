import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { tools, votes } from "@/db/schema";
import { calculateScore, formatNumber, getFaviconUrl } from "@/lib/utils";
import { count, desc, eq, sql } from "drizzle-orm";
import { ArrowRight, Star, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Revalidate data periodically (e.g., every hour)
export const revalidate = 3600; // Revalidate every hour

async function getToolsData() {
  // Fetch approved tools and their vote counts
  // This query needs refinement for proper scoring and pagination later
  try {
    const results = await db
      .select({
        tool: tools,
        userVotesCount: count(votes.id),
      })
      .from(tools)
      .where(eq(tools.status, "approved"))
      .leftJoin(votes, eq(tools.id, votes.toolId))
      .groupBy(tools.id)
      .orderBy(
        desc(sql`(${tools.githubStars} * 0.8) + (count(${votes.id}) * 0.2)`),
      ) // Simple initial sort
      .limit(20); // Limit for initial display

    // Calculate score for each tool
    const toolsWithScores = results
      .map((r) => ({
        ...r.tool,
        userVotesCount: r.userVotesCount,
        score: calculateScore(r.tool.githubStars, r.userVotesCount),
      }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)); // Re-sort based on calculated score

    return toolsWithScores;
  } catch (error) {
    console.error("Error fetching tools:", error);
    return []; // Return empty array on error
  }
}

export default async function HomePage() {
  const toolsData = await getToolsData();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Find Open Source & Better Alternatives
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover community-curated and trending tools.
        </p>
        {/* Placeholder for Search and Filters - To be added in Part 9 */}
        <div className="mt-6 max-w-xl mx-auto">
          {/* <Input type="search" placeholder="Search tools (e.g., Figma, cd)..." className="w-full" /> */}
          <p className="text-sm text-muted-foreground mt-2">
            Search & filtering coming soon!
          </p>
        </div>
      </div>

      {/* Tool Grid */}
      {toolsData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolsData.map((tool) => (
            <Card key={tool.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Image
                    src={getFaviconUrl(tool.websiteUrl)}
                    alt={`${tool.name} favicon`}
                    width={24}
                    height={24}
                    className="rounded"
                    unoptimized // Necessary for external URLs like Google Favicons
                  />
                  <CardTitle className="text-xl hover:text-primary transition-colors">
                    <Link href={`/tool/${tool.slug}`}>{tool.name}</Link>
                  </CardTitle>
                </div>
                <CardDescription className="line-clamp-2 h-[40px]">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div className="flex flex-wrap gap-2">
                  {tool.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center gap-1"
                      title="GitHub Stars"
                    >
                      <Star className="w-4 h-4 text-yellow-500" />{" "}
                      {formatNumber(tool.githubStars)}
                    </span>
                    <span
                      className="flex items-center gap-1"
                      title="User Votes"
                    >
                      <ThumbsUp className="w-4 h-4 text-blue-500" />{" "}
                      {formatNumber(tool.userVotesCount)}
                    </span>
                  </div>
                  <span className="font-semibold text-primary">
                    {tool.score?.toFixed(1)} Score
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/tool/${tool.slug}`}>
                    View Details & Alternatives{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          No tools found. Try contributing one!
        </div>
      )}

      {/* Placeholder for Pagination - To be added in Part 9 */}
      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">Pagination coming soon!</p>
      </div>
    </div>
  );
}
