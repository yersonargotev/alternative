import QueryProvider from "@/components/providers/query-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider
			defaultOpen={true}
			className="grid h-dvh grid-rows-[auto_1fr]"
		>
			<ClerkProvider>
				<QueryProvider>
					<ThemeProvider
						attribute="class"
						disableTransitionOnChange
						defaultTheme="system"
					>
						<TooltipProvider delayDuration={0}>
							<Toaster position="bottom-right" richColors />
							<NuqsAdapter>{children}</NuqsAdapter>
						</TooltipProvider>
					</ThemeProvider>
				</QueryProvider>
			</ClerkProvider>
		</SidebarProvider>
	);

}
