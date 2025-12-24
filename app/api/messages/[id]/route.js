import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message.Model";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

async function getAuth(req) {
	try {
		const tokenObj = req.cookies.get("authToken");
		const token = tokenObj?.value;
		if (!token || !JWT_SECRET) return null;
		const secretKey = new TextEncoder().encode(JWT_SECRET);
		const { payload } = await jwtVerify(token, secretKey);
		return { email: payload.email, role: payload.role, name: payload.name };
	} catch {
		return null;
	}
}

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function PATCH(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const replyText = typeof body.body === "string" ? body.body.trim() : "";
		const status = typeof body.status === "string" ? body.status.trim() : "";
		const markRead = Boolean(body.markRead);

		if (!replyText && !status && !markRead) {
			return NextResponse.json({ success: false, error: "No updates provided" }, { status: 400 });
		}

		const existing = await Message.findById(id);
		if (!existing) {
			return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
		}
		if (auth.role === "parent" && auth.email && String(existing.email).toLowerCase() !== String(auth.email).toLowerCase()) {
			return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
		}

		const now = new Date();
		const update = {};
		const senderType = auth.role === "parent" ? "parent" : "teacher";
		const push = replyText
			? {
				messages: {
					senderType,
					senderName: auth.name || auth.email || (senderType === "teacher" ? "Teacher" : "Parent"),
					body: replyText,
					via: senderType === "parent" ? "parent-dashboard" : "teacher-dashboard",
					createdAt: now,
				},
			}
			: null;

		if (replyText) {
			update.lastMessageAt = now;
			if (senderType === "parent") {
				update.unreadForTeacher = true;
				update.unreadForParent = false;
			} else {
				update.unreadForParent = true;
				update.unreadForTeacher = false;
			}
			if (!status) update.status = "open";
		}
		if (status) {
			update.status = status === "closed" ? "closed" : "open";
		}
		if (markRead) {
			update.unreadForTeacher = false;
		}

		const updatedMessage = await Message.findByIdAndUpdate(
			id,
			{
				...(push ? { $push: push } : {}),
				...(Object.keys(update).length ? { $set: update } : {}),
			},
			{ new: true }
		);

		return NextResponse.json({ success: true, message: updatedMessage }, { status: 200 });
	} catch (error) {
		console.error("Error updating message:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const messageId = id;
		const existing = await Message.findById(messageId);
		if (!existing) {
			return NextResponse.json({ success: false, error: "message not found" }, { status: 404 });
		}
		if (auth.role === "parent" && auth.email && String(existing.email).toLowerCase() !== String(auth.email).toLowerCase()) {
			return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
		}

		const deletedmessage = await Message.findByIdAndDelete(messageId);

		if (!deletedmessage) {
			return NextResponse.json({ success: false, error: "message not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "Message deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const messageId = id;
		const message = await Message.findById(messageId);

		if (!message) {
			return NextResponse.json({ success: false, error: "message not found" }, { status: 404 });
		}

		if (auth.role === "parent" && auth.email && String(message.email).toLowerCase() !== String(auth.email).toLowerCase()) {
			return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
		}

		return NextResponse.json({ success: true, message }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
