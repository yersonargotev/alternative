"use client"; // Make this a Client Component

import FiltersAndSearch from "@/components/filter-and-search";
import PaginationControls from "@/components/pagination-controls";
import SuggestAlternativeDialog from "@/components/suggest-alternative-dialog";
import ToolList from "@/components/tool-list";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToolsQuery } from "@/hooks/useToolsQuery";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
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
		<SidebarInset>
			{/* Header with sidebar trigger */}
			<header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
				<div className="flex w-full items-center justify-between px-4">
					<div className="flex items-center gap-2">
						<SidebarTrigger className="-ml-1" />
						<h2 className="font-semibold text-xl">Tool Alternatives</h2>
					</div>

					<div className="flex items-center gap-2">
						<SignedIn>
							{/* Generic suggest alternative dialog for the home page */}
							<SuggestAlternativeDialog originalToolId={0} originalToolName="" />
						</SignedIn>
						<SignedOut>
							<Button variant="outline" size="sm">
								<SignInButton mode="modal">
									<span className="flex items-center gap-1">
										<PlusCircle className="h-4 w-4" />
										Sign In
									</span>
								</SignInButton>
							</Button>
						</SignedOut>
					</div>
				</div>
			</header>

			{/* Main content area */}
			<div className="flex flex-1 flex-col gap-6 p-6 pt-6">
				{/* Hero Section */}
				<section className="mx-auto max-w-5xl text-center">
					<h1 className="mb-3 font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">
						Find Open Source & Better Alternatives
					</h1>
					<p className="mb-6 text-lg text-muted-foreground md:text-xl">
						Discover community-curated and trending tools.
					</p>
				</section>

				{/* Filters and Search Section */}
				<div className="mx-auto w-full max-w-5xl rounded-lg border bg-card p-4 shadow-sm">
					<FiltersAndSearch />
				</div>

				{/* Tool List Section */}
				<div className="mx-auto w-full max-w-6xl">
					<ToolList
						tools={toolsData}
						isLoading={isLoading}
						isFetching={isFetching}
						limit={limit}
					/>

					{/* Pagination Section */}
					{pagination && pagination.totalCount > 0 && (
						<div className="mt-8">
							<PaginationControls
								currentPage={pagination.page}
								totalPages={pagination.totalPages}
								totalCount={pagination.totalCount}
								limit={pagination.limit}
								isPlaceholderData={isPlaceholderData}
							/>
						</div>
					)}
				</div>
			</div>
		</SidebarInset>
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
