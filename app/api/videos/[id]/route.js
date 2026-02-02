import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

// GET single video by ID
export async function GET(req, { params }) {
	try {
		await connectDB();
		const { id } = params;
		const video = await Video.findById(id);

		if (!video) {
			return NextResponse.json({ success: false, error: "Video not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, video }, { status: 200 });
	} catch (error) {
		console.error("Error fetching video:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// PUT - Update video
export async function PUT(req, { params }) {
	try {
		await connectDB();
		const { id } = params;

		const formData = await req.formData();
		const videoFile = formData.get("video");
		const thumbnailFile = formData.get("thumbnail");
		const title = formData.get("title");
		const category = formData.get("category");
		const duration = formData.get("duration");
		const description = formData.get("description");
		const creator = formData.get("creator");

		const existingVideo = await Video.findById(id);
		if (!existingVideo) {
			return NextResponse.json({ success: false, error: "Video not found" }, { status: 404 });
		}

		const updateData = {
			title: title || existingVideo.title,
			category: category || existingVideo.category,
			duration: duration || existingVideo.duration,
			description: description || existingVideo.description,
			creator: creator || existingVideo.creator,
		};

		// If new video file is uploaded, delete old and upload new
		if (videoFile) {
			// Delete old video from Cloudinary
			if (existingVideo.url) {
				await deleteFromCloudinary(existingVideo.url, "video");
			}
			// Upload new video
			updateData.url = await uploadToCloudinary(videoFile, "rsp-videos");
		}

		// If new thumbnail is uploaded, delete old and upload new
		if (thumbnailFile) {
			// Delete old thumbnail from Cloudinary
			if (existingVideo.thumbnail) {
				await deleteFromCloudinary(existingVideo.thumbnail, "image");
			}
			// Upload new thumbnail
			updateData.thumbnail = await uploadToCloudinary(thumbnailFile, "rsp-video-thumbnails");
		}

		const updatedVideo = await Video.findByIdAndUpdate(id, updateData, { new: true });

		return NextResponse.json({ success: true, video: updatedVideo }, { status: 200 });
	} catch (error) {
		console.error("Error updating video:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// DELETE video
export async function DELETE(req, { params }) {
	try {
		await connectDB();
		const { id } = params;

		const video = await Video.findById(id);
		if (!video) {
			return NextResponse.json({ success: false, error: "Video not found" }, { status: 404 });
		}

		// Delete video from Cloudinary
		if (video.url) {
			await deleteFromCloudinary(video.url, "video");
		}

		// Delete thumbnail from Cloudinary
		if (video.thumbnail) {
			await deleteFromCloudinary(video.thumbnail, "image");
		}

		// Delete from database
		await Video.findByIdAndDelete(id);

		return NextResponse.json({ success: true, message: "Video deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting video:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
