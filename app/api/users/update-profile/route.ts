import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Membership from '@/models/Membership.Model';
import User from '@/models/User.Model';
import ExecutiveMember from '@/models/ExecutiveMember.Model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { logActivity } from '@/lib/activityLogger';

export async function PATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const updateData = await request.json();
		
		// Define which fields are allowed to be updated
		const allowedFields = [
			'phone',
			'address', 
			'city',
			'postalCode',
			'province',
			'district',
			'profession',
			'skills',
			'volunteerInterest'
		];

		// Filter the update data to only include allowed fields
		const filteredData: Record<string, unknown> = {};
		for (const field of allowedFields) {
			if (updateData[field] !== undefined) {
				filteredData[field] = updateData[field];
			}
		}

		if (Object.keys(filteredData).length === 0) {
			return NextResponse.json(
				{ error: 'No valid fields to update' },
				{ status: 400 }
			);
		}

		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(process.env.MONGODB_URI!);
		}

		const emailRegex = new RegExp(`^${session.user.email.trim()}$`, "i");
		let member = await Membership.findOneAndUpdate(
			{ email: emailRegex },
			filteredData,
			{ new: true }
		);

		if (!member) {
			const isAdminOrExec = session.user.role === "admin" || session.user.role === "treasurer";
			const user = await User.findOne({ email: emailRegex });
			const exec = await ExecutiveMember.findOne({ email: emailRegex });

			if (isAdminOrExec || user || exec) {
				if (filteredData.phone && user) {
					await User.findOneAndUpdate({ email: emailRegex }, { phone: filteredData.phone });
				}
				if (filteredData.phone && exec) {
					await ExecutiveMember.findOneAndUpdate({ email: emailRegex }, { phone: filteredData.phone });
				}

				member = await Membership.create({
					fullName: user?.fullName || exec?.name || session.user.fullName || "Executive Member",
					email: session.user.email,
					phone: (filteredData.phone as string) || user?.phone || exec?.phone || session.user.phone || "",
					address: (filteredData.address as string) || "Oslo, Norway",
					city: (filteredData.city as string) || "Oslo",
					postalCode: (filteredData.postalCode as string) || "0150",
					province: (filteredData.province as string) || "",
					district: (filteredData.district as string) || "",
					profession: (filteredData.profession as string) || "",
					skills: (filteredData.skills as string) || "",
					volunteerInterest: (filteredData.volunteerInterest as string[]) || [],
					dateOfBirth: "1990-01-01",
					gender: "prefer-not-to-say",
					membershipType: "executive",
					membershipStatus: "approved",
					position: exec?.position || (session.user.role === "treasurer" ? "Treasurer" : "Executive Member"),
					agreeTerms: true,
				});
			}
		}

		if (!member) {
			return NextResponse.json(
				{ error: 'Member not found' },
				{ status: 404 }
			);
		}

		// Return the updated member data (excluding sensitive fields)
		const updatedMember = {
			fullName: member.fullName,
			email: member.email,
			phone: member.phone,
			address: member.address,
			city: member.city,
			postalCode: member.postalCode,
			province: member.province,
			district: member.district,
			profession: member.profession,
			skills: member.skills,
			volunteerInterest: member.volunteerInterest,
			membershipType: member.membershipType,
			membershipStatus: member.membershipStatus,
		};

		// Log profile update safely (only which fields changed, never sensitive values)
		await logActivity({
			userId: session.user._id?.toString() || member._id?.toString() || "",
			userName: member.fullName || session.user.fullName || "User",
			userEmail: session.user.email,
			userRole: session.user.role || "member",
			membershipType: member.membershipType || session.user.membershipType || "general",
			action: "PROFILE_UPDATE",
			category: "profile",
			description: `${member.fullName || session.user.email} updated profile (${Object.keys(filteredData).join(", ")})`,
			status: "success",
			metadata: {
				updatedFields: Object.keys(filteredData),
			},
			req: request,
		});

		return NextResponse.json({
			message: 'Profile updated successfully',
			member: updatedMember
		});
	} catch (error) {
		console.error('Error updating profile:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
