"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type React from "react";
import { useState } from "react";

export default function QueryProvider({
	children,
}: { children: React.ReactNode }) {
	// Use useState to ensure QueryClient is only created once per component instance
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// Global default options
						staleTime: 60 * 1000, // 1 minute
						refetchOnWindowFocus: false, // Optional: disable refetch on window focus
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
