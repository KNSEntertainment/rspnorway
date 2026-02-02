import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

// POST - Create new video
export async function POST(req) {
	try {
		await connectDB();

		const formData = await req.formData();
		const videoFile = formData.get("video");
		const thumbnailFile = formData.get("thumbnail");
		const title = formData.get("title");
		const category = formData.get("category");
		const duration = formData.get("duration");
		const description = formData.get("description");
		const creator = formData.get("creator") || "RSP Norway";

		if (!videoFile || !title || !category) {
			return NextResponse.json({ success: false, error: "Video file, title, and category are required" }, { status: 400 });
		}

		// Upload video to Cloudinary
		const videoUrl = await uploadToCloudinary(videoFile, "rsp-videos");

		// Upload thumbnail if provided
		let thumbnailUrl = null;
		if (thumbnailFile) {
			thumbnailUrl = await uploadToCloudinary(thumbnailFile, "rsp-video-thumbnails");
		}

		// Create video record in database
		const video = await Video.create({
			url: videoUrl,
			thumbnail: thumbnailUrl,
			title,
			category,
			duration,
			description,
			creator,
		});

		return NextResponse.json({ success: true, video }, { status: 201 });
	} catch (error) {
		console.error("Error creating video:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
