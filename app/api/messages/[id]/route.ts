import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import AdminMessage from "@/models/AdminMessage.Model";
import Message from "@/models/Message.Model";
import User from "@/models/User.Model";
import Membership from "@/models/Membership.Model";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import { deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export async function GET(
	req: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;
		await connectDB();

		let message = await AdminMessage.findById(id).lean();
		if (!message) {
			message = await Message.findById(id).lean();
		}

		if (!message) {
			return NextResponse.json({ error: "Message not found" }, { status: 404 });
		}

		return NextResponse.json(message);
	} catch (error) {
		console.error("Error fetching message:", error);
		return NextResponse.json({ error: "Failed to fetch message" }, { status: 500 });
	}
}

export async function PUT(
	req: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();
		const data = await req.json();

		let message = await AdminMessage.findByIdAndUpdate(id, data, { new: true });
		if (!message) {
			message = await Message.findByIdAndUpdate(id, data, { new: true });
		}

		if (!message) {
			return NextResponse.json({ error: "Message not found" }, { status: 404 });
		}

		return NextResponse.json(message);
	} catch (error) {
		console.error("Error updating message:", error);
		return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
	}
}

export async function DELETE(
	req: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const email = session.user.email;
		const emailRegex = new RegExp(`^${email.trim()}$`, "i");

		// Check if user is admin or executive
		const [adminUser, executiveMember, execModel] = await Promise.all([
			User.findOne({ email: emailRegex, role: { $in: ["admin", "treasurer"] } }),
			Membership.findOne({ email: emailRegex, membershipType: "executive" }),
			ExecutiveMember.findOne({ email: emailRegex, isActive: { $ne: false } }),
		]);

		const isAdmin = Boolean(adminUser) || session.user.role === "admin" || session.user.role === "treasurer";
		const isExecutive = isAdmin || Boolean(executiveMember) || Boolean(execModel) || session.user.membershipType === "executive";

		if (!isExecutive) {
			return NextResponse.json(
				{ error: "Unauthorized - Admin or Executive privileges required to delete messages" },
				{ status: 403 }
			);
		}

		// 1. Try finding in AdminMessage collection
		const adminMessage = await AdminMessage.findById(id);

		if (adminMessage) {
			// Delete all attached files from Cloudinary if any exist
			if (Array.isArray(adminMessage.attachments) && adminMessage.attachments.length > 0) {
				console.log(`Deleting ${adminMessage.attachments.length} attachment(s) from Cloudinary for message: ${adminMessage.title}`);
				for (const att of adminMessage.attachments) {
					if (att.url) {
						try {
							await deleteFromCloudinary(att.url);
							console.log("Successfully deleted Cloudinary attachment:", att.url);
						} catch (cloudErr) {
							console.error("Failed to delete attachment from Cloudinary:", att.url, cloudErr);
						}
					}
				}
			}

			await AdminMessage.findByIdAndDelete(id);
			return NextResponse.json({
				success: true,
				message: "Sent message and all linked Cloudinary attachments deleted successfully.",
			});
		}

		// 2. Fallback to Message collection (contact message)
		const contactMessage = await Message.findById(id);
		if (contactMessage) {
			await Message.findByIdAndDelete(id);
			return NextResponse.json({
				success: true,
				message: "Message deleted successfully.",
			});
		}

		return NextResponse.json({ error: "Message not found" }, { status: 404 });

	} catch (error) {
		console.error("Error deleting message:", error);
		const errorMessage = error instanceof Error ? error.message : "Failed to delete message";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
