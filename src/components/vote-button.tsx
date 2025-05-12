'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';
import { ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface VoteButtonProps {
    toolId: number;
    initialVotes: number;
    // Add initialHasVoted prop later when fetching user-specific vote status
}

export default function VoteButton({ toolId, initialVotes }: VoteButtonProps) {
    const { userId, isLoaded } = useAuth();
    const router = useRouter();
    const [currentVotes, setCurrentVotes] = useState(initialVotes);
    const [hasVoted, setHasVoted] = useState(false); // Placeholder - needs server state
    const [isLoading, setIsLoading] = useState(false);

    // TODO: Fetch initial vote status for the current user

    const handleVote = async () => {
        if (!isLoaded) return; // Wait for Clerk to load

        if (!userId) {
            toast.error('Please log in to vote.');
            return;
        }

        if (hasVoted) {
            toast.error('You have already voted for this tool.');
            return; // Or implement un-voting
        }

        setIsLoading(true);

        try {
            // --- API Call Placeholder ---
            // Replace with actual API call using react-query mutation in Part 7/9
            console.log(`Attempting to vote for tool ${toolId} by user ${userId}`);
            // Simulating API call
            await new Promise(resolve => setTimeout(resolve, 500));
            // Assume success for now
            // const response = await fetch('/api/votes', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ toolId }),
            // });
            // if (!response.ok) {
            //   const errorData = await response.json();
            //   throw new Error(errorData.message || 'Failed to vote');
            // }
            // --- End API Call Placeholder ---

            setCurrentVotes((prev) => prev + 1);
            setHasVoted(true);
            toast.success('Vote Cast! Thank you for your feedback.');
            // Optionally refresh data if needed, though react-query handles this better
            // router.refresh();

        } catch (error) {
            console.error('Voting failed:', error);
            toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={hasVoted ? "default" : "outline"}
            size="sm"
            onClick={handleVote}
            disabled={isLoading || hasVoted || !isLoaded} // Disable while loading, if already voted, or if Clerk hasn't loaded
            aria-label={hasVoted ? "You have voted" : "Vote for this tool"}
        >
            <ThumbsUp className={`mr-2 h-4 w-4 ${hasVoted ? '' : ''}`} />
            {hasVoted ? 'Voted' : 'Vote'} ({currentVotes})
        </Button>
    );
}