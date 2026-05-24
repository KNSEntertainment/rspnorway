import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";
import Membership from "@/models/Membership.Model";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map();

function rateLimit(ip: string, limit: number = 3, windowMs: number = 15 * 60 * 1000) {
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
		const ip = (req.headers.get('x-forwarded-for') as string)?.split(',')[0] || 
				  req.headers.get('x-real-ip') || 
				  'unknown';
		const rateLimitResult = rateLimit(ip);
		
		if (!rateLimitResult.success) {
			return NextResponse.json({
				error: "Too many password reset attempts. Please try again later.",
				resetTime: rateLimitResult.resetTime
			}, { status: 429 });
		}

		await connectDB();
		const { email, action } = await req.json();

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Handle password reset request
		if (action === "request") {
			return await handlePasswordResetRequest(email);
		}

		// Handle password reset confirmation
		if (action === "reset") {
			const { token, password } = await req.json();
			return await handlePasswordReset(token, password);
		}

		return NextResponse.json({ error: "Invalid action" }, { status: 400 });

	} catch (error: unknown) {
		console.error("Password reset error:", error);
		return NextResponse.json({ 
			error: error instanceof Error ? error.message : "Failed to process password reset" 
		}, { status: 500 });
	}
}

async function handlePasswordResetRequest(email: string) {
	const resetToken = crypto.randomBytes(32).toString('hex');
	const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

	console.log("Password reset request for:", email);

	// Try to find admin user first
	let user = await User.findOne({ email, isActive: true });
	let userType = "admin";

	if (!user) {
		// Try to find member
		user = await Membership.findOne({ 
			email, 
			membershipStatus: { $in: ["pending", "approved"] }
		});
		userType = "member";
	}

	if (!user) {
		// Don't reveal if email exists or not for security
		return NextResponse.json({ 
			success: true, 
			message: "If an account with this email exists, a password reset link has been sent." 
		});
	}

	// Clear any existing reset tokens
	if (userType === "admin") {
		await User.findByIdAndUpdate(user._id, {
			resetToken: undefined,
			resetTokenExpiry: undefined,
		});
		
		// Save new token
		await User.findByIdAndUpdate(user._id, {
			resetToken,
			resetTokenExpiry: tokenExpiry,
		});
	} else {
		await Membership.findByIdAndUpdate(user._id, {
			passwordResetToken: undefined,
			passwordResetTokenExpiry: undefined,
		});
		
		await Membership.findByIdAndUpdate(user._id, {
			passwordResetToken: resetToken,
			passwordResetTokenExpiry: tokenExpiry,
		});
	}

	const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/reset-password?token=${resetToken}`;

	// Send password reset email
	await sendPasswordResetEmail({ 
		name: user.fullName, 
		email, 
		resetUrl,
		userType
	});

	return NextResponse.json({ 
		success: true, 
		message: "Password reset link sent successfully" 
	});
}

async function handlePasswordReset(token: string, password: string) {
	if (!token || !password) {
		return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
	}

	if (password.length < 6) {
		return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
	}

	// Try admin user first
	const user = await User.findOne({
		resetToken: token,
		resetTokenExpiry: { $gt: Date.now() },
		isActive: true
	});

	if (user) {
		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Update user and clear reset token
		await User.findByIdAndUpdate(user._id, {
			password: hashedPassword,
			resetToken: undefined,
			resetTokenExpiry: undefined,
			lastLoginAt: new Date()
		});

		console.log("Password reset successfully for admin user:", user.email);
		return NextResponse.json({ success: true, message: "Password reset successfully" });
	}

	// Try membership
	const member = await Membership.findOne({
		passwordResetToken: token,
		passwordResetTokenExpiry: { $gt: Date.now() },
		membershipStatus: { $in: ["pending", "approved"] }
	});

	if (member) {
		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Update member and clear reset token
		await Membership.findByIdAndUpdate(member._id, {
			password: hashedPassword,
			passwordResetToken: undefined,
			passwordResetTokenExpiry: undefined,
			lastLoginAt: new Date()
		});

		console.log("Password reset successfully for member:", member.email);
		return NextResponse.json({ success: true, message: "Password reset successfully" });
	}

	return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
}
