"use client";

import { NavUser } from "@/components/nav-user";
import { ToolSwitcher } from "@/components/tool-switcher";
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
import { CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type * as React from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
		<Sidebar
			className="[&_[data-collapsed-icon]]:data-[collapsed=true]:mx-auto [&_[data-collapsed]]:data-[collapsed=true]:justify-center"
			collapsible="icon"
			{...props}
		>
			<SidebarHeader className="border-sidebar-border border-b py-2">
				<ToolSwitcher />
			</SidebarHeader>
			<SidebarContent>
				{/* App navigation links */}
				<div className="mb-4 px-3 py-2">
					<SidebarMenu className="space-y-1">
						<SidebarMenuItem className="data-[collapsed=true]:flex data-[collapsed=true]:justify-center">
							<SidebarMenuButton asChild tooltip="Trends">
								<Link className="flex w-full items-center gap-2" href="/trends">
									<TrendingUp
										className="h-4 w-4 shrink-0"
										data-collapsed-icon
									/>
									<span className="truncate">Trends</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						{/* Solo mostrar "Approve Tools" si el usuario es administrador */}
						{isUserAdmin && (
							<SidebarMenuItem className="data-[collapsed=true]:flex data-[collapsed=true]:justify-center">
								<SidebarMenuButton asChild tooltip="Approve Tools">
									<Link
										className="flex w-full items-center gap-2"
										href="/tools/approve"
									>
										<CheckCircle
											className="h-4 w-4 shrink-0"
											data-collapsed-icon
										/>
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
