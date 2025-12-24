import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";
import Login from "@/models/Login.Model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const COOKIE_NAME = "authToken";

export async function POST(req) {
	await connectDB();

	try {
		const data = await req.json();
		const { email, password } = data;

		if (!email || !password) {
			return NextResponse.json({ error: "All fields are required." }, { status: 400 });
		}

		// Check if the user exists
		const existingUser = await User.findOne({ email });
		if (!existingUser) {
			return NextResponse.json({ success: false, message: "You have not been registered yet!" });
		}

		// Validate password
		const passwordMatch = await bcrypt.compare(password, existingUser.password);
		if (!passwordMatch) {
			return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
		}

		// Record login time
		const newLogin = new Login({ email, time: new Date() });
		await newLogin.save();

		// Create JWT token
		const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, JWT_SECRET, { expiresIn: "1h" });

		// Set the token as a cookie
		const response = NextResponse.json({
			success: true,
			message: "User logged in successfully!",
		});

		response.cookies.set(COOKIE_NAME, token, {
			httpOnly: true, // Prevents JavaScript access to the cookie
			secure: process.env.NODE_ENV === "production", // Use secure cookies in production
			maxAge: 3600, // 1 hour
			path: "/", // Cookie is accessible throughout the app
		});

		return response;
	} catch (error) {
		return NextResponse.json({ error: "Failed to log in user." + error }, { status: 500 });
	}
}
