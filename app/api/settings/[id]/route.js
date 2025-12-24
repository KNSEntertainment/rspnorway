import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/Setting.Model";

export async function PUT(request) {
	try {
		await connectDB();
		const data = await request.json();
		const { _id, ...updateData } = data;
		const updatedSetting = await Setting.findByIdAndUpdate(_id, updateData, { new: true });
		if (!updatedSetting) {
			return NextResponse.json({ success: false, error: "Setting not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true, setting: updatedSetting }, { status: 200 });
	} catch (error) {
		console.error("Error updating setting:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
