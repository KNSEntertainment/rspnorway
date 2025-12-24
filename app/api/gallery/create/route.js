import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery.Model";
import ClassModel from "@/models/Class.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

// export async function POST(request) {
// 	try {
// 		await connectDB();

// 		const formData = await request.formData();
// 		console.log("Received form data:", Object.fromEntries(formData));

// 		const category = formData.get("category");
// 		const alt = formData.get("alt");
// 		const media = formData.get("media");

// 		// Validate input
// 		if (!category || !media || !(media instanceof Blob)) {
// 			return NextResponse.json({ success: false, error: "Required fields are missing or invalid" }, { status: 400 });
// 		}

// 		// Save file to the uploads directory
// 		const mediaUrl = await uploadToCloudinary(media, "gallery_images");

// 		// Create DB entry
// 		const galleryItem = await Gallery.create({
// 			media: mediaUrl,
// 			category,
// 			alt: alt || "",
// 		});

// 		console.log("Gallery item created successfully:", galleryItem);

// 		return NextResponse.json({ success: true, galleryItem }, { status: 201 });
// 	} catch (error) {
// 		console.error("Error in API route:", error);
// 		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
// 	}
// }

export async function POST(request) {
	try {
		await connectDB();
		const formData = await request.formData();

		const category = formData.get("category");
		const alt = formData.get("alt");
		const classId = formData.get("classId");
		const mediaFiles = formData.getAll("media"); // Get multiple files

		if (!mediaFiles.length) {
			return NextResponse.json({ success: false, error: "Required fields are missing or invalid" }, { status: 400 });
		}

		let classDoc = null;
		if (classId) {
			classDoc = await ClassModel.findById(classId);
			if (!classDoc) {
				return NextResponse.json({ success: false, error: "Class not found" }, { status: 400 });
			}
		}

		// Upload all files
		const mediaUrls = await Promise.all(mediaFiles.map(async (file) => await uploadToCloudinary(file, "gallery_images")));

		const resolvedCategory = category || classDoc?.name;
		if (!resolvedCategory) {
			return NextResponse.json({ success: false, error: "Category or class is required" }, { status: 400 });
		}

		// Create DB entry
		const galleryItem = await Gallery.create({
			media: mediaUrls,
			category: resolvedCategory,
			classId: classDoc?._id,
			classLabel: classDoc?.name,
			alt: alt || classDoc?.name || resolvedCategory,
		});

		return NextResponse.json({ success: true, galleryItem }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
