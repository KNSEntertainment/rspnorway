import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
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

		const user = await User.findOne({ email });
		if (!user) {
			return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
		}

		return NextResponse.json({ success: true, user: { email: user.email, name: user.fullName, role: user.role || "parent" } }, { status: 200 });
	} catch (error) {
		console.error("Parent login error:", error);
		return NextResponse.json({ success: false, error: "Failed to login." }, { status: 500 });
	}
}
