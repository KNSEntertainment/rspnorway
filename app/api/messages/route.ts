import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import AdminMessage from "@/models/AdminMessage.Model";
import Membership from "@/models/Membership.Model";
import User from "@/models/User.Model";
import { sendBulkMessages } from "@/lib/emailService";

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

		// Get the current member's information
		const currentMember = await Membership.findOne({ email: session.user.email });
		if (!currentMember) {
			return NextResponse.json(
				{ error: "Member not found" },
				{ status: 404 }
			);
		}

		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const type = searchParams.get("type");
		const priority = searchParams.get("priority");
		const unreadOnly = searchParams.get("unread") === "true";

		// Build query
		const query: {
			isActive: boolean;
			$or: Array<{ recipientType: string } | { recipientType: string }>;
			$and: Array<{
				$or: Array<{ expiresAt: null } | { expiresAt: { $gt: Date } }>;
			}>;
			type?: string;
			priority?: string;
			"readBy.memberId"?: { $ne: string };
		} = {
			isActive: true,
			$or: [
				{ recipientType: "all" },
				{ recipientType: currentMember.membershipType },
			],
			$and: [
				{
					$or: [
						{ expiresAt: null },
						{ expiresAt: { $gt: new Date() } },
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
			query["readBy.memberId"] = { $ne: currentMember._id };
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
		if (messages.length > 0) {
			await AdminMessage.updateMany(
				{
					_id: { $in: messages.map(msg => msg._id) },
					"readBy.memberId": { $ne: currentMember._id },
				},
				{
					$push: {
						readBy: {
							memberId: currentMember._id,
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

// POST endpoint for admin to send messages
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

		// Check if user is admin in Users collection OR executive member in Membership collection
		const [adminUser, executiveMember] = await Promise.all([
			User.findOne({ email: session.user.email, role: "admin" }),
			Membership.findOne({ email: session.user.email, membershipType: "executive" })
		]);

		if (!adminUser && !executiveMember) {
			return NextResponse.json(
				{ error: "Unauthorized - Admin or Executive membership required" },
				{ status: 403 }
			);
		}

		// Use the appropriate sender information
		const sender = adminUser || executiveMember;

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

			// Process file attachments
			for (const [key, value] of formData.entries()) {
				if (key.startsWith('attachment') && value instanceof File) {
					const file = value;
					
					try {
						// Upload file to server
						const uploadFormData = new FormData();
						uploadFormData.append('file', file);
						
						const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/upload/messages`, {
							method: 'POST',
							body: uploadFormData,
						});
						
						if (!uploadResponse.ok) {
							throw new Error('Failed to upload file');
						}
						
						const uploadResult = await uploadResponse.json();
						
						const attachment = {
							filename: uploadResult.filename,
							url: uploadResult.url,
							fileType: uploadResult.fileType,
							size: uploadResult.size,
							uploadedAt: new Date(),
						};
						
						attachments.push(attachment);
						console.log('File uploaded successfully:', attachment);
						
					} catch (uploadError) {
						console.error('Error uploading file:', uploadError);
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
		}
		
		// Validate required fields
		if (!messageData.title || !messageData.content) {
			return NextResponse.json(
				{ error: "Title and content are required" },
				{ status: 400 }
			);
		}

		// Create message
		const message = await AdminMessage.create({
			...messageData,
			sentBy: sender._id,
			attachments: attachments,
		});

		// Populate sender info
		await message.populate("sentBy", "fullName email");

		// Send email notifications (async, don't wait for completion)
		sendEmailNotifications({
			title: messageData.title!,
			content: messageData.content!,
			priority: messageData.priority!,
			recipientType: messageData.recipientType!,
		}, sender).catch(error => {
			console.error("Error sending email notifications:", error);
		});

		return NextResponse.json({
			...message.toObject(),
			emailNotificationSent: true,
		}, { status: 201 });

	} catch (error) {
		console.error("Error creating message:", error);
		return NextResponse.json(
			{ error: "Failed to create message" },
			{ status: 500 }
		);
	}
}

// Helper function to send email notifications
async function sendEmailNotifications(messageData: {
	title: string;
	content: string;
	priority: string;
	recipientType: string;
}, sender: {
	fullName: string;
}) {
	try {
		// Only send emails if email service is configured
		if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
			console.log("Email service not configured - skipping email notifications");
			return;
		}

		// Get members who want to receive messages based on their preferences
		const emailQuery: {
			emailPreferences: { $exists: boolean };
			"emailPreferences.messages": boolean;
			membershipType?: string;
		} = {
			emailPreferences: { $exists: true },
			"emailPreferences.messages": true,
		};

		// Filter by recipient type
		if (messageData.recipientType === "executive") {
			emailQuery.membershipType = "executive";
		} else if (messageData.recipientType === "general") {
			emailQuery.membershipType = "general";
		}
		// 'all' means no additional filtering

		const targetMembers = await Membership.find(emailQuery).select("email fullName");
		
		if (targetMembers.length === 0) {
			console.log("No members found with message email preferences enabled");
			return;
		}

		// Get emails to exclude (those who don't want messages)
		const allMembers = await Membership.find({
			"emailPreferences.messages": { $ne: true }
		}).select("email");

		const excludeEmails = allMembers.map(member => member.email);

		// Send bulk emails
		const emailResult = await sendBulkMessages(
			messageData.title,
			messageData.content,
			sender.fullName,
			messageData.priority,
			messageData.recipientType,
			excludeEmails
		);

		console.log("Email notification result:", emailResult);

	} catch (error: unknown) {
		console.error("Error in sendEmailNotifications:", error);
		// Don't throw - we don't want to fail the message creation if emails fail
	}
}
