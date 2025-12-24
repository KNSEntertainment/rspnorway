import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClassModel from "@/models/Class.Model";

export async function GET(_request, { params }) {
	try {
		await connectDB();
		const cls = await ClassModel.findById(params.id);
		if (!cls) {
			return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true, class: cls }, { status: 200 });
	} catch (error) {
		console.error("Error fetching class:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function PUT(request, { params }) {
	try {
		await connectDB();
		const body = await request.json();
		const { name, slug, description = "", room, homeroom, order } = body || {};

		const update = {};
		if (name) update.name = name.trim();
		if (slug) update.slug = slug.trim();
		if (description !== undefined) update.description = description;
		if (room !== undefined) update.room = room;
		if (homeroom !== undefined) update.homeroom = Boolean(homeroom);
		if (order !== undefined) update.order = order;

		if (
			!update.name &&
			!update.slug &&
			update.description === undefined &&
			update.room === undefined &&
			update.homeroom === undefined &&
			update.order === undefined
		) {
			return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
		}

		if (update.name && !update.slug) {
			update.slug = update.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)/g, "");
		}

		const updated = await ClassModel.findByIdAndUpdate(params.id, update, { new: true });
		if (!updated) {
			return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, class: updated }, { status: 200 });
	} catch (error) {
		console.error("Error updating class:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(_request, { params }) {
	try {
		await connectDB();
		const deleted = await ClassModel.findByIdAndDelete(params.id);
		if (!deleted) {
			return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true, message: "Class deleted" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting class:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
