import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(request) {
	try {
		await connectDB();

		// Parse the incoming form data
		const formData = await request.formData();
		console.log("Received form data");

		const audiencename = formData.get("audiencename");
		const audienceaddress = formData.get("audienceaddress");
		const audiencetestimony = formData.get("audiencetestimony");
		const audienceimage = formData.get("audienceimage");

		console.log("Parsed form data:", { audiencename, audienceaddress, audiencetestimony, audienceimage });

		// Validate input
		if (!audiencename || !audienceaddress || !audiencetestimony || !audienceimage) {
			return NextResponse.json({ success: false, error: "All fields are required to create a testimonial" }, { status: 400 });
		}

		// Save the image to the uploads directory
		const audienceImageUrl = await uploadToCloudinary(audienceimage, "testimonial_images");

		// Save the testimonial to MongoDB
		console.log("Saving testimonial to database");
		const testimonial = await Testimonial.create({
			audiencename,
			audienceaddress,
			audiencetestimony,
			audienceimage: audienceImageUrl,
		});
		console.log("Testimonial saved successfully:", testimonial);

		return NextResponse.json({ success: true, testimonial }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
