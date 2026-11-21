import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import AdminMessage from "@/models/AdminMessage.Model";
import Membership from "@/models/Membership.Model";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import User from "@/models/User.Model";
import { sendBulkMessages, isEmailConfigured } from "@/lib/emailService";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDB();

		// Get the current member's information (admins are also considered executive members)
		const email = session.user.email;
		const emailRegex = new RegExp(`^${email.trim()}$`, "i");
		const sessionUser = session.user as { id?: string; _id?: string };
		const fallbackUserId = sessionUser._id || sessionUser.id || "";
		const currentMember = await Membership.findOne({ email: emailRegex });
		
		let membershipType = currentMember?.membershipType || "executive";
		let currentMemberId = (currentMember?._id || fallbackUserId).toString();

		if (!currentMember) {
			const user = await User.findOne({ email: emailRegex });
			const exec = await ExecutiveMember.findOne({ email: emailRegex });
			const isAdminOrTreasurer = session.user.role === "admin" || session.user.role === "treasurer";

			if (user || exec || isAdminOrTreasurer) {
				membershipType = "executive";
				currentMemberId = (user?._id || exec?._id || fallbackUserId).toString();
			} else {
				return NextResponse.json(
					{ error: "Member not found" },
					{ status: 404 }
				);
			}
		}

		const { searchParams } = new URL(req.url);

		// If admin/executive wants to fetch sent messages history
		if (searchParams.get("sent") === "true") {
			const isAdminOrTreasurer = session.user.role === "admin" || session.user.role === "treasurer";
			const isExecutive = isAdminOrTreasurer || membershipType === "executive";
			if (!isExecutive) {
				return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
			}
			const filter = isAdminOrTreasurer
				? {}
				: {
						$or: [
							{ sentBy: currentMemberId },
							{ sentBy: session.user.email },
							{ senderName: session.user.fullName || (session.user as { name?: string }).name },
						],
				  };
			const sentMessages = await AdminMessage.find(filter)
				.sort({ createdAt: -1 })
				.limit(50)
				.lean();
			return NextResponse.json({ messages: sentMessages });
		}

		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const type = searchParams.get("type");
		const priority = searchParams.get("priority");
		const unreadOnly = searchParams.get("unread") === "true";

		const emailLower = email.toLowerCase().trim();
		// Build query: executive members and admins receive "all" and "executive" messages, plus individual/specific messages addressed to them
		const recipientTypes = membershipType === "executive" 
			? ["all", "executive"] 
			: ["all", membershipType];

		const query: {
			isActive: boolean;
			$and: Array<Record<string, unknown>>;
			type?: string;
			priority?: string;
			"readBy.memberId"?: { $ne: string };
		} = {
			isActive: true,
			$and: [
				{
					$or: [
						{ expiresAt: null },
						{ expiresAt: { $gt: new Date() } },
					],
				},
				{
					$or: [
						{ recipientType: { $in: recipientTypes } },
						{
							recipientType: { $in: ["specific", "individual"] },
							$or: [
								{ recipientEmails: emailLower },
								{ "recipientDetails.email": emailLower },
								{ "recipientDetails.id": currentMemberId },
							],
						},
					],
				},
			],
		};

		// Add type filter if specified
		if (type) {
			query.type = type;
		}

		// Add priority filter if specified
		if (priority) {
			query.priority = priority;
		}

		// Add unread filter if specified
		if (unreadOnly) {
			query["readBy.memberId"] = { $ne: currentMemberId };
		}

		// Get total count for pagination
		const totalMessages = await AdminMessage.countDocuments(query);

		// Get messages with pagination
		let messages = await AdminMessage.find(query)
			.sort({ priority: -1, createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		// Manually populate sender information from both collections
		messages = await Promise.all(messages.map(async (message) => {
			const messageObj = message.toObject();
			
			if (message.sentBy) {
				// Try to find in Users collection first (admin users)
				let sender = await User.findById(message.sentBy).select("fullName email").lean();
				
				// If not found in Users, try Membership collection (executive members)
				if (!sender) {
					sender = await Membership.findById(message.sentBy).select("fullName email").lean();
				}
				
				messageObj.sentBy = sender || { fullName: "PNSB-Norway Admin", email: "admin@pnsb-norway.no" };
			} else {
				messageObj.sentBy = { fullName: "PNSB-Norway Admin", email: "admin@pnsb-norway.no" };
			}
			
			return messageObj;
		}));

		// Mark messages as read
		if (messages.length > 0 && currentMemberId) {
			await AdminMessage.updateMany(
				{
					_id: { $in: messages.map(msg => msg._id) },
					"readBy.memberId": { $ne: currentMemberId },
				},
				{
					$push: {
						readBy: {
							memberId: currentMemberId,
							readAt: new Date(),
						},
					},
				}
			);
		}

		return NextResponse.json({
			messages,
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(totalMessages / limit),
				totalMessages,
				hasNext: page * limit < totalMessages,
				hasPrev: page > 1,
			},
		});

	} catch (error) {
		console.error("Error fetching messages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 }
		);
	}
}

