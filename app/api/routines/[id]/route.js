import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import ClassRoutine from "@/models/ClassRoutine.Model";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

async function getAuth(req) {
	try {
		const tokenObj = req.cookies.get("authToken");
		const token = tokenObj?.value;
		if (!token || !JWT_SECRET) return null;
		const secretKey = new TextEncoder().encode(JWT_SECRET);
		const { payload } = await jwtVerify(token, secretKey);
		return payload;
	} catch {
		return null;
	}
}

export async function PATCH(request, { params }) {
	const { id } = params;
	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth || auth.role !== "admin") {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const allowed = ["classId", "teacherId", "day", "subject", "startTime", "endTime", "room"];
		const updates = {};
		for (const key of allowed) {
			if (body[key] !== undefined) updates[key] = body[key];
		}

		const updated = await ClassRoutine.findByIdAndUpdate(id, updates, { new: true });
		if (!updated) {
			return NextResponse.json({ success: false, error: "Routine not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, routine: updated }, { status: 200 });
	} catch (error) {
		console.error("Error updating routine:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = params;
	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth || auth.role !== "admin") {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const deleted = await ClassRoutine.findByIdAndDelete(id);
		if (!deleted) {
			return NextResponse.json({ success: false, error: "Routine not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "Routine deleted" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting routine:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET(request, { params }) {
	const { id } = params;
	try {
		await connectDB();
		const routine = await ClassRoutine.findById(id);
		if (!routine) {
			return NextResponse.json({ success: false, error: "Routine not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true, routine }, { status: 200 });
	} catch (error) {
		console.error("Error fetching routine:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
