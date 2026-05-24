import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import Membership from "@/models/Membership.Model";
import { sendWelcomeEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req) {
	try {
		await connectDB();

		const { members } = await req.json();

		if (!members || !Array.isArray(members) || members.length === 0) {
			return NextResponse.json({ error: "Members array is required." }, { status: 400 });
		}

		const results = {
			success: 0,
			failed: 0,
			errors: []
		};

		for (let i = 0; i < members.length; i++) {
			const member = members[i];
			
			try {
				// Validate required fields
				if (!member.name || !member.email || !member.phone || !member.address || 
					!member.city || !member.postalcode || !member.dateofbirth || !member.gender) {
					results.failed++;
					results.errors.push(`Row ${i + 1}: Missing required fields (name, email, phone, address, city, postalcode, dateofbirth, gender)`);
					continue;
				}

				// Check if member already exists
				const existingMember = await ExecutiveMember.findOne({ 
					$or: [
						{ email: member.email },
						{ phone: member.phone }
					]
				});

				if (existingMember) {
					results.failed++;
					results.errors.push(`Row ${i + 1}: Member with this email or phone already exists`);
					continue;
				}

				// Create executive member
				await ExecutiveMember.create({
					name: member.name.trim(),
					position: member.position?.trim() || "",
					department: member.department?.trim() || "",
					subdepartment: member.subdepartment?.trim() || "",
					phone: member.phone.trim(),
					email: member.email.trim().toLowerCase(),
					order: parseInt(member.order) || 0,
					isActive: true,
					imageUrl: "",
				});

				// Create corresponding membership record
				const setupToken = crypto.randomBytes(32).toString('hex');
				const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

				const membershipData = {
					fullName: member.name.trim(),
					email: member.email.trim().toLowerCase(),
					phone: member.phone.trim(),
					address: member.address.trim(),
					city: member.city.trim(),
					postalCode: member.postalcode.trim(),
					dateOfBirth: member.dateofbirth.trim(),
					gender: member.gender.toLowerCase(),
					province: member.province?.trim() || "",
					district: member.district?.trim() || "",
					profession: member.profession?.trim() || "Executive Member",
					membershipType: "executive",
					membershipStatus: "approved",
					skills: "",
					volunteerInterest: [],
					agreeTerms: true,
					permissionPhotos: true,
					permissionPhone: true,
					permissionEmail: true,
					profilePhoto: "",
					passwordSetupToken: setupToken,
					passwordSetupTokenExpiry: tokenExpiry,
				};

				await Membership.create(membershipData);

				// Send welcome email (async, don't wait for it)
				sendWelcomeEmail({ 
					name: member.name.trim(), 
					email: member.email.trim().toLowerCase(), 
					setupToken 
				}).catch(emailError => {
					console.error(`Failed to send welcome email to ${member.email}:`, emailError);
				});

				results.success++;

			} catch (error) {
				console.error(`Error creating member ${member.name}:`, error);
				results.failed++;
				results.errors.push(`Row ${i + 1}: ${error.message || "Failed to create member"}`);
			}
		}

		return NextResponse.json(results, { status: 200 });

	} catch (error) {
		console.error("Error in bulk create executive members:", error);
		return NextResponse.json({ 
			error: "Failed to process bulk upload." 
		}, { status: 500 });
	}
}
