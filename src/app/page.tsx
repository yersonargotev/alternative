'use client'; // Make this a Client Component

import FiltersAndSearch from '@/components/FiltersAndSearch';
import PaginationControls from '@/components/pagination-controls';
import ToolList from '@/components/tool-list';
import { Skeleton } from '@/components/ui/skeleton';
import { useToolsQuery } from '@/hooks/useToolsQuery';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { Suspense } from 'react';

// Define default limit outside component
const DEFAULT_LIMIT = 12;

// Wrapper component to allow Suspense for Nuqs parsers if needed
function HomePageContent() {
  // Get filter/sort/page state from URL using Nuqs
  const [query] = useQueryState('q', parseAsString.withDefault(''));
  const [tags] = useQueryState('tags', parseAsString.withDefault(''));
  const [sortBy] = useQueryState('sort', parseAsString.withDefault('score'));
  const [order] = useQueryState('order', parseAsString.withDefault('desc'));
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(DEFAULT_LIMIT));

  // Parse tags string to array
  const parsedTags = tags ? tags.split(',').filter(Boolean) : [];

  // Fetch tools data using React Query, passing Nuqs state
  const { data: toolsData, pagination, isLoading, isFetching, isPlaceholderData } = useToolsQuery({
    query,
    tags: parsedTags,
    sortBy: sortBy as 'score' | 'stars' | 'createdAt',
    order: order as 'asc' | 'desc',
    page,
    limit,
  });

  return (
    <div className="space-y-8">
      {/* Header Text */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Find Open Source & Better Alternatives
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover community-curated and trending tools.
        </p>
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
  // Generate UUID-like string for each key
  const generateId = () => Math.random().toString(36).substring(2, 9);
  const skeletonIds = Array.from({ length: DEFAULT_LIMIT }, () => generateId());

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Skeleton className="h-10 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" /> {/* Filter skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonIds.map((id) => (
          <Skeleton key={id} className="h-72 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
