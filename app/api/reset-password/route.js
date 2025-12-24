import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";
import bcrypt from "bcryptjs";

export async function POST(request) {
	try {
		await connectDB();
		const { token, password } = await request.json();
		if (!token || !password) {
			return NextResponse.json({ success: false, error: "Missing token or password." }, { status: 400 });
		}
		// Find user by resetToken and check expiry
		const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
		if (!user) {
			return NextResponse.json({ success: false, error: "Invalid or expired token." }, { status: 400 });
		}
		// Hash new password
		const hashed = await bcrypt.hash(password, 10);
		user.password = hashed;
		user.resetToken = undefined;
		user.resetTokenExpiry = undefined;
		await user.save();
		return NextResponse.json({ success: true, message: "Password reset successful." }, { status: 200 });
	} catch (error) {
		console.error("Error resetting password:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
