"use client";

import { ChevronsUpDown, Wrench } from "lucide-react";
import * as React from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function ToolSwitcher() {
	const { isMobile, state } = useSidebar();
	const [activeTool, setActiveTool] = React.useState({
		name: "Tool Alternatives",
		icon: Wrench,
		category: "All Tools"
	});

	const toolOptions = [
		{
			name: "Tool Alternatives",
			icon: Wrench,
			category: "All Tools"
		},
		{
			name: "Favorites",
			icon: Wrench,
			category: "Custom"
		},
		{
			name: "Recent",
			icon: Wrench,
			category: "Custom"
		}
	];

	return (
		<SidebarMenu className="px-0">
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<activeTool.icon className="size-4" />
							</div>
							{state !== "collapsed" && (
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{activeTool.name}</span>
									<span className="truncate text-xs">{activeTool.category}</span>
								</div>
							)}
							{state !== "collapsed" && <ChevronsUpDown className="ml-auto" />}
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Tool Collections
						</DropdownMenuLabel>
						{toolOptions.map((tool, index) => (
							<DropdownMenuItem
								key={tool.name}
								onClick={() => setActiveTool(tool)}
								className="gap-2 p-2"
							>
								<div className="flex size-6 items-center justify-center rounded-md border">
									<tool.icon className="size-3.5 shrink-0" />
								</div>
								{tool.name}
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem className="gap-2 p-2">
							<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
								<Wrench className="size-4" />
							</div>
							<div className="font-medium text-muted-foreground">Manage Tools</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
