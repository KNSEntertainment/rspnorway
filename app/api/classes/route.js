import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/models/Class.Model";

export async function GET() {
	try {
		await connectDB();
		const classes = await ClassModel.find({}).sort({ order: 1, name: 1 });
		return NextResponse.json({ success: true, classes }, { status: 200 });
	} catch (error) {
		console.error("Error fetching classes:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		await connectDB();
		const body = await request.json();
		const { name, slug, description = "", room = "", homeroom = false, order = 0 } = body || {};

		if (!name) {
			return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
		}

		const payload = {
			name: name.trim(),
			slug:
				slug?.trim() ||
				name
					.trim()
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, ""),
			description,
			room,
			homeroom,
			order,
		};

		const created = await ClassModel.create(payload);
		return NextResponse.json({ success: true, class: created }, { status: 201 });
	} catch (error) {
		console.error("Error creating class:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
