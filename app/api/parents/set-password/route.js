import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student.Model";
import User from "@/models/User.Model";

export async function POST(request) {
	try {
		await connectDB();
		const body = await request.json();
		const email = String(body?.email || "")
			.trim()
			.toLowerCase();
		const password = String(body?.password || "").trim();

		if (!email || !password) {
			return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
		}

		if (password.length < 8) {
			return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
		}

		const guardianStudent = await Student.findOne({ guardianEmail: email });
		const existingUser = await User.findOne({ email });

		if (!guardianStudent && !existingUser) {
			return NextResponse.json({ success: false, error: "Parent account not found for this email." }, { status: 404 });
		}

		const hashed = await bcrypt.hash(password, 10);

		if (existingUser) {
			existingUser.password = hashed;
			if (!existingUser.userName) existingUser.userName = email;
			if (!existingUser.fullName && guardianStudent?.guardianName) existingUser.fullName = guardianStudent.guardianName;
			existingUser.role = existingUser.role || "parent";
			await existingUser.save();
		} else {
			await User.create({
				email,
				userName: email,
				fullName: guardianStudent?.guardianName || email,
				password: hashed,
				role: "parent",
			});
		}

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error("Error setting parent password:", error);
		return NextResponse.json({ success: false, error: "Failed to set password." }, { status: 500 });
	}
}
