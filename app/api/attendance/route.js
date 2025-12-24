import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance.Model";
import Student from "@/models/Student.Model";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

async function getAuth(req) {
	try {
		const tokenObj = req.cookies.get("authToken");
		const token = tokenObj?.value;
		if (!token || !JWT_SECRET) return null;
		const secretKey = new TextEncoder().encode(JWT_SECRET);
		const { payload } = await jwtVerify(token, secretKey);
		return { email: payload.email, role: payload.role };
	} catch {
		return null;
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
		const { entries } = body || {};
		if (!Array.isArray(entries) || entries.length === 0) {
			return NextResponse.json({ success: false, error: "No attendance entries" }, { status: 400 });
		}

		const docs = entries
			.map((item) => {
				if (!item?.studentId || !item?.status) return null;
				const dayOnly = item.date ? new Date(item.date) : new Date();
				const normalized = new Date(dayOnly.getFullYear(), dayOnly.getMonth(), dayOnly.getDate());
				return {
					studentId: item.studentId,
					date: normalized,
					status: item.status === "absent" ? "absent" : "present",
					classGroup: item.classGroup || "",
					markedBy: auth.email || "",
					note: item.note || "",
				};
			})
			.filter(Boolean);

		if (!docs.length) {
			return NextResponse.json({ success: false, error: "No valid entries" }, { status: 400 });
		}

		const bulkOps = docs.map((doc) => ({
			updateOne: {
				filter: { studentId: doc.studentId, date: doc.date },
				update: { $set: doc },
				upsert: true,
			},
		}));

		const result = await Attendance.bulkWrite(bulkOps, { ordered: false });
		return NextResponse.json({ success: true, upserted: result.upsertedCount || 0, modified: result.modifiedCount || 0 }, { status: 200 });
	} catch (error) {
		console.error("Error saving attendance:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
		const start = searchParams.get("start");
		const end = searchParams.get("end");
		const classGroup = searchParams.get("classGroup");
		const studentId = searchParams.get("studentId");

		const filter = {};
		if (start || end) {
			filter.date = {};
			if (start) filter.date.$gte = new Date(start);
			if (end) filter.date.$lte = new Date(end);
		}
		if (classGroup) filter.classGroup = classGroup;
		if (studentId) filter.studentId = studentId;

		const records = await Attendance.find(filter).sort({ date: -1 });

		const students = await Student.find({ _id: { $in: records.map((r) => r.studentId) } }).select("firstName lastName classGroup guardianName guardianEmail");
		const studentMap = Object.fromEntries(students.map((s) => [s._id.toString(), s]));

		const enriched = records.map((rec) => ({
			...rec.toObject(),
			student: studentMap[rec.studentId.toString()] || null,
		}));

		return NextResponse.json({ success: true, records: enriched }, { status: 200 });
	} catch (error) {
		console.error("Error fetching attendance:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
