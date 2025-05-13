"use client";

import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle, Compass, TrendingUp } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { isSignedIn } = useAuth(); // Get user auth state client-side

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader className="border-sidebar-border border-b px-3 py-3 font-bold text-lg tracking-tight">Tool Alternatives</SidebarHeader>
			<SidebarContent>
				{/* App navigation links */}
				<div className="mb-4 px-3 py-2">
					<div className="mb-2 flex items-center gap-2">
						<Compass className="h-4 w-4 shrink-0 text-sidebar-foreground/70" />
						<h2 className="truncate font-semibold text-sidebar-foreground/70 text-xs">
							Navigation
						</h2>
					</div>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip="Trends">
								<Link href="/trends" className="flex w-full items-center gap-2">
									<TrendingUp className="h-4 w-4 shrink-0" />
									<span className="truncate">Trends</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						{isSignedIn && (
							<SidebarMenuItem>
								<SidebarMenuButton asChild tooltip="Approve Tools">
									<Link
										href="/tools/approve"
										className="flex w-full items-center gap-2"
									>
										<CheckCircle className="h-4 w-4 shrink-0" />
										<span className="truncate">Approve Tools</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						)}
					</SidebarMenu>
				</div>
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
