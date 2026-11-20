import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Membership from '@/models/Membership.Model';
import User from '@/models/User.Model';

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: 'Email and password are required' },
				{ status: 400 }
			);
		}

		// Connect to database
		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(process.env.MONGODB_URI!);
		}

		const emailRegex = new RegExp(`^${email.trim()}$`, "i");

		// Find the member or user by email
		const member = await Membership.findOne({ email: emailRegex });
		const user = !member ? await User.findOne({ email: emailRegex }) : null;

		if (!member && !user) {
			return NextResponse.json(
				{ error: 'User or member not found', isValid: false },
				{ status: 404 }
			);
		}

		// Verify the password
		const storedPassword = member?.password || user?.password || '';
		const isPasswordValid = await bcrypt.compare(password, storedPassword);

		return NextResponse.json({
			isValid: isPasswordValid,
			message: isPasswordValid ? 'Password verified' : 'Password is incorrect'
		});

	} catch (error) {
		console.error('Password verification error:', error);
		return NextResponse.json(
			{ error: 'Failed to verify password', isValid: false },
			{ status: 500 }
		);
	}
}
