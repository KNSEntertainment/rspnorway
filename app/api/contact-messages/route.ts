import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message.Model";
import User from "@/models/User.Model";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if user is admin or has permission to view contact messages
		const user = await User.findOne({ email: session.user.email });
		if (!user || user.role !== "admin") {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		await connectDB();

		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const status = searchParams.get("status");

		// Build query
		const query: { status?: string } = {};
		
		// Add status filter if specified
		if (status) {
			query.status = status;
		}

		// Get total count for pagination
		const total = await Message.countDocuments(query);

		// Get messages with pagination
		const messages = await Message.find(query)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		return NextResponse.json({
			messages,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching contact messages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if user is admin
		const user = await User.findOne({ email: session.user.email });
		if (!user || user.role !== "admin") {
			return NextResponse.json(
				{ error: "Insufficient permissions" },
				{ status: 403 }
			);
		}

		await connectDB();

		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Message ID is required" },
				{ status: 400 }
			);
		}

		const deletedMessage = await Message.findByIdAndDelete(id);

		if (!deletedMessage) {
			return NextResponse.json(
				{ error: "Message not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ message: "Message deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting contact message:", error);
		return NextResponse.json(
			{ error: "Failed to delete message" },
			{ status: 500 }
		);
	}
}
