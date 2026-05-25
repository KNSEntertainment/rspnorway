import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import { sendWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;

	await connectDB();

	const membership = await Membership.findById(id);

	if (!membership) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	return NextResponse.json(membership);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectDB();
	const data = await req.json();

	// Find the membership before update to check status change
	const existingMembership = await Membership.findById(id);
	if (!existingMembership) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	// Hash password if it's being updated
	if (data.password && data.password !== existingMembership.password) {
		// Only hash if the password is not already hashed (check length)
		// Hashed passwords are typically 60 characters long (bcrypt)
		if (data.password.length < 60) {
			const salt = await bcrypt.genSalt(12);
			data.password = await bcrypt.hash(data.password, salt);
		}
	}

	const membership = await Membership.findByIdAndUpdate(id, data, { new: true });

	// If membership is being approved for the first time
	if (data.membershipStatus === "approved" && existingMembership.membershipStatus !== "approved") {
		try {
			// Send welcome email
			await sendWelcomeEmail({
				name: membership.fullName,
				email: membership.email,
			});

					} catch (error: unknown) {
console.error("Error", error)		}
	}

	return NextResponse.json(membership);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectDB();
	const membership = await Membership.findByIdAndDelete(id);
	if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ message: "Deleted successfully" });
}
