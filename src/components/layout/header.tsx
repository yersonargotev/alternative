"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default function Header() {
	const { userId, isSignedIn } = useAuth(); // Get user auth state client-side

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center">
				<div className="mr-4 hidden md:flex">
					<Link href="/" className="mr-6 flex items-center space-x-2">
						{/* <Icons.logo className="h-6 w-6" /> */}
						<span className="hidden font-bold sm:inline-block">
							Tool Alternatives
						</span>
					</Link>
					<nav className="flex items-center space-x-6 font-medium text-sm">
						{/* Navigation links */}
						<Link href="/trends" className="text-foreground/60 transition-colors hover:text-foreground/80">
              Trends
            </Link>
						{/* Only show Approve Tools link for authenticated users */}
						{isSignedIn && (
							<Link href="/tools/approve" className="text-foreground/60 transition-colors hover:text-foreground/80">
								Approve Tools
							</Link>
						)}
					</nav>
				</div>
				{/* Mobile Nav Placeholder */}
				{/* <Button variant="ghost" className="md:hidden">Menu</Button> */}

				<div className="flex flex-1 items-center justify-end space-x-4">
					<nav className="flex items-center space-x-2">
						{userId ? (
							<UserButton />
						) : (
							<>
								<SignInButton mode="modal">
									<Button variant="ghost" size="sm">
										Log In
									</Button>
								</SignInButton>
								<SignUpButton mode="modal">
									<Button size="sm">
										Sign Up <LogIn className="ml-2 h-4 w-4" />
									</Button>
								</SignUpButton>
							</>
						)}
						{/* Placeholder for Suggest Tool Button */}
						{/* <Button size="sm" variant="outline">Suggest Tool</Button> */}
					</nav>
				</div>
			</div>
		</header>
	);
}
