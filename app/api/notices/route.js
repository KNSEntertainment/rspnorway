import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Notice from "@/models/Notice.Model";
import Student from "@/models/Student.Model";

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

export async function GET(request) {
	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		let filter = {};
		if (auth.role === "admin") {
			filter = {};
		} else if (auth.role === "parent") {
			const children = await Student.find({ guardianEmail: auth.email }).select("classGroup").lean();
			const classGroups = children.map((c) => c.classGroup).filter(Boolean);
			if (classGroups.length > 0) {
				filter = { classGroup: { $in: classGroups } };
			} else {
				filter = { _id: null };
			}
		} else {
			filter = { createdBy: auth.email };
		}

		const notices = await Notice.find(filter).sort({ noticedate: -1, createdAt: -1 });

		return NextResponse.json({ success: true, notices }, { status: 200 });
	} catch (error) {
		console.error("Error fetching notices:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
