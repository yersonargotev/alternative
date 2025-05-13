"use client"; // Make this a Client Component

import FiltersAndSearch from "@/components/filter-and-search";
import PaginationControls from "@/components/pagination-controls";
import SuggestAlternativeDialog from "@/components/suggest-alternative-dialog";
import ToolList from "@/components/tool-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToolsQuery } from "@/hooks/useToolsQuery";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { PlusCircle } from "lucide-react";
import {
	createParser,
	parseAsInteger,
	parseAsString,
	parseAsStringEnum,
	useQueryState,
} from "nuqs";
import { Suspense } from "react";

// Define default limit outside component
const DEFAULT_LIMIT = 12;

// Custom parser for comma-separated tags
const parseAsTags = createParser({
	parse: (v: string) => v.split(",").filter(Boolean),
	serialize: (v: string[]) => v.join(","),
});

// Wrapper component to allow Suspense for Nuqs parsers if needed
function HomePageContent() {
	// Get filter/sort/page state from URL using Nuqs
	const [query] = useQueryState("q", parseAsString.withDefault(""));
	const [tags] = useQueryState("tags", parseAsTags.withDefault([]));
	const [sortBy] = useQueryState(
		"sort",
		parseAsStringEnum(["score", "stars", "createdAt"]).withDefault("score"),
	);
	const [order] = useQueryState(
		"order",
		parseAsStringEnum(["asc", "desc"]).withDefault("desc"),
	);
	const [page] = useQueryState("page", parseAsInteger.withDefault(1));
	const [limit] = useQueryState(
		"limit",
		parseAsInteger.withDefault(DEFAULT_LIMIT),
	); // Allow limit override via URL?

	// Fetch tools data using React Query, passing Nuqs state
	const {
		data: toolsData,
		pagination,
		isLoading,
		isFetching,
		isPlaceholderData,
	} = useToolsQuery({
		query,
		tags,
		sortBy,
		order,
		page,
		limit,
	});

	return (
		<div className="space-y-8">
			{/* Header Text */}
			<div className="text-center">
				<h1 className="mb-2 font-bold text-3xl tracking-tight md:text-4xl">
					Find Open Source & Better Alternatives
				</h1>
				<p className="text-lg text-muted-foreground">
					Discover community-curated and trending tools.
				</p>
				
				{/* Add Suggest Alternative Button for logged-in users */}
				<div className="mt-4 flex justify-center">
					<SignedIn>
						{/* Generic suggest alternative dialog for the home page */}
						<SuggestAlternativeDialog originalToolId={0} originalToolName="" />
					</SignedIn>
					<SignedOut>
						<Button variant="outline" onClick={() => {}}>
							<PlusCircle className="mr-2 h-4 w-4" />
							<SignInButton mode="modal">
								<span>Sign in to suggest alternatives</span>
							</SignInButton>
						</Button>
					</SignedOut>
				</div>
			</div>

			{/* Filters and Search Section */}
			<FiltersAndSearch />

			{/* Tool List Section */}
			<ToolList
				tools={toolsData}
				isLoading={isLoading}
				isFetching={isFetching}
				limit={limit}
			/>

			{/* Pagination Section */}
			{pagination && pagination.totalCount > 0 && (
				<PaginationControls
					currentPage={pagination.page}
					totalPages={pagination.totalPages}
					totalCount={pagination.totalCount}
					limit={pagination.limit}
					isPlaceholderData={isPlaceholderData}
				/>
			)}
		</div>
	);
}

// Main export using Suspense for Nuqs/Client Components
export default function HomePage() {
	return (
		// Suspense is good practice around client components using hooks like useQueryState
		// It prevents hydration errors if server/client rendering differs initially.
		<Suspense fallback={<HomePageLoadingSkeleton />}>
			<HomePageContent />
		</Suspense>
	);
}

// Simple skeleton for the whole page during initial Suspense fallback
function HomePageLoadingSkeleton() {
	return (
		<div className="space-y-8">
			<div className="text-center">
				<Skeleton className="mx-auto mb-2 h-10 w-3/4" />
				<Skeleton className="mx-auto h-6 w-1/2" />
			</div>
			<Skeleton className="h-32 w-full rounded-lg" /> {/* Filter skeleton */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{/* Pre-generate unique keys for static skeleton items */}
				{[
					"sk-card-1",
					"sk-card-2",
					"sk-card-3",
					"sk-card-4",
					"sk-card-5",
					"sk-card-6",
					"sk-card-7",
					"sk-card-8",
					"sk-card-9",
					"sk-card-10",
					"sk-card-11",
					"sk-card-12",
				]
					.slice(0, DEFAULT_LIMIT)
					.map((key) => (
						<Skeleton key={key} className="h-72 w-full rounded-lg" />
					))}
			</div>
		</div>
	);
}
