import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial.Model";

export async function GET() {
	try {
		await connectDB();

		const testimonials = await Testimonial.find();

		return NextResponse.json({ success: true, testimonials }, { status: 200 });
	} catch (error) {
		console.error("Error fetching testimonials:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