// POST endpoint for admin or executive members to send messages
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDB();

		const email = session.user.email;
		const emailRegex = new RegExp(`^${email.trim()}$`, "i");

		// Check if user is admin in Users collection OR executive member in Membership/ExecutiveMember
		const [adminUser, executiveMember, execModel] = await Promise.all([
			User.findOne({ email: emailRegex }),
			Membership.findOne({ email: emailRegex, membershipType: "executive", membershipStatus: { $ne: "blocked" } }),
			ExecutiveMember.findOne({ email: emailRegex, isActive: { $ne: false } }),
		]);

		const isAdminUser = session.user.role === "admin" || adminUser?.role === "admin";
		const isTreasurer = session.user.role === "treasurer" || adminUser?.role === "treasurer";
		const isExecutiveMember = Boolean(executiveMember) || Boolean(execModel) || session.user.membershipType === "executive";

		if (!isAdminUser && !isTreasurer && !isExecutiveMember) {
			return NextResponse.json(
				{ error: "Unauthorized - Executive membership or Admin privileges required to send messages" },
				{ status: 403 }
			);
		}

		const sessionUser = session.user as { id?: string; _id?: string; fullName?: string; name?: string; position?: string };
		const senderId = (executiveMember?._id || adminUser?._id || execModel?._id || sessionUser._id || sessionUser.id || "").toString();
		const senderFullName = executiveMember?.fullName || adminUser?.fullName || execModel?.name || sessionUser.fullName || sessionUser.name || "Executive Member";
		const senderPosition = executiveMember?.position || execModel?.position || sessionUser.position || (isTreasurer ? "Treasurer" : (isAdminUser ? "Admin" : "Executive Member"));

		// Handle FormData (for file uploads) or JSON
		let messageData: {
			title: string | null;
			content: string | null;
			type: string | null;
			priority: string | null;
			recipientType: string | null;
			expiresAt: string | null;
		};
		const attachments: Array<{
			filename: string;
			url: string;
			fileType: string;
			size: number;
			uploadedAt: Date;
		}> = [];
		
		let shouldSendEmail = true;
		let recipientDetails: Array<{ id: string; name: string; email: string; position?: string }> = [];
		let recipientEmails: string[] = [];

		if (req.headers.get("content-type")?.includes("multipart/form-data")) {
			// Handle FormData
			const formData = await req.formData();
			messageData = {
				title: formData.get("title") as string,
				content: formData.get("content") as string,
				type: formData.get("type") as string,
				priority: formData.get("priority") as string,
				recipientType: formData.get("recipientType") as string,
				expiresAt: formData.get("expiresAt") as string,
			};

			const sendEmailField = formData.get("sendEmail");
			if (sendEmailField !== null && sendEmailField !== undefined) {
				shouldSendEmail = sendEmailField === "true" || sendEmailField === "1";
			}

			const recipientDetailsRaw = formData.get("recipientDetails");
			if (recipientDetailsRaw) {
				try {
					recipientDetails = JSON.parse(recipientDetailsRaw as string);
				} catch (e) {
					console.error("Error parsing recipientDetails:", e);
				}
			}

			const recipientEmailsRaw = formData.get("recipientEmails");
			if (recipientEmailsRaw) {
				try {
					recipientEmails = JSON.parse(recipientEmailsRaw as string);
				} catch (e) {
					console.error("Error parsing recipientEmails:", e);
				}
			}

			// Process file attachments directly with Cloudinary
			for (const [key, value] of formData.entries()) {
				if (key.startsWith('attachment') && value instanceof File) {
					const file = value;
					
					try {
						const cloudinaryUrl = await uploadToCloudinary(file, "message-attachments");
						
						const attachment = {
							filename: file.name,
							url: cloudinaryUrl,
							fileType: file.type || "application/octet-stream",
							size: file.size,
							uploadedAt: new Date(),
						};
						
						attachments.push(attachment);
						console.log('File uploaded to Cloudinary successfully:', file.name, cloudinaryUrl);
						
					} catch (uploadError) {
						console.error('Error uploading file to Cloudinary:', uploadError);
						// Continue with other files even if one fails
					}
				}
			}
		} else {
			// Handle regular JSON
			const jsonData = await req.json();
			messageData = {
				title: jsonData.title || null,
				content: jsonData.content || null,
				type: jsonData.type || null,
				priority: jsonData.priority || null,
				recipientType: jsonData.recipientType || null,
				expiresAt: jsonData.expiresAt || null,
			};
			if (jsonData.sendEmail !== undefined) {
				shouldSendEmail = Boolean(jsonData.sendEmail);
			}
			recipientDetails = jsonData.recipientDetails || [];
			recipientEmails = jsonData.recipientEmails || [];
		}
		
		// Validate required fields
		if (!messageData.title || !messageData.content) {
			return NextResponse.json(
				{ error: "Title and content are required" },
				{ status: 400 }
			);
		}

		// Ensure recipient emails are normalized lowercase
		if (recipientDetails.length > 0 && recipientEmails.length === 0) {
			recipientEmails = recipientDetails.map(r => r.email?.toLowerCase().trim()).filter(Boolean);
		} else {
			recipientEmails = recipientEmails.map(e => e.toLowerCase().trim()).filter(Boolean);
		}

		// For non-admin executive members, restrict to executive recipients (bulk executive, individual, or specific)
		if (!isAdminUser) {
			if (messageData.recipientType === "all" || messageData.recipientType === "general") {
				messageData.recipientType = "executive";
			}
		}

		// If individual or specific, ensure at least one recipient is specified
		if ((messageData.recipientType === "individual" || messageData.recipientType === "specific") && recipientEmails.length === 0 && recipientDetails.length === 0) {
			return NextResponse.json(
				{ error: "Please select at least one executive member recipient." },
				{ status: 400 }
			);
		}

		// Create message
		const message = await AdminMessage.create({
			...messageData,
			sentBy: senderId,
			senderName: senderFullName,
			senderPosition: senderPosition,
			recipientEmails,
			recipientDetails,
			attachments: attachments,
			emailSent: false,
		});

		// Populate sender info if sender is in Membership or User
		try {
			await message.populate("sentBy", "fullName email");
		} catch {
			// If sentBy is string id not directly populating via ref, senderName/senderPosition are already saved
		}

		// Send email notifications
		let emailResult = null;
		if (shouldSendEmail) {
			try {
				const senderDisplay = senderPosition ? `${senderFullName} (${senderPosition})` : senderFullName;
				emailResult = await sendEmailNotifications(
					{
						messageId: message._id.toString(),
						title: messageData.title!,
						content: messageData.content!,
						priority: messageData.priority!,
						recipientType: messageData.recipientType!,
						recipientDetails,
						recipientEmails,
						attachments,
					},
					{ fullName: senderDisplay }
				);
			} catch (err) {
				console.error("Error sending email notifications:", err);
			}
		}

		return NextResponse.json({
			...message.toObject(),
			emailNotificationSent: Boolean(emailResult && emailResult.sentCount > 0),
			emailSentCount: emailResult?.sentCount || 0,
			totalRecipients: emailResult?.totalCount || 0,
		}, { status: 201 });

	} catch (error) {
		console.error("Error creating message:", error);
		const errorMessage = error instanceof Error ? error.message : "Failed to create message";
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}

