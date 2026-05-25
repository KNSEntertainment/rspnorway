import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import User from "@/models/User.Model";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
	try {
		await connectDB();
		
		const { email } = await request.json();
		
		if (!email) {
			return NextResponse.json({ 
				success: false, 
				error: "Email is required" 
			}, { status: 400 });
		}

		// First check if it's an admin user
		const user = await User.findOne({ email });
		
		// If not admin, check if it's an approved member
		const member = !user ? await Membership.findOne({ 
			email,
			membershipStatus: "approved" // Only approved members can reset password
		}) : null;
		
		if (!user && !member) {
			return NextResponse.json({ 
				success: false, 
				error: "No account found with this email" 
			}, { status: 404 });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString('hex');
		const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now

		let resetUrl, userName, userType;

		if (user) {
			// Handle admin user password reset

			// Clear any existing reset tokens first
			await User.findByIdAndUpdate(user._id, {
				resetToken: undefined,
				resetTokenExpiry: undefined,
			});

			// Save the new token to the user record
			await User.findByIdAndUpdate(user._id, {
				resetToken: resetToken,
				resetTokenExpiry: tokenExpiry,
			});

			resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/reset-password?token=${resetToken}`;
			userName = user.fullName;
			userType = "admin";
		} else {
			// Handle member password reset

			// Clear any existing reset tokens first
			await Membership.findByIdAndUpdate(member._id, {
				passwordResetToken: undefined,
				passwordResetTokenExpiry: undefined,
			});

			// Save the new token to the membership record
			await Membership.findByIdAndUpdate(member._id, {
				passwordResetToken: resetToken,
				passwordResetTokenExpiry: tokenExpiry,
			});

			resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/reset-password?token=${resetToken}`;
			userName = member.fullName;
			userType = "member";
		}

		// Send password reset email
		await sendPasswordResetEmail({ 
			name: userName, 
			email, 
			resetUrl,
			userType
		});

		return NextResponse.json({ 
			success: true, 
			message: "Password reset link sent successfully" 
		});

	} catch (error) {
		return NextResponse.json({ 
			success: false, 
			error: error instanceof Error ? error.message : "Failed to send password reset email"
		}, { status: 500 });
	}
}
