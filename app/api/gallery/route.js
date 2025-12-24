import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery.Model";
import ClassModel from "@/models/Class.Model";

export async function GET() {
	try {
		await connectDB();

		const galleryDocs = await Gallery.find().populate({ path: "classId", select: "name slug", strictPopulate: false });
		const gallery = galleryDocs.map((doc) => {
			const obj = doc.toObject();
			return { ...obj, classLabel: obj.classLabel || obj.classId?.name || "" };
		});
		const categories = await Gallery.distinct("category");
		const classes = await ClassModel.find({}).sort({ order: 1, name: 1 });

		return NextResponse.json({ success: true, gallery, categories, classes }, { status: 200 });
	} catch (error) {
		console.error("Error fetching gallery items:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
