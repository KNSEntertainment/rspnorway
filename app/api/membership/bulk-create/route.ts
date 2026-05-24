import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import crypto from "crypto";

interface Member {
  fullname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalcode: string;
  dateofbirth: string;
  gender: string;
}

export async function POST(req: Request) {
	try {
		await connectDB();

		const { members } = await req.json();

		if (!members || !Array.isArray(members) || members.length === 0) {
			return NextResponse.json({ error: "Members array is required." }, { status: 400 });
		}

		const results = {
			success: 0,
			failed: 0,
			errors: [] as string[]
		};

		for (let i = 0; i < members.length; i++) {
			const member = members[i] as Member;
			
			try {
				// Validate required fields
				if (!member.fullname || !member.email || !member.phone || !member.address || 
					!member.city || !member.postalcode || !member.dateofbirth || !member.gender) {
					results.failed++;
					results.errors.push(`Row ${i + 1}: Missing required fields (fullname, email, phone, address, city, postalcode, dateofbirth, gender)`);
					continue;
				}

				// Check if member already exists
				const existingMember = await Membership.findOne({ 
					$or: [
						{ email: member.email.toLowerCase() },
						{ phone: member.phone }
					]
				});

				if (existingMember) {
					results.failed++;
					results.errors.push(`Row ${i + 1}: Member with this email or phone already exists`);
					continue;
				}

				// Create membership record
				const setupToken = crypto.randomBytes(32).toString('hex');
				const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

				const membershipData = {
					fullName: member.fullname.trim(),
					email: member.email.trim().toLowerCase(),
					phone: member.phone.trim(),
					address: member.address.trim(),
					city: member.city.trim(),
					postalCode: member.postalcode.trim(),
					dateOfBirth: member.dateofbirth.trim(),
					gender: member.gender.toLowerCase(),
					province: "",
					district: "",
					profession: "",
					membershipType: "general",
					membershipStatus: "pending",
					skills: "",
					volunteerInterest: [],
					agreeTerms: true,
					permissionPhotos: false,
					permissionPhone: false,
					permissionEmail: false,
					profilePhoto: "",
					passwordSetupToken: setupToken,
					passwordSetupTokenExpiry: tokenExpiry,
				};

				await Membership.create(membershipData);

				
				results.success++;

			} catch (error) {
				console.error(`Error creating member ${member.fullname}:`, error);
				results.failed++;
				results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Failed to create member"}`);
			}
		}

		return NextResponse.json(results, { status: 200 });

	} catch (error) {
		console.error("Error in bulk create memberships:", error);
		return NextResponse.json({ 
			error: "Failed to process bulk upload." 
		}, { status: 500 });
	}
}
