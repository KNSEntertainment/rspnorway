import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Download from "@/models/Download.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export async function PUT(request, context) {
	try {
		await connectDB();
		const { id } = await context.params;
		const formData = await request.formData();
		const title_en = formData.get("title_en");
		const title_ne = formData.get("title_ne");
		const title_no = formData.get("title_no");
		const date = formData.get("date");
		const category = formData.get("category");
		let fileUrl = formData.get("fileUrl");
		let imageUrl = formData.get("imageUrl");
		let fileSize = formData.get("fileSize");
		let imageSize = formData.get("imageSize");
		const file = formData.get("file");
		const image = formData.get("image");

		// Fetch current document to get old URLs
		const current = await Download.findById(id);
		// If new file uploaded, upload to Cloudinary and delete old file
		if (file) {
			if (current && current.fileUrl) {
				await deleteFromCloudinary(current.fileUrl, "raw");
			}
			fileUrl = await uploadToCloudinary(file, "Downloads");
			fileSize = file.size;
		}
		// If new image uploaded, upload to Cloudinary and delete old image
		if (image) {
			if (current && current.imageUrl) {
				console.log("Attempting to delete old image from Cloudinary:", current.imageUrl);
				await deleteFromCloudinary(current.imageUrl, "image");
			}
			imageUrl = await uploadToCloudinary(image, "Downloads");
			imageSize = image.size;
		}

		const update = {
			...(title_en && { title_en, title: title_en }), // Also update legacy title field
			...(title_ne && { title_ne }),
			...(title_no && { title_no }),
			...(date && { date }),
			...(category && { category }),
			...(fileUrl && { fileUrl }),
			...(imageUrl && { imageUrl }),
			...(fileSize && { fileSize }),
			...(imageSize && { imageSize }),
		};

		const updated = await Download.findByIdAndUpdate(id, update, { new: true });
		if (!updated) {
			return NextResponse.json({ success: false, error: "Download not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true, download: updated }, { status: 200 });
	} catch (error) {
		console.error("Error updating download:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
export async function DELETE(request, context) {
	try {
		await connectDB();
		const { id } = await context.params;
		const deleted = await Download.findByIdAndDelete(id);
		if (!deleted) {
			return NextResponse.json({ success: false, error: "Download not found" }, { status: 404 });
		}
		// Delete file and image from Cloudinary when document is deleted
		if (deleted && deleted.fileUrl) {
			await deleteFromCloudinary(deleted.fileUrl, "raw");
		}
		if (deleted && deleted.imageUrl) {
			await deleteFromCloudinary(deleted.imageUrl, "image");
		}
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error("Error deleting download:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
