import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { handleUserDeletion, upsertUser, updateUserLastLogin } from "@/db/clerk";

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
	switch (eventType) {
		case 'user.created': {
			const { id: clerkUserId, email_addresses, first_name, last_name, image_url } = evt.data;
			const primaryEmail = email_addresses?.[0]?.email_address;
			
			console.log(`User created: ${clerkUserId} | ${primaryEmail}`);
			
			// Create user in our database
			if (clerkUserId) {
				try {
					await upsertUser({
						id: clerkUserId,
						email_addresses,
						first_name,
						last_name,
						image_url
					});
				} catch (error) {
					console.error(`Error creating user in database: ${error}`);
				}
			}
			break;
		}
		
		case 'user.updated': {
			const { id: clerkUserId, email_addresses, first_name, last_name, image_url } = evt.data;
			const primaryEmail = email_addresses?.[0]?.email_address;
			
			console.log(`User updated: ${clerkUserId} | ${primaryEmail}`);
			
			// Update user in our database
			if (clerkUserId) {
				try {
					await upsertUser({
						id: clerkUserId,
						email_addresses,
						first_name,
						last_name,
						image_url
					});
				} catch (error) {
					console.error(`Error updating user in database: ${error}`);
				}
			}
			break;
		}
		
		case 'user.deleted': {
			const { id: clerkUserId } = evt.data;
			
			console.log(`User deleted: ${clerkUserId}`);
			// Handle user deletion in database
			if (clerkUserId) {
				try {
					await handleUserDeletion(clerkUserId);
					console.log(`Successfully processed deletion for user ${clerkUserId}`);
				} catch (error) {
					console.error(`Error processing user deletion: ${error}`);
				}
			} else {
				console.error('User deletion event missing clerkUserId');
			}
			break;
		}
		
		case 'session.created': {
			const { user_id } = evt.data;
			console.log(`New session created for user: ${user_id}`);
			
			// Update last login timestamp
			if (user_id) {
				try {
					await updateUserLastLogin(user_id);
				} catch (error) {
					console.error(`Error updating last login: ${error}`);
				}
			}
			break;
		}
		
		case 'session.ended': {
			const { user_id } = evt.data;
			console.log(`Session ended for user: ${user_id}`);
			break;
		}
		
		case 'organization.created': {
			const { id: orgId, name } = evt.data;
			console.log(`Organization created: ${orgId} | ${name}`);
			// TODO: If you're using organizations, add sync code here
			break;
		}
		
		case 'organization.updated': {
			const { id: orgId, name } = evt.data;
			console.log(`Organization updated: ${orgId} | ${name}`);
			// TODO: If you're using organizations, add sync code here
			break;
		}
		
		case 'organization.deleted': {
			const { id: orgId } = evt.data;
			console.log(`Organization deleted: ${orgId}`);
			// TODO: If you're using organizations, add sync code here
			break;
		}
		
		default:
			console.log(`Unhandled webhook event type: ${eventType}`);
	}
	// --- End Event Handling ---

	return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}
