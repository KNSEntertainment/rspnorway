import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video.Model";

// GET all videos
export async function GET() {
	try {
		await connectDB();
		const videos = await Video.find({ isActive: true }).sort({ createdAt: -1 });
		return NextResponse.json({ success: true, videos }, { status: 200 });
	} catch (error) {
		console.error("Error fetching videos:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
