"use client";

import type { ToolWithVotes } from "@/lib/data/tools";
import { useQuery } from "@tanstack/react-query";

interface ToolsQueryParams {
	query?: string;
	tags?: string[];
	sortBy?: "score" | "stars" | "createdAt";
	order?: "asc" | "desc";
	page?: number;
	limit?: number;
}

interface PaginationInfo {
	page: number;
	totalPages: number;
	totalCount: number;
	limit: number;
}

interface ToolsQueryResult {
	data: ToolWithVotes[];
	pagination: PaginationInfo;
	isLoading: boolean;
	isFetching: boolean;
	isPlaceholderData: boolean;
}

// Convert query parameters to URL search params
function buildQueryString(params: ToolsQueryParams): string {
	const searchParams = new URLSearchParams();

	if (params.query) searchParams.set("q", params.query);
	if (params.tags?.length) searchParams.set("tags", params.tags.join(","));
	if (params.sortBy) searchParams.set("sort", params.sortBy);
	if (params.order) searchParams.set("order", params.order);
	if (params.page) searchParams.set("page", params.page.toString());
	if (params.limit) searchParams.set("limit", params.limit.toString());

	return searchParams.toString();
}

export function useToolsQuery({
	query = "",
	tags = [],
	sortBy = "score",
	order = "desc",
	page = 1,
	limit = 12,
}: ToolsQueryParams): ToolsQueryResult {
	const queryKey = ["tools", { query, tags, sortBy, order, page, limit }];

	const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
		queryKey,
		queryFn: async () => {
			const queryString = buildQueryString({
				query,
				tags,
				sortBy,
				order,
				page,
				limit,
			});
			const response = await fetch(`/api/tools?${queryString}`);

			if (!response.ok) {
				throw new Error("Failed to fetch tools");
			}

			return response.json();
		},
		placeholderData: (previousData) => previousData,
		staleTime: 1000 * 60, // 1 minute
	});

	// Provide defaults if data isn't available yet
	const toolsData = data?.tools || [];
	const pagination = data?.pagination || {
		page,
		limit,
		totalCount: 0,
		totalPages: 0,
	};

	return {
		data: toolsData,
		pagination,
		isLoading,
		isFetching,
		isPlaceholderData: isPlaceholderData || false,
	};
}
