"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
	const currentYear = new Date().getFullYear();
	const { isSignedIn } = useAuth(); // Get user auth state client-side
	const [isUserAdmin, setIsUserAdmin] = useState(false);

	// Check if user is admin on component mount using API endpoint
	useEffect(() => {
		async function checkAdminStatus() {
			if (isSignedIn) {
				try {
					const response = await fetch("/api/admin/check");
					if (response.ok) {
						const data = await response.json();
						setIsUserAdmin(data.isAdmin);
					}
				} catch (error) {
					console.error("Error checking admin status:", error);
				}
			} else {
				setIsUserAdmin(false);
			}
		}

		checkAdminStatus();
	}, [isSignedIn]);

	return (
		<footer className="border-t">
			<div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
				<div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
					{/* <Icons.logo /> */}
					<p className="text-center text-muted-foreground text-sm leading-loose md:text-left">
						Built by{" "}
						<a
							href="https://github.com/your-username" // Replace with your GitHub profile
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							Your Name/Team
						</a>
						. The source code is available on{" "}
						<a
							href="https://github.com/your-username/tool-alternatives-mvp" // Replace with your repo URL
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							GitHub
						</a>
						.
					</p>
				</div>

				{/* Navigation links */}
				<nav className="flex items-center space-x-4 font-medium text-sm">
					<Link
						href="/"
						className="text-foreground/60 transition-colors hover:text-foreground/80"
					>
						Home
					</Link>
					<Link
						href="/trends"
						className="text-foreground/60 transition-colors hover:text-foreground/80"
					>
						Trends
					</Link>
					{/* Solo mostrar el enlace "Approve Tools" para administradores */}
					{isUserAdmin && (
						<Link
							href="/tools/approve"
							className="text-foreground/60 transition-colors hover:text-foreground/80"
						>
							Approve Tools
						</Link>
					)}
				</nav>

				<p className="text-center text-muted-foreground text-sm md:text-left">
					© {currentYear} Tool Alternatives Hub.
				</p>
			</div>
		</footer>
	);
}
