import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage() {
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-full max-w-lg mb-4" />
                    <div className="flex gap-4">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            {/* Alternatives Section */}
            <div>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="space-y-4">
                    <div key="tool-alternative-skeleton-first" className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <Skeleton className="h-6 w-40 mb-1" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-12" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </div>
                    <div key="tool-alternative-skeleton-second" className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <Skeleton className="h-6 w-40 mb-1" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-12" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Suggest Alternative Placeholder */}
            <div>
                <Skeleton className="h-8 w-56 mb-4" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    );
}