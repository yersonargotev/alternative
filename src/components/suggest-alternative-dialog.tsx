"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@clerk/nextjs";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// TODO: Integrate @tanstack/react-form and Zod schema validation

interface SuggestAlternativeDialogProps {
	originalToolId: number; // Can be 0 when used from home page
	originalToolName: string; // Can be empty when used from home page
}

export default function SuggestAlternativeDialog({
	originalToolId,
	originalToolName,
}: SuggestAlternativeDialogProps) {
	// Determine if this is being used from the home page
	const isFromHomePage = originalToolId === 0;
	const { userId, isLoaded } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Placeholder form state - replace with @tanstack/react-form
	const [name, setName] = useState("");
	const [repoUrl, setRepoUrl] = useState("");
	const [websiteUrl, setWebsiteUrl] = useState("");
	const [description, setDescription] = useState("");
	const [alternativeToToolId, setAlternativeToToolId] = useState<number | null>(null);
	const [alternativeToCustomName, setAlternativeToCustomName] = useState("");
	const [useCustomAlternative, setUseCustomAlternative] = useState(false);
	const [availableTools, setAvailableTools] = useState<{id: number, name: string}[]>([]);
	// Add state for tags if needed
	
	// Fetch available tools for the dropdown
	useEffect(() => {
		const fetchTools = async () => {
			try {
				const response = await fetch('/api/tools?limit=50');
				if (response.ok) {
					const data = await response.json();
					setAvailableTools(data.tools.map((tool: { id: number; name: string }) => ({
						id: tool.id,
						name: tool.name
					})));
				}
			} catch (error) {
				console.error("Error fetching tools:", error);
			}
		};
		
		// Only fetch if dialog is open
		if (isOpen && isFromHomePage) {
			fetchTools();
		}
	}, [isOpen, isFromHomePage]);
	
	// Set the alternativeToToolId if provided via props
	useEffect(() => {
		if (originalToolId > 0) {
			setAlternativeToToolId(originalToolId);
		}
	}, [originalToolId]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!isLoaded) return;

		if (!userId) {
			toast.error("Please log in to suggest an alternative.");
			setIsOpen(false); // Close dialog if not logged in
			return;
		}

		setIsLoading(true);

		// --- Form Validation Placeholder ---
		// Use Zod schema (createToolSuggestionSchema) with @tanstack/react-form
		if (!name || !repoUrl || !description) {
			toast.error("Please fill in Name, Repo URL, and Description.");
			setIsLoading(false);
			return;
		}
		if (!repoUrl.startsWith("https://github.com/")) {
			toast.error("Please provide a valid GitHub repository URL.");
			setIsLoading(false);
			return;
		}
		// --- End Validation Placeholder ---

		try {
			// --- Make the actual API call ---
			const suggestionData = {
				name,
				repoUrl,
				websiteUrl,
				description,
				// Include alternativeToToolId if it's set, or alternativeToCustomName if using custom
				...(alternativeToToolId ? { alternativeToToolId } : {}),
				...(useCustomAlternative && alternativeToCustomName ? { alternativeToCustomName } : {}),
			};
			
			console.log(
				isFromHomePage
					? "Registering new alternative tool:" 
					: `Suggesting alternative for tool ${originalToolId}:`, 
				suggestionData
			);
			
			const response = await fetch('/api/tools/suggest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(suggestionData),
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to submit suggestion');
			}
			
			const result = await response.json();

			toast.success(
				isFromHomePage ? "Tool Registered!" : "Suggestion Submitted!", 
				{
					description: "Thank you! Your submission will be reviewed.",
				}
			);
			setIsOpen(false); // Close dialog on success
			// Reset form state
			setName("");
			setRepoUrl("");
			setWebsiteUrl("");
			setDescription("");
			setAlternativeToToolId(null);
			setAlternativeToCustomName("");
			setUseCustomAlternative(false);
			// Optionally refresh data or show pending state
			// router.refresh();
		} catch (error) {
			console.error("Suggestion failed:", error);
			toast.error(
				error instanceof Error ? error.message : "An unknown error occurred.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<PlusCircle className="mr-2 h-4 w-4" /> 
					{isFromHomePage ? "Register an Alternative" : "Suggest an Alternative"}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>
						{isFromHomePage
							? "Register an Alternative Tool"
							: `Suggest Alternative for ${originalToolName}`}
					</DialogTitle>
					<DialogDescription>
						{isFromHomePage
							? "Know a great open source tool? Share it with the community."
							: "Found another great tool? Fill in the details below. We'll review it shortly."}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name*
							</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="repoUrl" className="text-right">
								GitHub Repo*
							</Label>
							<Input
								id="repoUrl"
								value={repoUrl}
								onChange={(e) => setRepoUrl(e.target.value)}
								placeholder="https://github.com/user/repo"
								className="col-span-3"
								required
							/>
						</div>
						{isFromHomePage && (
						<>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label className="text-right">
									Alternative Type
								</Label>
								<div className="col-span-3 flex gap-4">
									<Button 
										type="button"
										variant={!useCustomAlternative ? "default" : "outline"}
										size="sm"
										onClick={() => setUseCustomAlternative(false)}
									>
										Existing Tool
									</Button>
									<Button 
										type="button"
										variant={useCustomAlternative ? "default" : "outline"}
										size="sm"
										onClick={() => setUseCustomAlternative(true)}
									>
										New Alternative
									</Button>
								</div>
							</div>

							{!useCustomAlternative ? (
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="alternativeTo" className="text-right">
										Alternative To
									</Label>
									<div className="col-span-3">
										<Select
											value={alternativeToToolId?.toString() || "none"}
											onValueChange={(value) => setAlternativeToToolId(value && value !== "none" ? Number.parseInt(value, 10) : null)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a tool (optional)" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">None</SelectItem>
												{availableTools.map((tool) => (
													<SelectItem key={tool.id} value={tool.id.toString()}>
														{tool.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{availableTools.length === 0 && (
											<p className="text-xs text-muted-foreground mt-1">
												No tools available. Try entering a custom alternative name.
											</p>
										)}
									</div>
								</div>
							) : (
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="customAlternative" className="text-right">
										Alternative To
									</Label>
									<div className="col-span-3">
										<Input
											id="customAlternative"
											value={alternativeToCustomName}
											onChange={(e) => setAlternativeToCustomName(e.target.value)}
											placeholder="Enter tool name (e.g., 'Visual Studio Code')"
										/>
									</div>
								</div>
							)}
						</>
					)}
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="websiteUrl" className="text-right">
								Website
							</Label>
							<Input
								id="websiteUrl"
								value={websiteUrl}
								onChange={(e) => setWebsiteUrl(e.target.value)}
								placeholder="https://example.com"
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-start gap-4">
							<Label htmlFor="description" className="pt-2 text-right">
								Description*
							</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Briefly describe the tool..."
								className="col-span-3 min-h-[80px]"
								required
							/>
						</div>
						{/* TODO: Add Tags Input */}
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading || !isLoaded}>
							{isLoading ? "Submitting..." : "Submit Suggestion"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
