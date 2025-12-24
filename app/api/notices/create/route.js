import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Notice from "@/models/Notice.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";
import Teacher from "@/models/Teacher.Model";

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

export async function POST(request) {
	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		// Resolve the teacher's primary class so we can satisfy the required classGroup field.
		const teacherDoc = await Teacher.findOne({ email: auth.email }).populate({ path: "classIds", select: "name" });
		const classGroupName = teacherDoc?.classIds?.[0]?.name || "General";

		// Parse the incoming form data
		const formData = await request.formData();
		console.log("Received form data");

		const noticetitle = formData.get("noticetitle");
		const notice1 = formData.get("notice");
		const noticeimage = formData.get("noticeimage");

		console.log("Parsed form data:", { noticetitle, notice1, noticeimage });

		// Validate input
		if (!noticetitle || !notice1) {
			return NextResponse.json({ success: false, error: "Title and notice are required" }, { status: 400 });
		}

		let noticeImageUrl = null;
		if (noticeimage) {
			noticeImageUrl = await uploadToCloudinary(noticeimage, "notice_images");
		}

		// Save the notice to MongoDB
		console.log("Saving notice to database");
		const notice = await Notice.create({
			noticetitle,
			notice: notice1,
			noticedate: new Date().toISOString(),
			createdBy: auth.email,
			noticeimage: noticeImageUrl,
			classGroup: classGroupName,
		});
		console.log("Notice saved successfully:", notice);

		return NextResponse.json({ success: true, notice }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
