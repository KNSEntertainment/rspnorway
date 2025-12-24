import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher.Model";
import { sendTeacherInviteEmail } from "@/lib/email";

export async function POST(request) {
	try {
		await connectDB();
		const body = await request.json();
		const email = String(body?.email || "")
			.trim()
			.toLowerCase();
		if (!email) {
			return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
		}

		const teacher = await Teacher.findOne({ email });
		if (!teacher) {
			return NextResponse.json({ success: false, error: "Teacher not found" }, { status: 404 });
		}

		const inviteToken = crypto.randomBytes(24).toString("hex");
		const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		teacher.inviteToken = inviteToken;
		teacher.inviteExpires = inviteExpires;
		teacher.inviteSentAt = new Date();
		await teacher.save();

		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
		const passwordSetUrl = `${baseUrl}/user?email=${encodeURIComponent(email)}&token=${inviteToken}`;

		await sendTeacherInviteEmail(email, {
			teacherName: `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || "Teacher",
			employeeId: teacher.employeeId || "",
			designation: teacher.designation || "Teacher",
			passwordSetUrl,
			username: email,
		});

		return NextResponse.json({ success: true, message: "Invite resent" }, { status: 200 });
	} catch (error) {
		console.error("Error resending teacher invite:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
