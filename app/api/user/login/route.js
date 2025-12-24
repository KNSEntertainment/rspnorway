import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const COOKIE_NAME = "authToken";

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

		const match = await bcrypt.compare(password, user.password || "");
		if (!match) {
			return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
		}

		if (!JWT_SECRET) {
			return NextResponse.json({ success: false, error: "Server configuration error." }, { status: 500 });
		}

		const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

		const response = NextResponse.json({ success: true, user: { email: user.email, name: user.fullName, role: user.role || null } }, { status: 200 });

		response.cookies.set(COOKIE_NAME, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 3600,
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("User login error:", error);
		return NextResponse.json({ success: false, error: "Failed to login." }, { status: 500 });
	}
}
