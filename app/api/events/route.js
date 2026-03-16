import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";

export async function GET() {
	try {
		await connectDB();
		const query = {};
		const events = await Event.find(query).sort({ eventdate: -1 });
		return NextResponse.json({ success: true, events }, { status: 200 });
	} catch (error) {
		console.error("Error fetching events:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
