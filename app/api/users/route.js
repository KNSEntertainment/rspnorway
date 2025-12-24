import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";

export async function GET() {
	try {
		await connectDB();
		const users = await User.find();
		return NextResponse.json({ success: true, users }, { status: 200 });
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
