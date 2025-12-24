import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";
import Teacher from "@/models/Teacher.Model";

export async function POST(request) {
	try {
		await connectDB();
		const body = await request.json();
		const email = String(body?.email || "")
			.trim()
			.toLowerCase();
		const token = String(body?.token || "").trim();
		const password = String(body?.password || "").trim();

		if (!email || !token || !password) {
			return NextResponse.json({ success: false, error: "Email, token, and password are required." }, { status: 400 });
		}
		if (password.length < 8) {
			return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
		}

		const teacher = await Teacher.findOne({ email, inviteToken: token });
		if (!teacher) {
			return NextResponse.json({ success: false, error: "Invalid or expired invite." }, { status: 400 });
		}
		if (teacher.inviteExpires && teacher.inviteExpires < new Date()) {
			return NextResponse.json({ success: false, error: "Invite link has expired." }, { status: 400 });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return NextResponse.json({ success: false, error: "User account not found." }, { status: 404 });
		}

		const hashed = await bcrypt.hash(password, 10);
		user.password = hashed;
		await user.save();

		teacher.status = "active";
		teacher.inviteToken = undefined;
		teacher.inviteExpires = undefined;
		teacher.inviteSentAt = teacher.inviteSentAt || new Date();
		await teacher.save();

		return NextResponse.json({ success: true, message: "Password set. You can now log in." }, { status: 200 });
	} catch (error) {
		console.error("Error setting password:", error);
		return NextResponse.json({ success: false, error: "Failed to set password." }, { status: 500 });
	}
}
