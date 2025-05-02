import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        className={`min-h-svh bg-background font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div vaul-drawer-wrapper="">
          <div className="relative flex min-h-svh flex-col bg-background">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
