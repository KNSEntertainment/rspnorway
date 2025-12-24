import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student.Model";
import Attendance from "@/models/Attendance.Model";
import { sendAbsenceNoticeEmail } from "@/lib/email";

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
		const { absentStudentIds, reason } = body || {};
		if (!Array.isArray(absentStudentIds) || absentStudentIds.length === 0) {
			return NextResponse.json({ success: false, error: "No absent students provided" }, { status: 400 });
		}

		const students = await Student.find({ _id: { $in: absentStudentIds } });
		if (!students.length) {
			return NextResponse.json({ success: false, error: "Students not found" }, { status: 404 });
		}

		const sendTargets = students.filter((s) => s.guardianEmail);
		const results = await Promise.allSettled(
			sendTargets.map((student) =>
				sendAbsenceNoticeEmail(student.guardianEmail, {
					guardianName: student.guardianName,
					studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student",
					classGroup: student.classGroup,
					date: new Date(),
					reason: reason || "Marked absent",
					teacherName: auth.email,
				})
			)
		);

		const today = new Date();
		const dayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		await Promise.allSettled(
			sendTargets.map((student) =>
				Attendance.updateOne(
					{ studentId: student._id, date: dayOnly },
					{
						$setOnInsert: {
							status: "absent",
							classGroup: student.classGroup || "",
							markedBy: auth.email || "",
							note: reason || "Marked absent",
						},
						$set: { emailNotified: true, emailNotifiedAt: new Date() },
					},
					{ upsert: true }
				)
			)
		);

		const sent = results.filter((r) => r.status === "fulfilled").length;
		const failed = results.length - sent;
		const skipped = students.length - sendTargets.length;

		return NextResponse.json({ success: true, sent, failed, skipped, total: sendTargets.length }, { status: sent === sendTargets.length ? 200 : 207 });
	} catch (error) {
		console.error("Error sending absence emails:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
