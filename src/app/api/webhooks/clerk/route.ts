import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

// This route is optional but useful if you need to sync Clerk user data
// (e.g., username, image) to your local database or perform actions on user events.
// For this MVP, we are not syncing users to a local table, so this is just a placeholder.

export async function POST(req: Request) {
	// Get the necessary headers
	const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

	if (!WEBHOOK_SECRET) {
		console.error("Error: CLERK_WEBHOOK_SECRET environment variable not set.");
		return NextResponse.json(
			{ message: "Webhook secret not configured" },
			{ status: 500 },
		);
	}

	const headerPayload = await headers();
	const svix_id = headerPayload.get("svix-id");
	const svix_timestamp = headerPayload.get("svix-timestamp");
	const svix_signature = headerPayload.get("svix-signature");

	// If there are no headers, error out
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return NextResponse.json(
			{ message: "Error occurred -- no svix headers" },
			{ status: 400 },
		);
	}

	// Get the body
	const payload = await req.json();
	const body = JSON.stringify(payload);

	// Create a new Svix instance with your secret.
	const wh = new Webhook(WEBHOOK_SECRET);

	let evt: WebhookEvent;

	// Verify the payload with the headers
	try {
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error("Error verifying webhook:", err);
		return NextResponse.json(
			{ message: "Error verifying webhook" },
			{ status: 400 },
		);
	}

	// Get the ID and type
	const { id } = evt.data;
	const eventType = evt.type;

	console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
	console.log("Webhook body:", body);

	// --- Handle Specific Events ---
	// Example: Sync user creation/update to a local DB (if you had one)
	// if (eventType === 'user.created' || eventType === 'user.updated') {
	//   const { id: clerkUserId, email_addresses, first_name, last_name, image_url } = evt.data;
	//   // Example: Upsert user in your local database
	//   // await db.insert(users).values({ clerkId: clerkUserId, ... }).onConflictDoUpdate(...);
	//   console.log(`Processing ${eventType} for user ${clerkUserId}`);
	// }
	// if (eventType === 'user.deleted') {
	//    const { id: clerkUserId } = evt.data;
	//    // Example: Mark user as deleted or remove from local DB
	//    // await db.delete(users).where(eq(users.clerkId, clerkUserId));
	//    console.log(`Processing ${eventType} for user ${clerkUserId}`);
	// }
	// --- End Event Handling ---

	return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}
