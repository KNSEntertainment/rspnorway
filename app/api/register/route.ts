import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function rateLimit(ip: string, limit: number = 2, windowMs: number = 60 * 60 * 1000): { success: boolean; resetTime?: number } {
	const now = Date.now();
	const windowStart = now - windowMs;
	
	// Clean old entries
	for (const [key, data] of rateLimitStore.entries()) {
		if (data.windowStart < windowStart) {
			rateLimitStore.delete(key);
		}
	}
	
	const record = rateLimitStore.get(ip);
	if (!record) {
		rateLimitStore.set(ip, { count: 1, windowStart: now });
		return { success: true };
	}
	
	if (record.windowStart < windowStart) {
		// Reset window
		rateLimitStore.set(ip, { count: 1, windowStart: now });
		return { success: true };
	}
	
	if (record.count >= limit) {
		return { success: false, resetTime: record.windowStart + windowMs };
	}
	
	record.count++;
	return { success: true };
}

export async function POST(req: NextRequest) {
	try {
		const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 
				  req.headers.get('x-real-ip') || 
				  'unknown';
		const rateLimitResult = rateLimit(ip);
		
		if (!rateLimitResult.success) {
			return NextResponse.json({
				error: "Too many user creation attempts. Please try again later.",
				resetTime: rateLimitResult.resetTime
			}, { status: 429 });
		}

		// Check if current user is authenticated and is admin
		const session = await getServerSession(authOptions);
		if (!session || session.user?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized. Only admins can create users." }, { status: 401 });
		}

		await connectDB();
		const data = await req.json();

		const { fullName, email, userName, password } = data;
		if (!fullName || !email || !userName || !password) {
			return NextResponse.json({ error: "All fields are required." }, { status: 400 });
		}

		// Validate password strength
		if (password.length < 8) {
			return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
		}

		// Check if the email already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return NextResponse.json({ error: "Email already in use." }, { status: 400 });
		}

		// Check if username already exists
		const existingUsername = await User.findOne({ userName });
		if (existingUsername) {
			return NextResponse.json({ error: "Username already in use." }, { status: 400 });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create a new admin user
		const newUser = new User({
			fullName,
			email,
			userName,
			password: hashedPassword,
			role: "admin", // Always admin role
			emailVerified: true, // Auto-verify admin users
			createdBy: (session.user as { _id: string })?._id, // Track who created this user
		});

		// Save the user to the database
		await newUser.save();

		// Don't return password in response
		const userResponse = {
			id: newUser._id,
			fullName: newUser.fullName,
			email: newUser.email,
			userName: newUser.userName,
			role: newUser.role,
			emailVerified: newUser.emailVerified,
			createdAt: newUser.createdAt,
		};

		return NextResponse.json({ 
			success: true, 
			message: "Admin user created successfully!",
			user: userResponse
		});
	} catch (error: unknown) {
		console.error("Error creating admin user:", error);
		return NextResponse.json({ error: "Failed to create admin user." }, { status: 500 });
	}
}

// GET endpoint to list admin users (admin only)
export async function GET() {
	try {
		// Check if current user is authenticated and is admin
		const session = await getServerSession(authOptions);
		if (!session || session.user?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized. Only admins can view users." }, { status: 401 });
		}

		await connectDB();
		
		const users = await User.find({ role: "admin" })
			.select("-password -resetToken -resetTokenExpiry -emailVerificationToken -emailVerificationExpiry")
			.sort({ createdAt: -1 });

		return NextResponse.json({ users });
	} catch (error: unknown) {
		console.error("Error fetching admin users:", error);
		return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
	}
}
