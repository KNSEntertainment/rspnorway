import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/Setting.Model";

export async function POST(request) {
	try {
		await connectDB();
		const data = await request.json();
		const newSetting = new Setting(data);
		await newSetting.save();
		return NextResponse.json({ success: true, setting: newSetting }, { status: 201 });
	} catch (error) {
		console.error("Error creating setting:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET() {
	try {
		await connectDB();
		const settings = await Setting.find();
		return NextResponse.json({ success: true, settings }, { status: 200 });
	} catch (error) {
		console.error("Error fetching settings:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
