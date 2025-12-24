import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function PUT(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const formData = await request.formData();
		const testimonialId = id;

		const testimonialData = {};
		for (const [key, value] of formData.entries()) {
			if (key !== "audienceimage") {
				testimonialData[key] = value;
			}
		}

		const audienceimage = formData.get("audienceimage");
		if (audienceimage) {
			testimonialData.audienceimage = await uploadToCloudinary(audienceimage, "testimonial_images");
		}

		const updatedTestimonial = await Testimonial.findByIdAndUpdate(testimonialId, testimonialData, { new: true });

		if (!updatedTestimonial) {
			return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, testimonial: updatedTestimonial }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const testimonialId = id;

		const deletedTestimonial = await Testimonial.findByIdAndDelete(testimonialId);

		if (!deletedTestimonial) {
			return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "Testimonial deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const testimonialId = id;
		const testimonial = await Testimonial.findById(testimonialId);

		if (!testimonial) {
			return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, testimonial }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
