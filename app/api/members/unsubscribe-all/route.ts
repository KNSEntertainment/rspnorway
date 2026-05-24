import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function POST(req: NextRequest) {
	try {
		const { email } = await req.json();

		if (!email) {
			return NextResponse.json(
				{ error: "Email is required" },
				{ status: 400 }
			);
		}

		await connectDB();

		const member = await Membership.findOneAndUpdate(
			{ email },
			{ 
				$set: { 
					emailPreferences: {
						messages: false,
						announcements: false,
						newsletters: false,
						events: false,
					},
					updatedAt: new Date(),
				}
			},
			{ new: true, upsert: false }
		);

		if (!member) {
			return NextResponse.json(
				{ error: "Member not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: "Successfully unsubscribed from all emails",
		});

	} catch (error) {
		console.error("Error unsubscribing from all emails:", error);
		return NextResponse.json(
			{ error: "Failed to unsubscribe" },
			{ status: 500 }
		);
	}
}
