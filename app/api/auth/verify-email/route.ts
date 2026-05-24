import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import User from "@/models/User.Model";
import crypto from "crypto";
import { sendEmailVerificationEmail } from "@/lib/email";

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map();

function rateLimit(ip: string, limit: number = 5, windowMs: number = 15 * 60 * 1000) {
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
				error: "Too many verification attempts. Please try again later.",
				resetTime: rateLimitResult.resetTime
			}, { status: 429 });
		}

		await connectDB();
		const body = await req.json();
		const { action, email, token } = body;

		// Handle email verification request
		if (action === "request") {
			if (!email) {
				return NextResponse.json({ error: "Email is required" }, { status: 400 });
			}
			return await handleEmailVerificationRequest(email);
		}

		// Handle email verification confirmation
		if (action === "verify") {
			if (!token) {
				return NextResponse.json({ error: "Token is required" }, { status: 400 });
			}
			return await handleEmailVerification(token);
		}

		return NextResponse.json({ error: "Invalid action" }, { status: 400 });

	} catch (error: unknown) {
		console.error("Email verification error:", error);
		return NextResponse.json({ 
			error: error instanceof Error ? error.message : "Failed to process email verification" 
		}, { status: 500 });
	}
}

async function handleEmailVerificationRequest(email: string) {
	const verificationToken = crypto.randomBytes(32).toString('hex');
	const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	console.log("Email verification request for:", email);

	// Try to find member first
	let user = await Membership.findOne({ email });
	let userType = "member";

	if (!user) {
		// Try to find admin user
		user = await User.findOne({ email, isActive: true });
		userType = "admin";
	}

	if (!user) {
		// Don't reveal if email exists or not for security
		return NextResponse.json({ 
			success: true, 
			message: "If an account with this email exists, a verification link has been sent." 
		});
	}

	// Skip if already verified
	if (user.emailVerified) {
		return NextResponse.json({ 
			success: true, 
			message: "Email is already verified." 
		});
	}

	// Clear any existing verification tokens
	if (userType === "admin") {
		await User.findByIdAndUpdate(user._id, {
			emailVerificationToken: undefined,
			emailVerificationExpiry: undefined,
		});
		
		// Save new token
		await User.findByIdAndUpdate(user._id, {
			emailVerificationToken: verificationToken,
			emailVerificationExpiry: tokenExpiry,
		});
	} else {
		await Membership.findByIdAndUpdate(user._id, {
			emailVerificationToken: undefined,
			emailVerificationExpiry: undefined,
		});
		
		await Membership.findByIdAndUpdate(user._id, {
			emailVerificationToken: verificationToken,
			emailVerificationExpiry: tokenExpiry,
		});
	}

	const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/verify-email?token=${verificationToken}`;

	// Send email verification
	await sendEmailVerificationEmail({ 
		name: user.fullName, 
		email, 
		verificationUrl,
		userType
	});

	return NextResponse.json({ 
		success: true, 
		message: "Email verification link sent successfully" 
	});
}

async function handleEmailVerification(token: string) {
	if (!token) {
		return NextResponse.json({ error: "Token is required" }, { status: 400 });
	}

	// Try admin user first
	const user = await User.findOne({
		emailVerificationToken: token,
		emailVerificationExpiry: { $gt: Date.now() },
		isActive: true
	});

	if (user) {
		// Update user and clear verification token
		await User.findByIdAndUpdate(user._id, {
			emailVerified: true,
			emailVerificationToken: undefined,
			emailVerificationExpiry: undefined,
		});

		console.log("Email verified successfully for admin user:", user.email);
		return NextResponse.json({ success: true, message: "Email verified successfully" });
	}

	// Try membership
	const member = await Membership.findOne({
		emailVerificationToken: token,
		emailVerificationExpiry: { $gt: Date.now() },
		membershipStatus: { $in: ["pending", "approved"] }
	});

	if (member) {
		// Generate password setup token
		const setupToken = crypto.randomBytes(32).toString('hex');
		const setupTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Update member, clear verification token, and add setup token
		await Membership.findByIdAndUpdate(member._id, {
			emailVerified: true,
			emailVerificationToken: undefined,
			emailVerificationExpiry: undefined,
			passwordSetupToken: setupToken,
			passwordSetupTokenExpiry: setupTokenExpiry,
		});

		console.log("Email verified successfully for member:", member.email);
		return NextResponse.json({ 
			success: true, 
			message: "Email verified successfully!",
			setupToken: setupToken
		});
	}

	return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
}
