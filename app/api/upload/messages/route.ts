import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;
		
		if (!file) {
			return NextResponse.json(
				{ error: "No file provided" },
				{ status: 400 }
			);
		}

		// Check file size (5MB limit)
		const maxSize = 5 * 1024 * 1024; // 5MB in bytes
		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: "File size exceeds 5MB limit" },
				{ status: 400 }
			);
		}

		// Upload file to Cloudinary
		const cloudinaryUrl = await uploadToCloudinary(file, "message-attachments");

		// Return file information
		return NextResponse.json({
			filename: file.name,
			fileType: file.type,
			size: file.size,
			url: cloudinaryUrl,
		});

	} catch (error) {
		console.error("Error uploading file to Cloudinary:", error);
		return NextResponse.json(
			{ error: "Failed to upload file to Cloudinary" },
			{ status: 500 }
		);
	}
}
