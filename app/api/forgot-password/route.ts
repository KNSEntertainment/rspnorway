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

		// First try to find user in User model
		const user = await User.findOne({ email });
		let resetUrl = "";
		let userName = "";
		let userType = "user";

		// If not found in User model, try Membership model
		if (!user) {
			const member = await Membership.findOne({ 
				email,
				membershipStatus: "approved" // Only approved members can reset password
			});
			
			if (!member) {
				return NextResponse.json({ 
					success: false, 
					error: "No account found with this email" 
				}, { status: 404 });
			}

			// Generate reset token for member
			const resetToken = crypto.randomBytes(32).toString('hex');
			const currentTime = new Date();
			const tokenExpiry = new Date(currentTime.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now

			console.log("Generated reset token for member:", { 
				memberId: member._id, 
				memberEmail: member.email,
				resetToken: resetToken.substring(0, 10) + "...",
				currentTime: currentTime.toISOString(),
				tokenExpiry: tokenExpiry.toISOString(),
				timeDifferenceMs: tokenExpiry.getTime() - currentTime.getTime(),
				timeDifferenceHours: (tokenExpiry.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
			});

			// Clear any existing reset tokens first
			await Membership.findByIdAndUpdate(member._id, {
				passwordResetToken: undefined,
				passwordResetTokenExpiry: undefined,
			});

			// Save the new token to the membership record
			const updateResult = await Membership.findByIdAndUpdate(member._id, {
				passwordResetToken: resetToken,
				passwordResetTokenExpiry: tokenExpiry,
			}, { new: true }); // Return the updated document

			console.log("Token saved to membership:", updateResult ? "Success" : "Failed");

			// Verify the token was saved correctly
			const verifyMember = await Membership.findById(member._id);
			console.log("Verification - member has reset token:", !!verifyMember?.passwordResetToken);
			console.log("Verification - saved token expiry:", verifyMember?.passwordResetTokenExpiry?.toISOString());
			console.log("Verification - is token valid now?", verifyMember?.passwordResetTokenExpiry && new Date() < verifyMember.passwordResetTokenExpiry);
			console.log("Verification - token matches:", verifyMember?.passwordResetToken === resetToken);

			resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/reset-password?token=${resetToken}`;
			userName = member.fullName;
			userType = "member";

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
		}

		// Handle User model password reset (existing logic)
		const resetToken = crypto.randomBytes(32).toString('hex');
		const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now

		// Save the token to the user record
		await User.findByIdAndUpdate(user._id, {
			passwordResetToken: resetToken,
			passwordResetTokenExpiry: tokenExpiry,
		});

		resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/reset-password?token=${resetToken}`;
		userName = user.fullName || user.username || "User";
		userType = "user";

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
                console.error("Forgot password error:", error);
                return NextResponse.json({ 
                        success: false, 
                        error: error instanceof Error ? error.message : "Failed to send password reset email"
                }, { status: 500 });
        }
}
