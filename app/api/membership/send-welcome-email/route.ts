import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
	try {
		await connectDB();
		
		const { membershipId } = await request.json();
		
		if (!membershipId) {
			return NextResponse.json({ 
				success: false, 
				error: "Membership ID is required" 
			}, { status: 400 });
		}

		// Find the membership
		const membership = await Membership.findById(membershipId);
		
		if (!membership) {
			return NextResponse.json({ 
				success: false, 
				error: "Membership not found" 
			}, { status: 404 });
		}

		// Check if membership is approved
		if (membership.membershipStatus !== "approved") {
			return NextResponse.json({ 
				success: false, 
				error: "Membership is not approved" 
			}, { status: 400 });
		}

		// Check if email exists
		if (!membership.email) {
			return NextResponse.json({ 
				success: false, 
				error: "Member email not found" 
			}, { status: 400 });
		}

		// Send welcome email
		await sendWelcomeEmail({ 
			name: membership.fullName, 
			email: membership.email
		});

		return NextResponse.json({ 
			success: true, 
			message: "Welcome email sent successfully" 
		});

	} catch (error) {
		console.error("Send welcome email error:", error);
		return NextResponse.json({ 
			success: false, 
			error: error instanceof Error ? error.message : "Failed to send welcome email"
		}, { status: 500 });
	}
}
