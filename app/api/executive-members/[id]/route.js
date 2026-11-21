import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import Membership from "@/models/Membership.Model";
import { saveUploadedFile } from "@/lib/saveUploadedFile";
import { promises as fs } from "fs";
import path from "path";

async function deleteLocalUpload(urlPath) {
	if (!urlPath || typeof urlPath !== "string" || !urlPath.startsWith("/uploads/")) {
		return;
	}

	const relativePath = urlPath.replace(/^\/+/, "");
	const fullPath = path.join(process.cwd(), "public", relativePath.replace(/^uploads\//, "uploads/"));

	try {
		await fs.unlink(fullPath);
	} catch (error) {
		if (error && error.code !== "ENOENT") {
			throw error;
		}
	}
}

export async function PUT(req, { params }) {
	try {
		await connectDB();
		const { id } = await params;

		const formData = await req.formData();
		const name = formData.get("name");
		const position = formData.get("position");
		const department = formData.get("department") || "";
		const subdepartment = formData.get("subdepartment") || "";
		const phone = formData.get("phone");
		const email = formData.get("email");
		const rawOrder = formData.get("order");
		const order = Number.isFinite(parseInt(rawOrder, 10)) ? parseInt(rawOrder, 10) : 0;
		const isActive = formData.get("isActive") === "true";
		const imageFile = formData.get("image");

		// 1. Try finding in ExecutiveMember collection
		let existingMember = await ExecutiveMember.findById(id);
		let isMembership = false;

		if (!existingMember) {
			// 2. Try finding in Membership collection
			existingMember = await Membership.findById(id);
			if (existingMember) {
				isMembership = true;
			}
		}

		if (!existingMember) {
			return NextResponse.json({ error: "Member not found." }, { status: 404 });
		}

		let newImageUrl = null;
		const oldImageUrl = existingMember.imageUrl || existingMember.profilePhoto || null;

		if (imageFile && imageFile.size > 0) {
			const fileResult = await saveUploadedFile(imageFile, "executive-members");
			newImageUrl = fileResult.url;
		}

		let updatedMember;

		if (isMembership) {
			const updateData = {
				fullName: name,
				position,
				department,
				subdepartment,
				phone,
				email,
				order,
				membershipType: "executive",
				membershipStatus: isActive ? "approved" : "pending",
				updatedAt: Date.now(),
			};
			if (newImageUrl) {
				updateData.profilePhoto = newImageUrl;
			}
			updatedMember = await Membership.findByIdAndUpdate(id, updateData, { new: true });
		} else {
			const updateData = {
				name,
				position,
				department,
				subdepartment,
				phone,
				email,
				order,
				isActive,
				updatedAt: Date.now(),
			};
			if (newImageUrl) {
				updateData.imageUrl = newImageUrl;
			}
			updatedMember = await ExecutiveMember.findByIdAndUpdate(id, updateData, { new: true });
		}

		if (oldImageUrl && newImageUrl && oldImageUrl !== newImageUrl) {
			try {
				await deleteLocalUpload(oldImageUrl);
			} catch (deleteError) {
				console.error("Failed to delete old image:", deleteError);
			}
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

		// 1. Try ExecutiveMember collection
		const deletedExec = await ExecutiveMember.findByIdAndDelete(id);
		if (deletedExec) {
			return NextResponse.json({ success: true, message: "Executive member deleted successfully." });
		}

		// 2. Try Membership collection: demote from executive to general member so their account isn't lost
		const membership = await Membership.findById(id);
		if (membership) {
			await Membership.findByIdAndUpdate(id, {
				membershipType: "general",
				order: 0,
			});
			return NextResponse.json({
				success: true,
				message: "Member removed from executive leadership and demoted to general member.",
			});
		}

		return NextResponse.json({ error: "Member not found." }, { status: 404 });
	} catch (error) {
		console.error("Error deleting executive member:", error);
		return NextResponse.json({ error: "Failed to delete executive member." }, { status: 500 });
	}
}
