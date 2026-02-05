import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Circular from "@/models/Circular.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(request) {
	try {
		await connectDB();

		const formData = await request.formData();
		console.log("Received form data: ", formData);

		// Get multi-language fields
		const circularTitle = {
			en: formData.get("circularTitle_en")?.toString() || "",
			no: formData.get("circularTitle_no")?.toString() || "",
			ne: formData.get("circularTitle_ne")?.toString() || "",
		};

		const circularDesc = {
			en: formData.get("circularDesc_en")?.toString() || "",
			no: formData.get("circularDesc_no")?.toString() || "",
			ne: formData.get("circularDesc_ne")?.toString() || "",
		};

		const circularAuthor = {
			en: formData.get("circularAuthor_en")?.toString() || "",
			no: formData.get("circularAuthor_no")?.toString() || "",
			ne: formData.get("circularAuthor_ne")?.toString() || "",
		};

		const publicationStatus = formData.get("publicationStatus")?.toString() || "draft";
		const circularPublishedAt = formData.get("circularPublishedAt")?.toString() || "";
		const circularMainPicture = formData.get("circularMainPicture");
		const circularSecondPicture = formData.get("circularSecondPicture");

		// Generate slug from English title (fallback to first available language)
		const titleForSlug = circularTitle.en || circularTitle.no || circularTitle.ne || "circular";
		const slug = titleForSlug
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)+/g, "");

		let mainPictureUrl = "";
		if (circularMainPicture) {
		mainPictureUrl = await uploadToCloudinary(circularMainPicture, "circulars");
	}

	let secondPictureUrl = "";
	if (circularSecondPicture) {
		secondPictureUrl = await uploadToCloudinary(circularSecondPicture, "circulars");
		const circular = await Circular.create({
			slug,
			circularTitle,
			circularDesc,
			circularAuthor,
			circularMainPicture: mainPictureUrl,
			circularSecondPicture: secondPictureUrl,
			publicationStatus,
			circularPublishedAt: circularPublishedAt ? new Date(circularPublishedAt) : null,
		});

		return NextResponse.json({ success: true, circular }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
