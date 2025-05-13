import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

interface VoteStatusResponse {
	hasVoted: boolean;
}

// API function to fetch vote status
const fetchVoteStatus = async (
	toolId: number,
	userId: string | null | undefined,
): Promise<VoteStatusResponse> => {
	// Don't fetch if userId is explicitly undefined (Clerk loading) or null (logged out)
	if (userId === undefined || userId === null) {
		return { hasVoted: false };
	}

	const response = await fetch(`/api/votes?toolId=${toolId}`); // Use GET endpoint

	if (!response.ok) {
		// Handle specific errors if needed, e.g., 404
		console.error(`Failed to fetch vote status for tool ${toolId}`);
		// Return a default state or throw to let React Query handle the error
		return { hasVoted: false }; // Assume not voted on error for simplicity
		// throw new Error('Failed to fetch vote status');
	}

	return response.json();
};

export function useUserVoteStatus(toolId: number) {
	const { userId, isLoaded } = useAuth();

	const { data, isLoading, error, refetch } = useQuery<
		VoteStatusResponse,
		Error
	>({
		// Query key includes userId to refetch when auth state changes
		// Also includes toolId to fetch status for the specific tool
		queryKey: ["user-vote-status", toolId, userId],
		queryFn: () => fetchVoteStatus(toolId, userId),
		// Only enable the query once Clerk is loaded and we have a toolId
		enabled: isLoaded && !!toolId,
		staleTime: 5 * 60 * 1000, // 5 minutes (match server cache or adjust as needed)
		refetchOnWindowFocus: true, // Refetch if user votes in another tab
	});

	return {
		hasVoted: data?.hasVoted ?? false, // Default to false if data is not yet available
		isLoading: isLoading || !isLoaded, // Consider loading until Clerk is also loaded
		error,
		refetchVoteStatus: refetch, // Expose refetch function if needed elsewhere
	};
}
