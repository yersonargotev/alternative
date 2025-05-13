import { isAdmin } from "@/lib/check-admin";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const isUserAdmin = await isAdmin();
		return NextResponse.json({ isAdmin: isUserAdmin });
	} catch (error) {
		console.error("[ADMIN_CHECK_API] Error checking admin status:", error);
		return NextResponse.json({ isAdmin: false }, { status: 500 });
	}
}
