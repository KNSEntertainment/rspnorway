import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Circular from "@/models/Circular.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";
import cloudinary from "cloudinary";

export const config = {
	api: {
		bodyParser: false,
	},
};

function extractPublicId(cloudinaryUrl) {
	try {
		const urlParts = cloudinaryUrl.split("/");
		const versionAndId = urlParts.slice(-2).join("/"); // Extract version and ID
		const publicIdWithExtension = versionAndId.split(".")[0]; // Remove file extension
		return publicIdWithExtension;
	} catch (error) {
		console.error("Error extracting public ID:", error);
		return null;
	}
}
export async function GET(req, { params }) {
	const { id } = await params;
	console.log("Received ID:", id);

	await connectDB();

	try {
		const circular = await Circular.findById(id);

		if (!circular) {
			console.error("Circular not found:", id);
			return NextResponse.json({ success: false, error: "Circular not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, circular });
	} catch (error) {
		console.error("Error fetching circular:", error);
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}

export async function PUT(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		// Fetch form data
		const formData = await request.formData();

		// Get existing circular from DB
		const existingCircular = await Circular.findById(id);
		if (!existingCircular) {
			return NextResponse.json({ success: false, error: "Circular not found" }, { status: 404 });
		}

		// Update text fields
		const circularTitle = formData.get("circularTitle") || existingCircular.circularTitle;
		const circularDesc = formData.get("circularDesc") || existingCircular.circularDesc;
		// const circularAuthor = formData.get("circularAuthor") || existingCircular.circularAuthor;
		const circularDate = formData.get("circularDate") || existingCircular.circularDate;

		// Handle images
		let circularMainPictureUrl = existingCircular.circularMainPicture;
		let circularSecondPictureUrl = existingCircular.circularSecondPicture;
		// Update main picture if a new file is provided
		if (formData.get("circularMainPicture")) {
			if (existingCircular.circularMainPicture) {
				const mainPictureId = extractPublicId(existingCircular.circularMainPicture);
				if (mainPictureId) await cloudinary.v2.uploader.destroy(mainPictureId);
			}
			circularMainPictureUrl = await uploadToCloudinary(formData.get("circularMainPicture"), "circulars_images");
		}

		// Update second picture if a new file is provided
		if (formData.get("circularSecondPicture")) {
			if (existingCircular.circularSecondPicture) {
				const secondPictureId = extractPublicId(existingCircular.circularSecondPicture);
				if (secondPictureId) await cloudinary.v2.uploader.destroy(secondPictureId);
			}
			circularSecondPictureUrl = await uploadToCloudinary(formData.get("circularSecondPicture"), "circulars_images");
		}

		// Update the circular in the database
		existingCircular.circularTitle = circularTitle;
		existingCircular.circularDesc = circularDesc;
		// existingCircular.circularAuthor = circularAuthor;
		existingCircular.circularDate = circularDate;
		existingCircular.circularMainPicture = circularMainPictureUrl;
		existingCircular.circularSecondPicture = circularSecondPictureUrl;
		await existingCircular.save();

		return NextResponse.json({ success: true, circular: existingCircular }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		console.log("Deleting circular with ID:", id);

		const deletedblog = await Circular.findByIdAndDelete(id);

		if (!deletedblog) {
			return NextResponse.json({ success: false, error: "Circular not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "Circular deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
