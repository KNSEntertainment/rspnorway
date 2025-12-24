import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Notice from "@/models/Notice.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

async function getAuth(req) {
	try {
		const tokenObj = req.cookies.get("authToken");
		const token = tokenObj?.value;
		if (!token || !JWT_SECRET) return null;
		const secretKey = new TextEncoder().encode(JWT_SECRET);
		const { payload } = await jwtVerify(token, secretKey);
		return { email: payload.email, role: payload.role };
	} catch {
		return null;
	}
}

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function PUT(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const noticeId = id;

		const allowed = new Set(["noticetitle", "notice", "noticedate"]);
		const noticeData = {};
		for (const [key, value] of formData.entries()) {
			if (key !== "noticeimage" && allowed.has(key)) {
				noticeData[key] = value;
			}
		}

		const noticeimage = formData.get("noticeimage");
		if (noticeimage) {
			noticeData.noticeimage = await uploadToCloudinary(noticeimage, "notice_images");
		}

		const filter = { _id: noticeId };
		if (auth.role !== "admin") {
			filter.$or = [{ createdBy: auth.email }, { createdBy: { $exists: false } }];
		}

		const updatedNotice = await Notice.findOneAndUpdate(filter, { ...noticeData, createdBy: auth.email }, { new: true });

		if (!updatedNotice) {
			return NextResponse.json({ success: false, error: "Notice not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, Notice: updatedNotice }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const noticeId = id;
		const filter = { _id: noticeId };
		if (auth.role !== "admin") {
			filter.$or = [{ createdBy: auth.email }, { createdBy: { $exists: false } }];
		}

		const deletedNotice = await Notice.findOneAndDelete(filter);

		if (!deletedNotice) {
			return NextResponse.json({ success: false, error: "Notice not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "Notice deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const noticeId = id;
		const filter = { _id: noticeId };
		if (auth.role !== "admin") {
			filter.$or = [{ createdBy: auth.email }, { createdBy: { $exists: false } }];
		}

		const notice = await Notice.findOne(filter);

		if (!notice) {
			return NextResponse.json({ success: false, error: "Notice not found" }, { status: 404 });
		}

		if (!notice.createdBy && auth?.email) {
			notice.createdBy = auth.email;
			await notice.save();
		}

		return NextResponse.json({ success: true, notice }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
