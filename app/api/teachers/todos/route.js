import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher.Model";
import TeacherTodo from "@/models/TeacherTodo.Model";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

async function getPayload(req) {
	const tokenObj = req.cookies.get("authToken");
	const token = tokenObj?.value;
	if (!token) return null;
	const secretKey = new TextEncoder().encode(JWT_SECRET);
	const { payload } = await jwtVerify(token, secretKey);
	return payload;
}

async function getTeacher(payload) {
	if (!payload?.email) return null;
	await connectDB();
	const teacher = await Teacher.findOne({ email: payload.email.trim().toLowerCase() });
	return teacher;
}

export async function GET(req) {
	try {
		const payload = await getPayload(req);
		if (!payload) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		const teacher = await getTeacher(payload);
		if (!teacher) return NextResponse.json({ success: false, error: "Teacher record not found" }, { status: 404 });

		const todos = await TeacherTodo.find({ teacherId: teacher._id }).sort({ createdAt: -1 }).lean();
		return NextResponse.json({ success: true, todos }, { status: 200 });
	} catch (error) {
		console.error("Error fetching todos:", error);
		return NextResponse.json({ success: false, error: error.message || "Failed to load to-dos" }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const payload = await getPayload(req);
		if (!payload) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		const teacher = await getTeacher(payload);
		if (!teacher) return NextResponse.json({ success: false, error: "Teacher record not found" }, { status: 404 });

		const body = await req.json();
		const { title, description = "", status = "open", priority = "normal", dueDate, classId, tags = [] } = body || {};
		if (!title || !String(title).trim()) {
			return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
		}

		const todo = await TeacherTodo.create({
			teacherId: teacher._id,
			title: String(title).trim(),
			description: String(description || ""),
			status: ["open", "in-progress", "done"].includes(status) ? status : "open",
			priority: ["low", "normal", "high"].includes(priority) ? priority : "normal",
			dueDate: dueDate ? new Date(dueDate) : undefined,
			classId: classId || undefined,
			tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
		});

		return NextResponse.json({ success: true, todo }, { status: 201 });
	} catch (error) {
		console.error("Error creating todo:", error);
		return NextResponse.json({ success: false, error: error.message || "Failed to create to-do" }, { status: 500 });
	}
}
