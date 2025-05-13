'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    isPlaceholderData?: boolean; // From React Query
}

export default function PaginationControls({
    currentPage,
    totalPages,
    totalCount,
    limit,
    isPlaceholderData = false,
}: PaginationControlsProps) {
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

    const handlePrevious = () => {
        setPage(currentPage > 1 ? currentPage - 1 : 1);
    };

    const handleNext = () => {
        setPage(currentPage < totalPages ? currentPage + 1 : totalPages);
    };

    if (totalPages <= 1) {
        return null; // Don't show pagination if only one page
    }

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalCount);

    return (
        <div className="mt-8 flex items-center justify-between border-t pt-4">
            <div className="text-muted-foreground text-sm">
                Showing {startItem}-{endItem} of {totalCount} tools
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentPage <= 1 || isPlaceholderData}
                    aria-label="Go to previous page"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                </Button>
                <span className="w-16 text-center font-medium text-sm">
                    Page {currentPage} / {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentPage >= totalPages || isPlaceholderData}
                    aria-label="Go to next page"
                >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}