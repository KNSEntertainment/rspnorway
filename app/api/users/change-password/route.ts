import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Membership from '@/models/Membership.Model';
import User from '@/models/User.Model';
import nodemailer from 'nodemailer';
import { logActivity } from '@/lib/activityLogger';

// Create nodemailer transporter using existing configuration
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_APP_PASS,
	},
});

export async function POST(request: NextRequest) {
	try {
		const { email, currentPassword, newPassword } = await request.json();

		if (!email || !currentPassword || !newPassword) {
			return NextResponse.json(
				{ error: 'Email, current password, and new password are required' },
				{ status: 400 }
			);
		}

		// Validate new password length
		if (newPassword.length < 8) {
			return NextResponse.json(
				{ error: 'New password must be at least 8 characters long' },
				{ status: 400 }
			);
		}

		// Connect to database
		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(process.env.MONGODB_URI!);
		}

		const emailRegex = new RegExp(`^${email.trim()}$`, "i");

		// Find the member or admin user by email
		const member = await Membership.findOne({ email: emailRegex });
		const user = !member ? await User.findOne({ email: emailRegex }) : null;

		if (!member && !user) {
			return NextResponse.json(
				{ error: 'Account not found with this email' },
				{ status: 404 }
			);
		}

		// Verify current password
		const storedPassword = member?.password || user?.password || '';
		const isCurrentPasswordValid = await bcrypt.compare(currentPassword, storedPassword);
		if (!isCurrentPasswordValid) {
			await logActivity({
				userId: (member?._id || user?._id || "").toString(),
				userName: member?.fullName || user?.fullName || "User",
				userEmail: email,
				userRole: user ? user.role : "member",
				membershipType: member?.membershipType || (user ? "executive" : "general"),
				action: "PASSWORD_CHANGE",
				category: "auth",
				description: `Failed password change attempt: Incorrect current password`,
				status: "failed",
				req: request,
			});
			return NextResponse.json(
				{ error: 'Current password is incorrect' },
				{ status: 400 }
			);
		}

		// Hash the new password
		const hashedNewPassword = await bcrypt.hash(newPassword, 10);

		// Update the member's or user's password and clear any reset tokens
		if (member) {
			await Membership.findByIdAndUpdate(member._id, { 
				password: hashedNewPassword,
				passwordResetToken: null,
				passwordResetTokenExpiry: null
			});
		}
		if (user) {
			await User.findByIdAndUpdate(user._id, {
				password: hashedNewPassword,
				resetToken: null,
				resetTokenExpiry: null
			});
		}

		const recipientName = member?.fullName || user?.fullName || 'Member';

		// Send password change notification email
		const mailOptions = {
			from: `"PNSB-Norway" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: 'Password Changed - PNSB-Norway Membership',
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9f9; border-radius: 8px;">
					<h2 style="color: #333; margin-bottom: 20px;">Password Changed Successfully</h2>
					<p>Dear ${recipientName},</p>
					<p>Your password for your PNSB-Norway account has been successfully changed.</p>
					
					<div style="background: #d4edda; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #28a745;">
						<h3 style="color: #155724; margin-bottom: 10px;">Security Information:</h3>
						<ul style="color: #155724; font-size: 14px; line-height: 1.6;">
							<li>Password changed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</li>
							<li>If you did not make this change, please contact us immediately</li>
							<li>Ensure your new password is strong and unique</li>
						</ul>
					</div>
					
					<div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
						<h3 style="color: #721c24; margin-bottom: 10px;">Security Tips:</h3>
						<ol style="color: #721c24; font-size: 14px; line-height: 1.6;">
							<li>Never share your password with anyone</li>
							<li>Use different passwords for different accounts</li>
							<li>Change your password regularly</li>
							<li>Enable two-factor authentication if available</li>
						</ol>
					</div>
					
					<div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
						<h3 style="color: #666; margin-bottom: 10px;">Login Information:</h3>
						<p style="color: #666; font-size: 14px;">
							You can login with your email: <strong>${email}</strong> and your new password at:<br>
							<a href="https://www.pnsbnorway.org/en/login" style="color: #2563eb; text-decoration: none;">https://www.pnsbnorway.org/en/login</a>
						</p>
					</div>
					
					<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
					<p style="color: #999; font-size: 12px; text-align: center;">
						This is an automated security notification. If you did not change your password, 
						please contact our support team immediately at support@pnsbnorway.org
					</p>
					
					<p style="color: #999; font-size: 12px; text-align: center;">
						Best regards,<br>The PNSB-Norway Team
					</p>
				</div>
			`,
		};

		try {
			await transporter.sendMail(mailOptions);
		} catch (mailError) {
			console.warn("Could not send email notification:", mailError);
		}

		// Log successful password change (safe, zero credential exposure)
		await logActivity({
			userId: (member?._id || user?._id || "").toString(),
			userName: recipientName,
			userEmail: email,
			userRole: user ? user.role : "member",
			membershipType: member?.membershipType || (user ? "executive" : "general"),
			action: "PASSWORD_CHANGE",
			category: "auth",
			description: `${recipientName} changed account password successfully`,
			status: "success",
			req: request,
		});

		return NextResponse.json(
			{ 
				message: 'Password changed successfully and notification email sent',
				success: true
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error('Password change error:', error);
		return NextResponse.json(
			{ error: 'Failed to change password' },
			{ status: 500 }
		);
	}
}
