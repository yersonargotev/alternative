import Providers from "@/app/providers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { AppSidebar } from "@/components/app-sidebar";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Tool Alternatives",
	description: "Discover open-source tools and alternatives.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body
				className={cn(geistSans.variable, geistMono.variable, "antialiased")}
			>
				<Providers>
					<div className="row-span-2 flex">
						<AppSidebar />
						<main className="flex flex-1 overflow-auto">
							<div className="grid flex-1">{children}</div>
						</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
