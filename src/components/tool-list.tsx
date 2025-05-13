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
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import type { ToolWithVotes } from "@/lib/data/tools";
import { formatNumber, getFaviconUrl } from "@/lib/utils";
import { ArrowRight, Star, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ToolListProps {
	tools: ToolWithVotes[];
	isLoading: boolean;
	isFetching: boolean; // For background fetch indication
	limit: number; // To render skeletons
}

export default function ToolList({
	tools,
	isLoading,
	isFetching,
	limit,
}: ToolListProps) {
	if (isLoading) {
		// Show skeleton loaders on initial load
		return (
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{[...Array(limit)].map((_, i) => (
					<Card key={`skeleton-${i}-${Date.now()}`} className="flex flex-col">
						<CardHeader>
							<div className="mb-2 flex items-center gap-3">
								<Skeleton className="h-6 w-6 rounded" />
								<Skeleton className="h-6 w-3/4" />
							</div>
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
						</CardHeader>
						<CardContent className="flex-grow space-y-3">
							<div className="flex flex-wrap gap-2">
								<Skeleton className="h-5 w-12 rounded-full" />
								<Skeleton className="h-5 w-16 rounded-full" />
							</div>
							<div className="flex items-center justify-between pt-2 text-sm">
								<div className="flex items-center gap-3">
									<Skeleton className="h-5 w-16" />
									<Skeleton className="h-5 w-12" />
								</div>
								<Skeleton className="h-5 w-10" />
							</div>
						</CardContent>
						<CardFooter>
							<Skeleton className="h-9 w-full" />
						</CardFooter>
					</Card>
				))}
			</div>
		);
	}

	if (!isLoading && tools.length === 0) {
		return (
			<div className="col-span-full py-10 text-center text-muted-foreground">
				No tools found matching your criteria. Try adjusting the filters or
				search term.
			</div>
		);
	}

	return (
		<div
			className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-75 transition-opacity duration-300" : ""}`}
		>
			{tools.map((tool) => (
				<Card key={tool.id} className="flex flex-col">
					<CardHeader>
						<div className="mb-2 flex items-center gap-3">
							<Image
								src={getFaviconUrl(tool.websiteUrl)}
								alt={`${tool.name} favicon`}
								width={24}
								height={24}
								className="rounded"
								unoptimized
							/>
							<CardTitle className="text-xl transition-colors hover:text-primary">
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
							{tool.tags && tool.tags.length > 3 && (
								<Badge variant="outline">+{tool.tags.length - 3}</Badge>
							)}
						</div>
						<div className="flex items-center justify-between pt-2 text-muted-foreground text-sm">
							<div className="flex items-center gap-3">
								<span className="flex items-center gap-1" title="GitHub Stars">
									<Star className="h-4 w-4 text-yellow-500" />{" "}
									{formatNumber(tool.githubStars)}
								</span>
								<span className="flex items-center gap-1" title="User Votes">
									<ThumbsUp className="h-4 w-4 text-blue-500" />{" "}
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
	);
}
