import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import crypto from "crypto";
import { sendEmailVerificationEmail } from "@/lib/email";

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map();

function rateLimit(ip: string, limit: number = 3, windowMs: number = 60 * 60 * 1000) {
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

export async function GET(req: NextRequest) {
	await connectDB();
	const { searchParams } = new URL(req.url);
	const email = searchParams.get("email");

	if (email) {
		// Check if email exists
		const membership = await Membership.findOne({ email });
		return NextResponse.json(membership);
	}

	// Return all memberships if no email filter
	const memberships = await Membership.find().sort({ createdAt: -1 });
	return NextResponse.json(memberships);
}

export async function POST(req: NextRequest) {
	try {
		const ip = (req.headers.get('x-forwarded-for') as string)?.split(',')[0] || 
				  req.headers.get('x-real-ip') || 
				  'unknown';
		const rateLimitResult = rateLimit(ip);
		
		if (!rateLimitResult.success) {
			return NextResponse.json({
				error: "Too many registration attempts. Please try again later.",
				resetTime: rateLimitResult.resetTime
			}, { status: 429 });
		}

		await connectDB();
		const data = await req.json();

		// Validate captcha
		if (!data.captchaId) {
			return NextResponse.json({ error: "Captcha verification required" }, { status: 400 });
		}

		// Validate captcha with the captcha store
		const { captchaStore } = await import('@/lib/captcha-store');
		const storedCaptcha = captchaStore.get(data.captchaId);
		
		if (!storedCaptcha || storedCaptcha.expires < Date.now()) {
			return NextResponse.json({ error: "Captcha expired or invalid" }, { status: 400 });
		}

		// Remove captcha after validation attempt (one-time use)
		captchaStore.delete(data.captchaId);

		// Validate required fields
		const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode', 'dateOfBirth', 'gender', 'agreeTerms'];
		for (const field of requiredFields) {
			if (!data[field]) {
				return NextResponse.json({ error: `${field} is required` }, { status: 400 });
			}
		}

		// Check if email already exists
		const existingMembership = await Membership.findOne({ email: data.email });
		if (existingMembership) {
			return NextResponse.json({ error: "Email already registered" }, { status: 400 });
		}

		// Generate email verification token
		const emailVerificationToken = crypto.randomBytes(32).toString('hex');
		const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Create membership with verification token
		const membershipData = {
			...data,
			emailVerificationToken,
			emailVerificationExpiry,
			membershipStatus: "pending", // Always start as pending
		};

		const membership = await Membership.create(membershipData);

		// Send email verification
		const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/verify-email?token=${emailVerificationToken}`;
		await sendEmailVerificationEmail({
			name: data.fullName,
			email: data.email,
			verificationUrl,
			userType: "member"
		});

		return NextResponse.json({
			success: true,
			message: "Membership application submitted successfully! Please check your email to verify your account.",
			membership: {
				id: membership._id,
				fullName: membership.fullName,
				email: membership.email,
				membershipStatus: membership.membershipStatus
			}
		}, { status: 201 });

	} catch (error: unknown) {
		console.error("Membership registration error:", error);
		return NextResponse.json({ 
			error: error instanceof Error ? error.message : "Failed to submit membership application" 
		}, { status: 500 });
	}
}
