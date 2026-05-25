import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import User from "@/models/User.Model";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
	try {
		await connectDB();
		const { token, password } = await req.json();


		if (!token || !password) {
			return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
		}

		if (password.length < 6) {
			return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
		}

		// First try to find user with reset token
		let user = await User.findOne({
			resetToken: token,
			resetTokenExpiry: { $gt: Date.now() },
		});

		// If not found with reset token, try setup token
		if (!user) {
			user = await User.findOne({
				setupToken: token,
				setupTokenExpiry: { $gt: Date.now() },
			});
		}

		// If not found in User model, try Membership model with setup token
		if (!user) {
			const membership = await Membership.findOne({
				passwordSetupToken: token,
				passwordSetupTokenExpiry: { $gt: Date.now() },
			});

			if (!membership) {
				// Try reset token for membership
				
		
				
				// First, find the token without expiry check
				const membershipWithResetToken = await Membership.findOne({
					passwordResetToken: token
				});


				if (!membershipWithResetToken) {
					return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
				}

				// Now check expiry manually
				const currentTime = new Date();
				const tokenExpiry = membershipWithResetToken.passwordResetTokenExpiry;
				
				
				if (!tokenExpiry || currentTime >= tokenExpiry) {
					// Clear expired token
					await Membership.findByIdAndUpdate(membershipWithResetToken._id, {
						passwordResetToken: undefined,
						passwordResetTokenExpiry: undefined,
					});
					return NextResponse.json({ error: "Token has expired. Please request a new password reset." }, { status: 400 });
				}

				// Hash the password
				const hashedPassword = await bcrypt.hash(password, 10);

				// Update membership with password and clear reset token
				membershipWithResetToken.password = hashedPassword;
				membershipWithResetToken.passwordResetToken = undefined;
				membershipWithResetToken.passwordResetTokenExpiry = undefined;
				await membershipWithResetToken.save();

				return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 });
			}

			// Hash the password
			const hashedPassword = await bcrypt.hash(password, 10);

			// Update membership with password and clear setup token
			membership.password = hashedPassword;
			membership.passwordSetupToken = undefined;
			membership.passwordSetupTokenExpiry = undefined;
			await membership.save();

			console.log("Password set successfully for member:", membership.email);
			return NextResponse.json({ success: true, message: "Password set successfully" }, { status: 200 });
		}

		// Handle User model password reset (existing logic)
		const hashedPassword = await bcrypt.hash(password, 10);

		// Update user with password and clear appropriate token
		user.password = hashedPassword;
		// Clear both reset and setup tokens to be safe
		user.resetToken = undefined;
		user.resetTokenExpiry = undefined;
		user.setupToken = undefined;
		user.setupTokenExpiry = undefined;
		await user.save();

				return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 });
	} catch (error: unknown) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to reset password" }, { status: 500 });
	}
}
