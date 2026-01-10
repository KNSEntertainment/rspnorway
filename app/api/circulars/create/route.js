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

		const locale = formData.get("locale") || "en";
		const circularTitle = { en: "", ne: "", no: "" };
		circularTitle[locale] = formData.get("circularTitle")?.toString() || "";

		const circularDesc = { en: "", ne: "", no: "" };
		circularDesc[locale] = formData.get("circularDesc")?.toString() || "";

		const circularAuthor = { en: "", ne: "", no: "" };
		circularAuthor[locale] = formData.get("circularAuthor")?.toString() || "";

		const circularPublishedDate = formData.get("circularPublishedDate");
		const circularMainPicture = formData.get("circularMainPicture");
		const circularSecondPicture = formData.get("circularSecondPicture");
		const slug = circularTitle[locale]
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)+/g, "");

		let mainPictureUrl = "";
		if (circularMainPicture) {
			mainPictureUrl = (await uploadToCloudinary(circularMainPicture, "circulars"))?.secure_url || "";
		}

		let secondPictureUrl = "";
		if (circularSecondPicture) {
			secondPictureUrl = (await uploadToCloudinary(circularSecondPicture, "circulars"))?.secure_url || "";
		}

		const circular = await Circular.create({
			slug,
			circularTitle: { en: circularTitle[locale], ne: "", no: "" },
			circularDesc: { en: circularDesc[locale], ne: "", no: "" },
			circularAuthor: { en: circularAuthor[locale], ne: "", no: "" },
			circularMainPicture: mainPictureUrl,
			circularSecondPicture: secondPictureUrl,
			circularPublishedDate,
		});

		return NextResponse.json({ success: true, circular }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
