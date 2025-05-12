import type { CreateToolSuggestion } from "@/schemas"; // Import the Zod schema type
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// Define the expected response
interface SuggestToolResponse {
	success: boolean;
	message?: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	tool?: any; // Optionally return the created (pending) tool data
}

// API function
const postSuggestion = async (
	payload: CreateToolSuggestion,
): Promise<SuggestToolResponse> => {
	const response = await fetch("/api/tools/suggest", {
		// Target API endpoint from Part 7
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to submit suggestion");
	}

	return response.json();
};

export function useSuggestToolMutation() {
	const mutation = useMutation<
		SuggestToolResponse,
		Error,
		CreateToolSuggestion
	>({
		mutationFn: postSuggestion,
		onSuccess: (data) => {
			toast("Suggestion Submitted!", {
				description:
					data.message || "Thank you! Your suggestion will be reviewed.",
			});

			// Optionally invalidate queries if suggestions are displayed somewhere immediately
			// queryClient.invalidateQueries({ queryKey: ['pending-suggestions'] }); // Example
		},
		onError: (error) => {
			toast.error(error.message || "An unknown error occurred.");
		},
	});

	return mutation;
}
