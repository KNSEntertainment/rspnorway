import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import ClassRoutine from "@/models/ClassRoutine.Model";
import mongoose from "mongoose";

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

export async function GET(request) {
	try {
		await connectDB();
		const { searchParams } = new URL(request.url);
		const classId = searchParams.get("classId");
		const teacherId = searchParams.get("teacherId");

		const filter = {};
		if (classId) filter.classId = mongoose.Types.ObjectId.isValid(classId) ? new mongoose.Types.ObjectId(classId) : classId;
		if (teacherId) filter.teacherId = mongoose.Types.ObjectId.isValid(teacherId) ? new mongoose.Types.ObjectId(teacherId) : teacherId;

		const routines = await ClassRoutine.find(filter).sort({ classId: 1, day: 1, startTime: 1 }).lean();
		return NextResponse.json({ success: true, routines }, { status: 200 });
	} catch (error) {
		console.error("Error fetching routines:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth || auth.role !== "admin") {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { classId, teacherId, day, subject, startTime, endTime, room = "" } = body || {};

		if (!classId || !teacherId || !day || !subject || !startTime || !endTime) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		const routine = await ClassRoutine.create({
			classId,
			teacherId,
			day,
			subject,
			startTime,
			endTime,
			room,
			createdBy: auth.email || "",
		});

		return NextResponse.json({ success: true, routine }, { status: 201 });
	} catch (error) {
		console.error("Error creating routine:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
