import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notice from "@/models/Notice.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

// GET single notice
export async function GET(request, { params }) {
	try {
		await connectDB();
		const { id } = params;
		const notice = await Notice.findById(id);

		if (!notice) {
			return NextResponse.json({ success: false, error: "Notice not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, notice }, { status: 200 });
	} catch (error) {
		console.error("Error fetching notice:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// UPDATE notice
export async function PUT(request, { params }) {
	try {
		await connectDB();
		const { id } = params;

		const formData = await request.formData();

		const noticetitle = formData.get("noticetitle");
		const noticedate = formData.get("noticedate");
		const notice = formData.get("notice");
		const noticeImageFile = formData.get("noticeimage");

		const existingNotice = await Notice.findById(id);
		if (!existingNotice) {
			return NextResponse.json({ success: false, error: "Notice not found" }, { status: 404 });
		}

		const updateData = {
			noticetitle: noticetitle || existingNotice.noticetitle,
			noticedate: noticedate || existingNotice.noticedate,
			notice: notice || existingNotice.notice,
		};

		// If new image is uploaded, delete old and upload new
		if (noticeImageFile && noticeImageFile.size > 0) {
			// Delete old image from Cloudinary
			if (existingNotice.noticeimage) {
				await deleteFromCloudinary(existingNotice.noticeimage, "image");
			}
			// Upload new image
			updateData.noticeimage = await uploadToCloudinary(noticeImageFile, "notices");
		}

		const updatedNotice = await Notice.findByIdAndUpdate(id, updateData, { new: true });

		return NextResponse.json({ success: true, notice: updatedNotice }, { status: 200 });
	} catch (error) {
		console.error("Error updating notice:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// DELETE notice
export async function DELETE(request, { params }) {
	try {
		await connectDB();
		const { id } = params;

		const notice = await Notice.findById(id);
		if (!notice) {
			return NextResponse.json({ success: false, error: "Notice not found" }, { status: 404 });
		}

		// Delete image from Cloudinary
		if (notice.noticeimage) {
			await deleteFromCloudinary(notice.noticeimage, "image");
		}

		// Delete from database
		await Notice.findByIdAndDelete(id);

		return NextResponse.json({ success: true, message: "Notice deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting notice:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
