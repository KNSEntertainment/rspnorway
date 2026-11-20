import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Membership from '@/models/Membership.Model';
import User from '@/models/User.Model';
import ExecutiveMember from '@/models/ExecutiveMember.Model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(process.env.MONGODB_URI!);
		}

		const emailRegex = new RegExp(`^${session.user.email.trim()}$`, "i");
		const member = await Membership.findOne({ email: emailRegex });
		if (!member) {
			const isAdminOrExec = session.user.role === "admin" || session.user.role === "treasurer";
			const user = await User.findOne({ email: emailRegex });
			const exec = await ExecutiveMember.findOne({ email: emailRegex });

			if (isAdminOrExec || user || exec) {
				return NextResponse.json({
					permissionPhotos: false,
					permissionPhone: false,
					permissionEmail: false,
				});
			}

			return NextResponse.json(
				{ error: 'Member not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			permissionPhotos: member.permissionPhotos || false,
			permissionPhone: member.permissionPhone || false,
			permissionEmail: member.permissionEmail || false,
		});
	} catch (error) {
		console.error('Error fetching privacy settings:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const { permissionPhotos, permissionPhone, permissionEmail } = await request.json();

		if (typeof permissionPhotos !== 'boolean' || 
			typeof permissionPhone !== 'boolean' || 
			typeof permissionEmail !== 'boolean') {
			return NextResponse.json(
				{ error: 'Invalid input. All fields must be boolean values.' },
				{ status: 400 }
			);
		}

		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(process.env.MONGODB_URI!);
		}

		const emailRegex = new RegExp(`^${session.user.email.trim()}$`, "i");
		let member = await Membership.findOneAndUpdate(
			{ email: emailRegex },
			{
				permissionPhotos,
				permissionPhone,
				permissionEmail,
			},
			{ new: true }
		);

		if (!member) {
			const isAdminOrExec = session.user.role === "admin" || session.user.role === "treasurer";
			const user = await User.findOne({ email: emailRegex });
			const exec = await ExecutiveMember.findOne({ email: emailRegex });

			if (isAdminOrExec || user || exec) {
				member = await Membership.create({
					fullName: user?.fullName || exec?.name || session.user.fullName || "Executive Member",
					email: session.user.email,
					phone: user?.phone || exec?.phone || session.user.phone || "",
					address: "Oslo, Norway",
					city: "Oslo",
					postalCode: "0150",
					dateOfBirth: "1990-01-01",
					gender: "prefer-not-to-say",
					membershipType: "executive",
					membershipStatus: "approved",
					position: exec?.position || (session.user.role === "treasurer" ? "Treasurer" : "Executive Member"),
					agreeTerms: true,
					permissionPhotos,
					permissionPhone,
					permissionEmail,
				});
			}
		}

		if (!member) {
			return NextResponse.json(
				{ error: 'Member not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: 'Privacy settings updated successfully',
			permissionPhotos: member.permissionPhotos,
			permissionPhone: member.permissionPhone,
			permissionEmail: member.permissionEmail,
		});
	} catch (error) {
		console.error('Error updating privacy settings:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
