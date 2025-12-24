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

export async function PATCH(req, { params }) {
	try {
		const payload = await getPayload(req);
		if (!payload) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		const teacher = await getTeacher(payload);
		if (!teacher) return NextResponse.json({ success: false, error: "Teacher record not found" }, { status: 404 });

		const todoId = params?.id;
		if (!todoId) return NextResponse.json({ success: false, error: "Missing todo id" }, { status: 400 });

		const body = await req.json();
		const updates = {};
		if (body.title !== undefined) updates.title = String(body.title).trim();
		if (body.description !== undefined) updates.description = String(body.description || "");
		if (body.priority !== undefined && ["low", "normal", "high"].includes(body.priority)) updates.priority = body.priority;
		if (body.status !== undefined && ["open", "in-progress", "done"].includes(body.status)) updates.status = body.status;
		if (body.dueDate !== undefined) updates.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
		if (body.classId !== undefined) updates.classId = body.classId || undefined;
		if (body.tags !== undefined) updates.tags = Array.isArray(body.tags) ? body.tags.filter(Boolean) : [];

		const todo = await TeacherTodo.findOneAndUpdate({ _id: todoId, teacherId: teacher._id }, updates, { new: true });
		if (!todo) return NextResponse.json({ success: false, error: "Todo not found" }, { status: 404 });

		return NextResponse.json({ success: true, todo }, { status: 200 });
	} catch (error) {
		console.error("Error updating todo:", error);
		return NextResponse.json({ success: false, error: error.message || "Failed to update to-do" }, { status: 500 });
	}
}

export async function DELETE(req, { params }) {
	try {
		const payload = await getPayload(req);
		if (!payload) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		const teacher = await getTeacher(payload);
		if (!teacher) return NextResponse.json({ success: false, error: "Teacher record not found" }, { status: 404 });

		const todoId = params?.id;
		if (!todoId) return NextResponse.json({ success: false, error: "Missing todo id" }, { status: 400 });

		const result = await TeacherTodo.deleteOne({ _id: todoId, teacherId: teacher._id });
		if (result.deletedCount === 0) {
			return NextResponse.json({ success: false, error: "Todo not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error("Error deleting todo:", error);
		return NextResponse.json({ success: false, error: error.message || "Failed to delete to-do" }, { status: 500 });
	}
}
