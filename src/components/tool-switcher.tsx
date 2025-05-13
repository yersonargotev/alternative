"use client";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";

export function ToolSwitcher() {
	const router = useRouter();
	const { state } = useSidebar();

	const goToHome = () => {
		router.push("/");
	};

	return (
		<SidebarMenu className="px-0">
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" onClick={goToHome} className="mb-2 w-full">
					<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
						<Home className="size-4" />
					</div>
					{state !== "collapsed" && (
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">Home</span>
							<span className="truncate text-xs">Go to homepage</span>
						</div>
					)}
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
