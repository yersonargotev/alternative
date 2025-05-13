import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Define the structure of the data sent to the API
interface VotePayload {
	toolId: number;
}

// Define the expected response (can be simple success or more complex)
interface VoteResponse {
	success: boolean;
	message?: string;
	newVoteCount?: number; // Optional: API could return the new count
}

// API function (replace with actual fetch call to your API endpoint)
const postVote = async (payload: VotePayload): Promise<VoteResponse> => {
	const response = await fetch("/api/votes", {
		// Target API endpoint from Part 7
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to cast vote");
	}

	return response.json();
};

// Optional: API function for removing a vote
const deleteVote = async (payload: VotePayload): Promise<VoteResponse> => {
	const response = await fetch("/api/votes", {
		// Use the same endpoint with DELETE
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload), // Send toolId in body or as query param
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to remove vote");
	}
	return response.json();
};

export function useVoteMutation() {
	const queryClient = useQueryClient();

	const mutation = useMutation<
		VoteResponse,
		Error,
		{ toolId: number; action: "add" | "remove" }
	>({
		mutationFn: ({ toolId, action }) => {
			if (action === "add") {
				return postVote({ toolId });
			}
			return deleteVote({ toolId });
		},
		onSuccess: (data, variables) => {
			toast.success(
				variables.action === "add" ? "Vote Cast!" : "Vote Removed",
				{
					description:
						data.message ||
						(variables.action === "add"
							? "Thank you for your feedback."
							: "Your vote has been removed."),
				},
			);

			// Invalidate relevant queries to refetch data
			// 1. Invalidate the specific tool's details to update vote count/status
			queryClient.invalidateQueries({
				queryKey: ["tool-details", variables.toolId],
			}); // Assuming toolId is part of the key
			// 2. Invalidate the user's vote status query
			queryClient.invalidateQueries({
				queryKey: ["user-vote-status", variables.toolId],
			});
			// 3. Invalidate the main tools list if sorting/display depends on votes
			queryClient.invalidateQueries({ queryKey: ["tools-list"] });

			// Optional: Optimistic updates could be implemented here for a smoother UX
		},
		onError: (error) => {
			toast.error(error.message || "An unknown error occurred.");
		},
	});

	return mutation;
}
