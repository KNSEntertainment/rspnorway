import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video.Model";

// OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
	
	return NextResponse.json({}, { headers });
}

// GET all videos
export async function GET() {
	try {
		console.log("Fetching videos...");
		await connectDB();
		const videos = await Video.find({ isActive: true }).sort({ createdAt: -1 });
		console.log(`Found ${videos.length} videos`);
		console.log("Videos:", videos.map(v => ({ id: v._id, title: v.title_en, url: v.url, isActive: v.isActive })));
		
		// Add CORS headers
		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};
		
		return NextResponse.json({ success: true, videos }, { 
			status: 200,
			headers 
		});
	} catch (error) {
		console.error("Error fetching videos:", error);
		
		// Add CORS headers to error response
		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};
		
		return NextResponse.json({ success: false, error: error.message }, { 
			status: 500,
			headers 
		});
	}
}