// Helper function to send email notifications
async function sendEmailNotifications(messageData: {
	messageId?: string;
	title: string;
	content: string;
	priority: string;
	recipientType: string;
	recipientDetails?: Array<{ id: string; name: string; email: string; position?: string }>;
	recipientEmails?: string[];
	attachments?: Array<{ filename: string; url: string; size?: number }>;
}, sender: {
	fullName: string;
}) {
	try {
		if (!isEmailConfigured()) {
			console.log("Email service not configured (missing EMAIL_USER/EMAIL_APP_PASS) - skipping email notifications");
			return { success: false, sentCount: 0, totalCount: 0 };
		}

		// Only exclude members who explicitly opted out: "emailPreferences.messages": false
		const optedOutMembers = (await Membership.find({
			"emailPreferences.messages": false,
		}).select("email").lean()) as Array<{ email?: string }>;

		const excludeEmails = optedOutMembers.map((member) => member.email).filter(Boolean) as string[];

		const emailResult = await sendBulkMessages(
			messageData.title,
			messageData.content,
			sender.fullName,
			messageData.priority,
			messageData.recipientType,
			excludeEmails,
			messageData.recipientDetails,
			messageData.attachments
		);

		console.log("Email notification result:", emailResult);

		// If messageId provided and emails delivered, update record in database
		if (messageData.messageId && emailResult.sentCount > 0) {
			await AdminMessage.findByIdAndUpdate(messageData.messageId, {
				emailSent: true,
				emailSentAt: new Date(),
				emailSentCount: emailResult.sentCount,
			});
		}

		return emailResult;

	} catch (error: unknown) {
		console.error("Error in sendEmailNotifications:", error);
		return { success: false, sentCount: 0, totalCount: 0 };
	}
}

