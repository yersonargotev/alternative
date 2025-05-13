import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Placeholder for score calculation - refine later
export function calculateScore(
	githubStars: number | null | undefined,
	userVotes: number,
): number {
	try {
		const stars = githubStars ?? 0;
		// Simple weighted score for now
		// Adjust weights (80/20) and scaling as needed
		const githubWeight = 0.8;
		const userVoteWeight = 0.2;

		// Normalize stars somewhat arbitrarily for now, e.g., log scale or cap
		const normalizedStars = Math.log10(stars + 1); // Add 1 to avoid log(0)

		// User votes contribute directly but scaled
		const score = normalizedStars * githubWeight + userVotes * userVoteWeight;
		// Parse and ensure it's a valid number, default to 0 if NaN or Infinity
		const parsedScore = Number.parseFloat(score.toFixed(2));
		return Number.isFinite(parsedScore) ? parsedScore : 0;
	} catch (error) {
		console.error("Error calculating score:", error);
		return 0; // Return a safe default value on error
	}
}

// Helper to format numbers (e.g., for stars)
export function formatNumber(num: number | null | undefined): string {
	if (num === null || num === undefined) return "N/A";
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}k`;
	}
	return num.toString();
}

// Helper to get favicon URL
export function getFaviconUrl(
	websiteUrl: string | null | undefined,
	size = 32,
): string {
	if (!websiteUrl) {
		// Return a default placeholder icon URL or handle as needed
		return "/images/default-icon.png"; // Assume you have a default icon
	}
	try {
		const url = new URL(websiteUrl);
		// Use Google's favicon service as a fallback
		return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=${size}`;
	} catch (e) {
		// Invalid URL, return default
		return "/images/default-icon.png";
	}
}
