import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logActivity } from "@/lib/activityLogger";

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		// If no active session, ignore to avoid crawler log bloat
		if (!session?.user?.email) {
			return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 200 });
		}

		let body: { path?: string; pageTitle?: string; referrer?: string } = {};
		try {
			body = await req.json();
		} catch {
			body = {};
		}

		const path = body.path || "";
		if (!path || path.startsWith("/api/") || path.includes("_next")) {
			return NextResponse.json({ success: true }, { status: 200 });
		}

		const user = session.user as {
			_id?: string;
			id?: string;
			fullName?: string;
			name?: string;
			email?: string;
			role?: string;
			membershipType?: string;
		};

		const fullName = user.fullName || user.name || "Member";
		const email = user.email || "";
		const userId = user._id || user.id || "";
		const role = user.role || "member";
		const membershipType = user.membershipType || (role === "admin" || role === "treasurer" ? "executive" : "general");

		await logActivity({
			userId,
			userName: fullName,
			userEmail: email,
			userRole: role,
			membershipType,
			action: "PAGE_VIEW",
			category: "navigation",
			description: `${fullName} visited ${path}`,
			path,
			pageTitle: body.pageTitle || "",
			referrer: body.referrer || "",
			req,
			status: "success",
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in /api/logs/track-page:", error);
		return NextResponse.json({ success: false }, { status: 200 });
	}
}
