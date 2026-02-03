import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import { saveUploadedFile } from "@/lib/saveUploadedFile";

export async function PUT(req, { params }) {
	try {
		await connectDB();
		const { id } = await params;

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

		console.log("Updating member with data:", { name, department, subdepartment, position });

		const updateData = {
			name,
			position,
			department,
			subdepartment,
			phone,
			email,
			order: parseInt(order),
			isActive,
			updatedAt: Date.now(),
		};

		if (imageFile && imageFile.size > 0) {
			const fileResult = await saveUploadedFile(imageFile, "executive-members");
			updateData.imageUrl = fileResult.url;
		}

		const updatedMember = await ExecutiveMember.findByIdAndUpdate(id, updateData, { new: true });

		if (!updatedMember) {
			return NextResponse.json({ error: "Member not found." }, { status: 404 });
			console.log("Updated member in DB:", {
				id: updatedMember._id,
				name: updatedMember.name,
				department: updatedMember.department,
				subdepartment: updatedMember.subdepartment,
			});
		}

		return NextResponse.json({ success: true, member: updatedMember });
	} catch (error) {
		console.error("Error updating executive member:", error);
		return NextResponse.json({ error: "Failed to update executive member." }, { status: 500 });
	}
}

export async function DELETE(req, { params }) {
	try {
		await connectDB();
		const { id } = await params;

		const deletedMember = await ExecutiveMember.findByIdAndDelete(id);

		if (!deletedMember) {
			return NextResponse.json({ error: "Member not found." }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "Member deleted successfully." });
	} catch (error) {
		console.error("Error deleting executive member:", error);
		return NextResponse.json({ error: "Failed to delete executive member." }, { status: 500 });
	}
}
