import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import { sendContactEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
	await connectDB();
	const { searchParams } = new URL(req.url);
	const email = searchParams.get("email");

	if (email) {
		// Check if email exists
		const membership = await Membership.findOne({ email });
		return NextResponse.json(membership ? [membership] : []);
	}

	// Return all memberships if no email filter
	const memberships = await Membership.find().sort({ createdAt: -1 });
	return NextResponse.json(memberships);
}

export async function POST(req: NextRequest) {
	try {
		await connectDB();
		const data = await req.json();
		
		// Create membership record
		const membership = await Membership.create(data);
		
		// Send confirmation email to applicant
		try {
			await sendContactEmail({
				name: data.fullName,
				email: data.email,
				message: `Thank you for your membership application!\n\nApplication Details:\nName: ${data.fullName}\nEmail: ${data.email}\nPhone: ${data.phone}\nMembership Type: ${data.membershipType}\n\nYour application is now under review. We will notify you once it's approved.\n\nBest regards,\nPNSB-Norway Team`
			});
			console.log("Confirmation email sent to:", data.email);
		} catch (emailError) {
			console.error("Error sending confirmation email:", emailError);
			// Don't fail the membership creation if email fails
		}
		
		// Send notification email to admin
		try {
			await sendContactEmail({
				name: "Admin Notification",
				email: process.env.EMAIL_USER || "info@pnsbnorway.org",
				message: `New membership application received!\n\nApplicant Details:\nName: ${data.fullName}\nEmail: ${data.email}\nPhone: ${data.phone}\nMembership Type: ${data.membershipType}\nAddress: ${data.address}, ${data.city}, ${data.postalCode}\nProfession: ${data.profession}\n\nPlease review and approve this application in the admin dashboard.\n\nApplication ID: ${membership._id}`
			});
			console.log("Admin notification email sent for new application:", data.fullName);
		} catch (adminEmailError) {
			console.error("Error sending admin notification email:", adminEmailError);
			// Don't fail the membership creation if admin email fails
		}
		
		return NextResponse.json(membership, { status: 201 });
	} catch (error) {
		console.error("Error creating membership:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to create membership" },
			{ status: 500 }
		);
	}
}
