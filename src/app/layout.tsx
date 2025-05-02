import Providers from "@/app/providers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

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
    <html lang="es">
      <body
        className={cn(
          "min-h-svh bg-background font-sans",
          geistSans.variable,
          geistMono.variable,
          "antialiased"
        )}
      >
        <div vaul-drawer-wrapper="">
          <div className="relative flex min-h-svh flex-col bg-background">
            <Providers>{children}</Providers>
          </div>
        </div>
      </body>
    </html>
  );
}
