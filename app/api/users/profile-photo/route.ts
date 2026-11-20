import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import User from "@/models/User.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export async function GET(req: NextRequest) {
	try {
		await connectDB();

		const email = req.nextUrl.searchParams.get("email");
		if (!email) {
			return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
		}

		const emailRegex = new RegExp(`^${email.trim()}$`, "i");

		// 1. Fetch membership with the given email
		const membership = await Membership.findOne({ email: emailRegex });
		if (membership?.profilePhoto) {
			return NextResponse.json({
				success: true,
				profilePhoto: membership.profilePhoto,
			});
		}

		// 2. Check if email belongs to ExecutiveMember
		const exec = await ExecutiveMember.findOne({ email: emailRegex });
		if (exec?.imageUrl) {
			return NextResponse.json({
				success: true,
				profilePhoto: exec.imageUrl,
			});
		}

		// 3. Check if email belongs to Admin User
		const user = await User.findOne({ email: emailRegex });
		if (user?.profilePhoto) {
			return NextResponse.json({
				success: true,
				profilePhoto: user.profilePhoto,
			});
		}

		// Return 200 with null photo instead of 404 so clients don't log errors
		return NextResponse.json({
			success: true,
			profilePhoto: null,
		});
	} catch (error: unknown) {
		console.error("Error fetching profile photo:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch profile photo" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user || !session.user.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const formData = await req.formData();
		const file = formData.get("photo") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Validate file type
		if (!file.type.startsWith("image/")) {
			return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
		}

		// Validate file size (max 300KB)
		if (file.size > 300 * 1024) {
			return NextResponse.json({ error: "File size must be less than 300KB" }, { status: 400 });
		}

		const email = session.user.email;
		const emailRegex = new RegExp(`^${email.trim()}$`, "i");

		// Get existing records
		const existingMembership = await Membership.findOne({ email: emailRegex });
		const exec = await ExecutiveMember.findOne({ email: emailRegex });
		const user = await User.findOne({ email: emailRegex });
		const isExecutiveOrAdmin = session.user.role === "admin" || session.user.role === "treasurer" || Boolean(exec) || Boolean(user);

		const oldPhotoUrl = existingMembership?.profilePhoto || exec?.imageUrl || user?.profilePhoto;

		// Upload new photo to Cloudinary
		const photoUrl = await uploadToCloudinary(file, "profile-photos");

		// 1. If membership exists, update it; otherwise if executive/admin, create one
		if (existingMembership) {
			existingMembership.profilePhoto = photoUrl;
			await existingMembership.save();
		} else if (isExecutiveOrAdmin) {
			await Membership.create({
				fullName: exec?.name || user?.fullName || session.user.fullName || "Executive Member",
				email: email,
				phone: exec?.phone || user?.phone || session.user.phone || "",
				address: "Oslo, Norway",
				city: "Oslo",
				postalCode: "0150",
				dateOfBirth: "1990-01-01",
				gender: "prefer-not-to-say",
				membershipType: "executive",
				membershipStatus: "approved",
				position: exec?.position || (session.user.role === "treasurer" ? "Treasurer" : "Executive Member"),
				profilePhoto: photoUrl,
				agreeTerms: true,
			});
		}

		// 2. Sync to ExecutiveMember if it exists
		if (exec) {
			await ExecutiveMember.findOneAndUpdate({ email: emailRegex }, { imageUrl: photoUrl });
		}

		// 3. Sync to User if it exists
		if (user) {
			await User.findOneAndUpdate({ email: emailRegex }, { profilePhoto: photoUrl });
		}

		// Delete old photo from Cloudinary if it exists
		if (oldPhotoUrl) {
			try {
				await deleteFromCloudinary(oldPhotoUrl, "image");
			} catch (deleteError) {
				console.error("Error deleting old photo from Cloudinary:", deleteError);
			}
		}

		return NextResponse.json({
			success: true,
			profilePhoto: photoUrl,
		});
	} catch (error: unknown) {
		console.error("Error uploading profile photo:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to upload photo" }, { status: 500 });
	}
}
