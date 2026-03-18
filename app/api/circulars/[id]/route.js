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

		const getLocalized = (mapLike, key) => {
			if (!mapLike) return "";
			if (typeof mapLike.get === "function") return mapLike.get(key) || "";
			return mapLike[key] || "";
		};

		const getField = (name, fallback) => {
			if (!formData.has(name)) return fallback;
			const value = formData.get(name);
			return value === null || value === undefined ? fallback : value.toString();
		};

		// Update multi-language fields
		const circularTitle = {
			en: getField("circularTitle_en", getLocalized(existingCircular.circularTitle, "en")),
			no: getField("circularTitle_no", getLocalized(existingCircular.circularTitle, "no")),
			ne: getField("circularTitle_ne", getLocalized(existingCircular.circularTitle, "ne")),
		};

		const circularDesc = {
			en: getField("circularDesc_en", getLocalized(existingCircular.circularDesc, "en")),
			no: getField("circularDesc_no", getLocalized(existingCircular.circularDesc, "no")),
			ne: getField("circularDesc_ne", getLocalized(existingCircular.circularDesc, "ne")),
		};

		const circularAuthor = {
			en: getField("circularAuthor_en", getLocalized(existingCircular.circularAuthor, "en")),
			no: getField("circularAuthor_no", getLocalized(existingCircular.circularAuthor, "no")),
			ne: getField("circularAuthor_ne", getLocalized(existingCircular.circularAuthor, "ne")),
		};

		const publicationStatus = getField("publicationStatus", existingCircular.publicationStatus);
		const circularPublishedAt = getField("circularPublishedAt", existingCircular.circularPublishedAt);

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
			circularMainPictureUrl = await uploadToCloudinary(formData.get("circularMainPicture"), "circulars");
		}

		if (formData.get("circularSecondPicture")) {
			if (existingCircular.circularSecondPicture) {
				const secondPictureId = extractPublicId(existingCircular.circularSecondPicture);
				if (secondPictureId) {
					await cloudinary.v2.uploader.destroy(secondPictureId);
				}
			}
			circularSecondPictureUrl = await uploadToCloudinary(formData.get("circularSecondPicture"), "circulars");
		}

		existingCircular.circularTitle = circularTitle;
		existingCircular.circularDesc = circularDesc;
		existingCircular.circularAuthor = circularAuthor;
		existingCircular.publicationStatus = publicationStatus;
		const publishedAtDate = circularPublishedAt ? new Date(circularPublishedAt) : null;
		existingCircular.circularPublishedAt = publishedAtDate && !Number.isNaN(publishedAtDate.getTime()) ? publishedAtDate : null;
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
