import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import { saveUploadedFile } from "@/lib/saveUploadedFile";

export async function POST(req) {
	try {
		await connectDB();

		const formData = await req.formData();
		const name = formData.get("name");
		const position = formData.get("position");
		const department = formData.get("department");
		const subdepartment = formData.get("subdepartment");
		const phone = formData.get("phone");
		const email = formData.get("email");
		const order = formData.get("order") || 0;
		const isActive = formData.get("isActive") === "true";
		const imageFile = formData.get("image");

		if (!name || !phone || !email) {
			return NextResponse.json({ error: "Name, phone, and email are required." }, { status: 400 });
		}

		let imageUrl = "";
		if (imageFile && imageFile.size > 0) {
			const fileResult = await saveUploadedFile(imageFile, "executive-members");
			imageUrl = fileResult.url;
		}

		const newMember = await ExecutiveMember.create({
			name,
			position,
			department,
			subdepartment,
			phone,
			email,
			order: parseInt(order),
			isActive,
			imageUrl,
		});

		return NextResponse.json({ success: true, member: newMember }, { status: 201 });
	} catch (error) {
		console.error("Error creating executive member:", error);
		return NextResponse.json({ error: "Failed to create executive member." }, { status: 500 });
	}
}
