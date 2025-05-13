import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage() {
	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col items-start justify-between gap-4 md:flex-row">
				<div>
					<Skeleton className="mb-2 h-9 w-64" />
					<Skeleton className="mb-4 h-5 w-full max-w-lg" />
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
				<Skeleton className="mb-4 h-8 w-48" />
				<div className="space-y-4">
					<div
						key="tool-alternative-skeleton-first"
						className="flex items-center justify-between rounded-lg border p-4"
					>
						<div>
							<Skeleton className="mb-1 h-6 w-40" />
							<Skeleton className="h-4 w-64" />
						</div>
						<div className="flex items-center gap-4">
							<Skeleton className="h-5 w-16" />
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-9 w-24" />
						</div>
					</div>
					<div
						key="tool-alternative-skeleton-second"
						className="flex items-center justify-between rounded-lg border p-4"
					>
						<div>
							<Skeleton className="mb-1 h-6 w-40" />
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
				<Skeleton className="mb-4 h-8 w-56" />
				<Skeleton className="h-10 w-32" />
			</div>
		</div>
	);
}
