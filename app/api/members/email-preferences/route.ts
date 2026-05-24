import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json(
				{ error: "Email is required" },
				{ status: 400 }
			);
		}

		await connectDB();

		const member = await Membership.findOne({ email }).select("emailPreferences");
		
		if (!member) {
			return NextResponse.json(
				{ error: "Member not found" },
				{ status: 404 }
			);
		}

		// Return default preferences if none exist
		const defaultPreferences = {
			messages: true,
			announcements: true,
			newsletters: true,
			events: true,
		};

		return NextResponse.json({
			preferences: member.emailPreferences || defaultPreferences,
		});

	} catch (error) {
		console.error("Error fetching email preferences:", error);
		return NextResponse.json(
			{ error: "Failed to fetch preferences" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const { email, preferences } = await req.json();

		if (!email || !preferences) {
			return NextResponse.json(
				{ error: "Email and preferences are required" },
				{ status: 400 }
			);
		}

		await connectDB();

		const member = await Membership.findOneAndUpdate(
			{ email },
			{ 
				$set: { 
					emailPreferences: preferences,
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
			message: "Email preferences updated successfully",
			preferences: member.emailPreferences,
		});

	} catch (error) {
		console.error("Error updating email preferences:", error);
		return NextResponse.json(
			{ error: "Failed to update preferences" },
			{ status: 500 }
		);
	}
}
