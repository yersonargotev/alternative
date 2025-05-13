import type { GetToolsParams, ToolWithVotes } from "@/lib/data/tools"; // Reuse types
import { useQuery } from "@tanstack/react-query";

interface ToolsApiResponse {
	data: ToolWithVotes[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
	};
}

// API function to fetch tools
const fetchTools = async (
	params: GetToolsParams,
): Promise<ToolsApiResponse> => {
	const query = new URLSearchParams();

	// Append parameters only if they have values
	if (params.page) query.append("page", params.page.toString());
	if (params.limit) query.append("limit", params.limit.toString());
	if (params.query) query.append("query", params.query);
	if (params.tags && params.tags.length > 0)
		query.append("tags", params.tags.join(","));
	if (params.sortBy) query.append("sortBy", params.sortBy);
	if (params.order) query.append("order", params.order);

	const response = await fetch(`/api/tools?${query.toString()}`);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to fetch tools");
	}

	return response.json();
};

export function useToolsQuery(params: GetToolsParams) {
	// The query key includes all parameters that affect the query result
	const queryKey = ["tools-list", params];

	const { data, isLoading, isError, error, isFetching, isPlaceholderData } =
		useQuery<ToolsApiResponse, Error>({
			queryKey: queryKey,
			queryFn: () => fetchTools(params),
			placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
			staleTime: 5 * 60 * 1000, // 5 minutes
			// Refetching might be handled by Nuqs updates triggering re-renders
			// refetchOnWindowFocus: false,
		});

	return {
		data: data?.data ?? [], // Default to empty array
		pagination: data?.pagination,
		isLoading, // Initial load state
		isFetching, // Background fetching state
		isError,
		error,
		isPlaceholderData, // Useful for pagination UX
	};
}
