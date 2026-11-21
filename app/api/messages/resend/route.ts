import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import AdminMessage from "@/models/AdminMessage.Model";
import Membership from "@/models/Membership.Model";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import User from "@/models/User.Model";
import { sendBulkMessages, isEmailConfigured } from "@/lib/emailService";

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Check if user is admin or executive
		const email = session.user.email;
		const emailRegex = new RegExp(`^${email.trim()}$`, "i");
		const [adminUser, executiveMember, execModel] = await Promise.all([
			User.findOne({ email: emailRegex, role: { $in: ["admin", "treasurer"] } }),
			Membership.findOne({ email: emailRegex, membershipType: "executive" }),
			ExecutiveMember.findOne({ email: emailRegex, isActive: { $ne: false } }),
		]);

		const isAuthorized = Boolean(adminUser) || Boolean(executiveMember) || Boolean(execModel) || session.user.membershipType === "executive" || session.user.role === "admin" || session.user.role === "treasurer";

		if (!isAuthorized) {
			return NextResponse.json(
				{ error: "Unauthorized - Admin or Executive privileges required" },
				{ status: 403 }
			);
		}

		const body = await req.json().catch(() => ({}));
		const { messageId } = body;

		let message = null;
		if (messageId) {
			message = await AdminMessage.findById(messageId);
		} else {
			// If no messageId specified, find the most recently created message (e.g. the one just sent!)
			message = await AdminMessage.findOne({}).sort({ createdAt: -1 });
		}

		if (!message) {
			return NextResponse.json({ error: "No message found" }, { status: 404 });
		}

		if (!isEmailConfigured()) {
			return NextResponse.json(
				{ error: "Email credentials not configured in environment (EMAIL_USER / EMAIL_APP_PASS)" },
				{ status: 500 }
			);
		}

		// Find sender name and position
		let senderName = message.senderName || "PNSB-Norway Administration";
		if (message.senderPosition) {
			senderName = `${senderName} (${message.senderPosition})`;
		} else if (message.sentBy) {
			const senderUser = (await User.findById(message.sentBy).select("fullName role").lean()) as { fullName?: string; role?: string } | null;
			const senderMember = !senderUser
				? ((await Membership.findById(message.sentBy).select("fullName position").lean()) as { fullName?: string; position?: string } | null)
				: null;
			if (senderUser?.fullName) {
				senderName = `${senderUser.fullName} (${senderUser.role === "treasurer" ? "Treasurer" : "Admin"})`;
			} else if (senderMember?.fullName) {
				senderName = senderMember.position ? `${senderMember.fullName} (${senderMember.position})` : senderMember.fullName;
			}
		}

		// Find members who explicitly opted out
		const optedOutMembers = (await Membership.find({
			"emailPreferences.messages": false,
		})
			.select("email")
			.lean()) as Array<{ email?: string }>;

		const excludeEmails = optedOutMembers.map((m) => m.email).filter(Boolean) as string[];

		const specificRecipients = (message.recipientType === "individual" || message.recipientType === "specific") && message.recipientDetails?.length > 0
			? message.recipientDetails
			: undefined;

		const emailResult = await sendBulkMessages(
			message.title,
			message.content,
			senderName,
			message.priority || "medium",
			message.recipientType || "all",
			excludeEmails,
			specificRecipients,
			message.attachments
		);

		// Update message document
		if (emailResult.sentCount > 0) {
			await AdminMessage.findByIdAndUpdate(message._id, {
				emailSent: true,
				emailSentAt: new Date(),
				emailSentCount: emailResult.sentCount,
			});
		}

		return NextResponse.json({
			success: true,
			message: `Emails sent to ${emailResult.sentCount} recipients (${emailResult.failedCount || 0} failed)`,
			sentCount: emailResult.sentCount,
			totalCount: emailResult.totalCount,
			messageTitle: message.title,
			messageId: message._id,
		});
	} catch (error) {
		console.error("Error resending email:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to send email" },
			{ status: 500 }
		);
	}
}
