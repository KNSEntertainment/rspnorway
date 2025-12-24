import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";

export async function GET(request) {
	try {
		await connectDB();
		const searchParams = request?.nextUrl?.searchParams;
		const classId = searchParams?.get("classId");
		const classLabel = searchParams?.get("classLabel");
		const query = {};
		if (classId) query.classId = classId;
		if (classLabel) query.classLabel = classLabel;
		const events = await Event.find(query).sort({ eventdate: -1 });
		return NextResponse.json({ success: true, events }, { status: 200 });
	} catch (error) {
		console.error("Error fetching events:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
