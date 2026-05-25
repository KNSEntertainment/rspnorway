import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";
import bcrypt from "bcryptjs";

export async function PUT(request, { params }) {
	const { id } = await params;
	try {
		await connectDB();
		const body = await request.json();
		
		// Get existing user to check current password
		const existingUser = await User.findById(id);
		if (!existingUser) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}
		
		// Only allow updating certain fields for security
		const allowedFields = ["fullName", "email", "userName", "role", "phone", "password"];
		const updateData = {};
		for (const key of allowedFields) {
			if (body[key] !== undefined) updateData[key] = body[key];
		}
		
		// Hash password if it's being updated
		if (updateData.password) {
			// Only hash if the password is not already hashed (check length)
			// Hashed passwords are typically 60 characters long (bcrypt)
			if (updateData.password.length < 60) {
				const salt = await bcrypt.genSalt(12);
				updateData.password = await bcrypt.hash(updateData.password, salt);
			}
		}
		
		const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
		if (!updatedUser) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const userId = id;

		const deleteduser = await User.findByIdAndDelete(userId);

		if (!deleteduser) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
