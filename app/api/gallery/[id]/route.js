import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery.Model";
import ClassModel from "@/models/Class.Model";
import { v2 as cloudinary } from "cloudinary";

import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

async function deleteFromCloudinary(url) {
	const publicId = url.split("/").pop().split(".")[0];
	await cloudinary.uploader.destroy(`gallery_images/${publicId}`);
}

export async function PUT(request, { params }) {
	const { id } = params;

	try {
		await connectDB();
		const formData = await request.formData();
		const galleryData = {};
		const mediaFiles = formData.getAll("media");
		const classId = formData.get("classId");

		for (const [key, value] of formData.entries()) {
			if (key !== "media") {
				galleryData[key] = value;
			}
		}

		let classDoc = null;
		if (classId) {
			classDoc = await ClassModel.findById(classId);
			if (!classDoc) {
				return NextResponse.json({ success: false, error: "Class not found" }, { status: 400 });
			}
			galleryData.classId = classDoc._id;
			galleryData.classLabel = classDoc.name;
		}

		const existingGallery = await Gallery.findById(id);
		if (!existingGallery) {
			return NextResponse.json({ success: false, error: "Gallery not found" }, { status: 404 });
		}

		if (mediaFiles.length > 0) {
			// Delete old images
			for (const url of existingGallery.media) {
				await deleteFromCloudinary(url);
			}

			// Upload new images
			galleryData.media = await Promise.all(mediaFiles.map(async (file) => await uploadToCloudinary(file, "gallery_images")));
		}

		if (!galleryData.category && (classDoc || existingGallery.classLabel)) {
			galleryData.category = classDoc?.name || existingGallery.classLabel;
		}
		if (!galleryData.alt) {
			galleryData.alt = classDoc?.name || galleryData.category || existingGallery.alt;
		}

		const updatedGallery = await Gallery.findByIdAndUpdate(id, galleryData, { new: true });

		return NextResponse.json({ success: true, gallery: updatedGallery }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// export async function PUT(request, { params }) {
// 	const { id } = await params;

// 	try {
// 		await connectDB();

// 		const formData = await request.formData();
// 		const galleryId = id;

// 		const galleryData = {};
// 		for (const [key, value] of formData.entries()) {
// 			if (key !== "media") {
// 				galleryData[key] = value;
// 			}
// 		}

// 		const media = formData.get("media");
// 		if (media) {
// 			galleryData.media = await uploadToCloudinary(media, "gallery_images");
// 		}

// 		const updatedgallery = await Gallery.findByIdAndUpdate(galleryId, galleryData, { new: true });

// 		if (!updatedgallery) {
// 			return NextResponse.json({ success: false, error: "gallery not found" }, { status: 404 });
// 		}

// 		return NextResponse.json({ success: true, gallery: updatedgallery }, { status: 200 });
// 	} catch (error) {
// 		console.error("Error in API route:", error);
// 		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
// 	}
// }

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const galleryId = id;

		const deletedpartner = await Gallery.findByIdAndDelete(galleryId);

		if (!deletedpartner) {
			return NextResponse.json({ success: false, error: "gallery not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "gallery deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const galleryId = id;
		const gallery = await Gallery.findById(galleryId);

		if (!gallery) {
			return NextResponse.json({ success: false, error: "gallery not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, gallery }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
