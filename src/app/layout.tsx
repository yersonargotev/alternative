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
	title: "FactuStorm",
	description: "FactuStorm",
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
					<AppSidebar />
					{children}
				</Providers>
			</body>
		</html>
	);
}
