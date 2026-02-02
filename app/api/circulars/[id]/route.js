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

		const formData = await request.formData();

		const existingCircular = await Circular.findById(id);
		if (!existingCircular) {
			return NextResponse.json({ success: false, error: "Circular not found" }, { status: 404 });
		}

		// Update multi-language fields
		const circularTitle = {
			en: formData.get("circularTitle_en")?.toString() || existingCircular.circularTitle?.en || "",
			no: formData.get("circularTitle_no")?.toString() || existingCircular.circularTitle?.no || "",
			ne: formData.get("circularTitle_ne")?.toString() || existingCircular.circularTitle?.ne || "",
		};

		const circularDesc = {
			en: formData.get("circularDesc_en")?.toString() || existingCircular.circularDesc?.en || "",
			no: formData.get("circularDesc_no")?.toString() || existingCircular.circularDesc?.no || "",
			ne: formData.get("circularDesc_ne")?.toString() || existingCircular.circularDesc?.ne || "",
		};

		const circularAuthor = {
			en: formData.get("circularAuthor_en")?.toString() || existingCircular.circularAuthor?.en || "",
			no: formData.get("circularAuthor_no")?.toString() || existingCircular.circularAuthor?.no || "",
			ne: formData.get("circularAuthor_ne")?.toString() || existingCircular.circularAuthor?.ne || "",
		};

		const publicationStatus = formData.get("publicationStatus")?.toString() || existingCircular.publicationStatus;
		const circularPublishedAt = formData.get("circularPublishedAt")?.toString() || existingCircular.circularPublishedAt;

		// Handle images
		let circularMainPictureUrl = existingCircular.circularMainPicture;
		let circularSecondPictureUrl = existingCircular.circularSecondPicture;

		if (formData.get("circularMainPicture")) {
			if (existingCircular.circularMainPicture) {
				const mainPictureId = extractPublicId(existingCircular.circularMainPicture);
				if (mainPictureId) {
					await cloudinary.v2.uploader.destroy(mainPictureId);
				}
			}
			const uploadResult = await uploadToCloudinary(formData.get("circularMainPicture"), "circulars");
			circularMainPictureUrl = uploadResult?.secure_url || "";
		}

		if (formData.get("circularSecondPicture")) {
			if (existingCircular.circularSecondPicture) {
				const secondPictureId = extractPublicId(existingCircular.circularSecondPicture);
				if (secondPictureId) {
					await cloudinary.v2.uploader.destroy(secondPictureId);
				}
			}
			const uploadResult = await uploadToCloudinary(formData.get("circularSecondPicture"), "circulars");
			circularSecondPictureUrl = uploadResult?.secure_url || "";
		}

		existingCircular.circularTitle = circularTitle;
		existingCircular.circularDesc = circularDesc;
		existingCircular.circularAuthor = circularAuthor;
		existingCircular.publicationStatus = publicationStatus;
		existingCircular.circularPublishedAt = circularPublishedAt ? new Date(circularPublishedAt) : null;
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
