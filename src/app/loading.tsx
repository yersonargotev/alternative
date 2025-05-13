import { Skeleton } from "@/components/ui/skeleton"; // Assuming Skeleton component exists
import { useMemo } from "react";

export default function Loading() {
	// Pre-generate stable keys that won't change between renders
	const stableKeys = useMemo(() => {
		return Array.from(
			{ length: 6 },
			(_, i) => `skeleton-${Math.random().toString(36).substring(2, 9)}-${i}`,
		);
	}, []);
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-1/4" />
				<Skeleton className="h-10 w-24" />
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{stableKeys.map((key) => (
					<div key={key} className="space-y-3 rounded-lg border p-4">
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
						<div className="flex items-center justify-between pt-2">
							<Skeleton className="h-5 w-16" />
							<Skeleton className="h-5 w-12" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
