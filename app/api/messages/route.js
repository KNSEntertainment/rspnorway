import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message.Model";
import Student from "@/models/Student.Model";

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

export async function GET(request) {
	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status") || "all";
		const priority = searchParams.get("priority") || "all";

		const filter = {};
		if (auth?.role === "parent" && auth.email) {
			filter.email = auth.email;
		}
		if (status !== "all") filter.status = status;
		if (priority !== "all") filter.priority = priority;

		const messages = await Message.find(filter).sort({ lastMessageAt: -1, createdAt: -1 });
		return NextResponse.json({ success: true, messages }, { status: 200 });
	} catch (error) {
		console.error("Error fetching messages:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const studentId = String(body.studentId || "").trim();
		const topic = String(body.topic || "Teacher update").trim();
		const priority = String(body.priority || "normal").trim();
		const messageText = String(body.message || "").trim();

		if (!studentId || !messageText) {
			return NextResponse.json({ success: false, error: "Student and message are required" }, { status: 400 });
		}

		const student = await Student.findById(studentId);
		if (!student) {
			return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
		}

		const guardianName = student.guardianName || "Parent/Guardian";
		const [guardianFirst = "Parent", ...guardianRest] = guardianName.split(" ").filter(Boolean);
		const guardianLast = guardianRest.join(" ");
		const childName = `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student";
		const classGroup = student.classGroup || "";
		const guardianEmail = student.guardianEmail || "";
		const guardianPhone = student.guardianPhone || "";

		const now = new Date();
		const senderType = auth.role === "parent" ? "parent" : "teacher";
		const senderName = auth.name || auth.email || (senderType === "teacher" ? "Teacher" : "Parent");
		const via = auth.role === "parent" ? "parent-dashboard" : "teacher-dashboard";

		const newMessage = await Message.create({
			studentId,
			firstName: guardianFirst,
			lastName: guardianLast,
			email: guardianEmail,
			phone: guardianPhone,
			childName,
			classGroup,
			relation: "Parent/Guardian",
			topic,
			priority: priority === "urgent" ? "urgent" : "normal",
			status: "open",
			message: messageText,
			messages: [
				{
					senderType,
					senderName,
					body: messageText,
					via,
					createdAt: now,
				},
			],
			lastMessageAt: now,
			unreadForTeacher: senderType === "parent",
			unreadForParent: senderType === "teacher",
			teacherEmail: senderType === "teacher" ? auth.email || "" : "",
		});

		return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
	} catch (error) {
		console.error("Error creating message:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
