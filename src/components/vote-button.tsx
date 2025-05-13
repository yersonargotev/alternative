"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserVoteStatus } from "@/hooks/use-user-vote-status";
import { useVoteMutation } from "@/hooks/use-vote-mutation";
import { useAuth } from "@clerk/nextjs";
import { ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface VoteButtonProps {
	toolId: number;
	initialVotes: number; // Keep initial count for display before hydration/fetch
}

export default function VoteButton({ toolId, initialVotes }: VoteButtonProps) {
	const { userId, isLoaded: isClerkLoaded } = useAuth();
	const router = useRouter(); // Keep for potential refresh, though invalidateQueries is better

	// Local state for vote count - might be updated optimistically or via refetch
	const [displayVotes, setDisplayVotes] = useState(initialVotes);

	// Fetch user's vote status using React Query hook
	const { hasVoted, isLoading: isLoadingStatus } = useUserVoteStatus(toolId);

	// Get the mutation function and its loading state
	const { mutate: submitVote, isPending: isMutating } = useVoteMutation();

	// Update display count if initialVotes changes (e.g., SSR data updates)
	useEffect(() => {
		setDisplayVotes(initialVotes);
	}, [initialVotes]);

	const handleVoteToggle = () => {
		if (!isClerkLoaded) return; // Wait for Clerk

		if (!userId) {
			toast.error("Authentication Required", {
				description: "Please log in to vote.",
				action: {
					label: "Log In",
					onClick: () => {
						// Redirect to sign-in page
						window.location.href = "/sign-in";
					},
				},
			});
			return;
		}

		const action = hasVoted ? "remove" : "add";

		// Optimistic update - immediately update UI state before API call completes
		setDisplayVotes((prev) => prev + (action === "add" ? 1 : -1));

		submitVote(
			{ toolId, action },
			{
				onSuccess: (data) => {
					// onSuccess in useVoteMutation already handles toast and invalidation
					// If API returns new count, we could update state here
					// if (data.newVoteCount !== undefined) {
					//   setDisplayVotes(data.newVoteCount);
					// }
				},
				onError: (error) => {
					// Rollback optimistic update on error
					setDisplayVotes((prev) => prev + (action === "add" ? -1 : 1));
					// Error toast is handled in useVoteMutation
				},
			},
		);
	};

	// Show skeleton while Clerk or vote status is loading
	if (isLoadingStatus || !isClerkLoaded) {
		return <Skeleton className="h-9 w-28 rounded-md" />;
	}

	const isDisabled = isMutating; // Disable button during mutation

	return (
		<Button
			variant={hasVoted ? "default" : "outline"}
			size="sm"
			onClick={handleVoteToggle}
			disabled={isDisabled}
			aria-label={hasVoted ? "Remove your vote" : "Vote for this tool"}
			className="min-w-[110px]" // Ensure minimum width to prevent layout shifts
		>
			<ThumbsUp
				className={`mr-2 h-4 w-4 transition-colors ${hasVoted ? "text-white" : ""}`}
			/>
			{isMutating ? "..." : hasVoted ? "Voted" : "Vote"} (
			{formatDisplayVotes(displayVotes)})
		</Button>
	);
}

// Helper to format votes consistently (could be moved to utils)
function formatDisplayVotes(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}k`;
	}
	return count.toString();
}