// DELETE endpoint to delete sent message and its Cloudinary attachments
export async function DELETE(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const { searchParams } = new URL(req.url);
		let id = searchParams.get("id");

		if (!id) {
			const body = await req.json().catch(() => ({}));
			id = body?.id || body?.messageId;
		}

		if (!id) {
			return NextResponse.json({ error: "Message ID is required for deletion." }, { status: 400 });
		}

		const email = session.user.email;
		const emailRegex = new RegExp(`^${email.trim()}$`, "i");

		const [adminUser, executiveMember, execModel] = await Promise.all([
			User.findOne({ email: emailRegex, role: { $in: ["admin", "treasurer"] } }),
			Membership.findOne({ email: emailRegex, membershipType: "executive" }),
			ExecutiveMember.findOne({ email: emailRegex, isActive: { $ne: false } }),
		]);

		const isAuthorized = Boolean(adminUser) || Boolean(executiveMember) || Boolean(execModel) || session.user.role === "admin" || session.user.role === "treasurer" || session.user.membershipType === "executive";

		if (!isAuthorized) {
			return NextResponse.json(
				{ error: "Unauthorized - Admin or Executive privileges required to delete messages" },
				{ status: 403 }
			);
		}

		const message = await AdminMessage.findById(id);
		if (!message) {
			return NextResponse.json({ error: "Message not found" }, { status: 404 });
		}

		// Delete attachments from Cloudinary if any exist
		if (Array.isArray(message.attachments) && message.attachments.length > 0) {
			console.log(`Deleting ${message.attachments.length} attachment(s) from Cloudinary for message: ${message.title}`);
			for (const att of message.attachments) {
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
			message: "Message and all associated Cloudinary attachments deleted successfully.",
			deletedId: id,
		});

	} catch (error) {
		console.error("Error deleting message:", error);
		const errorMessage = error instanceof Error ? error.message : "Failed to delete message";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
