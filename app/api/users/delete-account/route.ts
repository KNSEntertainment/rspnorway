import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function DELETE() {
	try {
		// Get the current session
		const session = await getServerSession(authOptions);
		
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized - No session found" },
				{ status: 401 }
			);
		}

		await connectDB();

		// Find and delete the membership record
		const deletedMembership = await Membership.findOneAndDelete({
			email: session.user.email
		});

		if (!deletedMembership) {
			return NextResponse.json(
				{ error: "Membership not found" },
				{ status: 404 }
			);
		}

		// Log the deletion for audit purposes
		console.log(`Account deleted for email: ${session.user.email}`, {
			deletedAt: new Date(),
			membershipId: deletedMembership._id
		});

		return NextResponse.json({
			message: "Account deleted successfully",
			deletedAt: new Date()
		});

	} catch (error) {
		console.error("Error deleting account:", error);
		return NextResponse.json(
			{ error: "Failed to delete account" },
			{ status: 500 }
		);
	}
}
