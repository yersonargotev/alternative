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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@clerk/nextjs";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// TODO: Integrate @tanstack/react-form and Zod schema validation

interface SuggestAlternativeDialogProps {
	originalToolId: number;
	originalToolName: string;
}

export default function SuggestAlternativeDialog({
	originalToolId,
	originalToolName,
}: SuggestAlternativeDialogProps) {
	const { userId, isLoaded } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Placeholder form state - replace with @tanstack/react-form
	const [name, setName] = useState("");
	const [repoUrl, setRepoUrl] = useState("");
	const [websiteUrl, setWebsiteUrl] = useState("");
	const [description, setDescription] = useState("");
	// Add state for tags if needed

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
			// --- API Call Placeholder ---
			// Replace with actual API call using react-query mutation in Part 7/9
			console.log(`Suggesting alternative for tool ${originalToolId}:`, {
				name,
				repoUrl,
				websiteUrl,
				description,
			});
			// const response = await fetch('/api/tools/suggest', { // Or a dedicated suggestion endpoint
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({
			//       name,
			//       repoUrl,
			//       websiteUrl,
			//       description,
			//       // tags,
			//       alternativeToToolId: originalToolId,
			//    }),
			// });
			// if (!response.ok) {
			//   const errorData = await response.json();
			//   throw new Error(errorData.message || 'Failed to submit suggestion');
			// }
			await new Promise((resolve) => setTimeout(resolve, 700)); // Simulate API call
			// --- End API Call Placeholder ---

			toast.success("Suggestion Submitted!", {
				description: "Thank you! Your suggestion will be reviewed.",
			});
			setIsOpen(false); // Close dialog on success
			// Reset form state
			setName("");
			setRepoUrl("");
			setWebsiteUrl("");
			setDescription("");
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
					<PlusCircle className="mr-2 h-4 w-4" /> Suggest an Alternative
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Suggest Alternative for {originalToolName}</DialogTitle>
					<DialogDescription>
						Found another great tool? Fill in the details below. We'll review it
						shortly.
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
