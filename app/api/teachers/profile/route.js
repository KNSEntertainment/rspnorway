import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher.Model";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

async function getPayload(req) {
	const tokenObj = req.cookies.get("authToken");
	const token = tokenObj?.value;
	if (!token) return null;
	const secretKey = new TextEncoder().encode(JWT_SECRET);
	const { payload } = await jwtVerify(token, secretKey);
	return payload;
}

export async function GET(req) {
	try {
		const payload = await getPayload(req);
		if (!payload?.email) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();
		const teacher = await Teacher.findOne({ email: payload.email.trim().toLowerCase() }).populate({ path: "classIds", select: "name room homeroom" });
		if (!teacher) {
			return NextResponse.json({ success: false, error: "Teacher record not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, teacher }, { status: 200 });
	} catch (error) {
		console.error("Error fetching teacher profile:", error);
		return NextResponse.json({ success: false, error: error.message || "Failed to load profile" }, { status: 500 });
	}
}

export async function PATCH(req) {
	try {
		const payload = await getPayload(req);
		if (!payload?.email) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		await connectDB();
		const teacher = await Teacher.findOne({ email: payload.email.trim().toLowerCase() });
		if (!teacher) {
			return NextResponse.json({ success: false, error: "Teacher record not found" }, { status: 404 });
		}

		const allowedFields = ["phone", "bio", "address", "qualifications", "yearsOfExperience", "emergencyContactName", "emergencyContactPhone", "avatarUrl"];
		allowedFields.forEach((field) => {
			if (Object.prototype.hasOwnProperty.call(body, field)) {
				if (field === "yearsOfExperience") {
					const num = Number(body[field]);
					teacher[field] = Number.isFinite(num) && num >= 0 ? num : 0;
				} else {
					teacher[field] = body[field] || "";
				}
			}
		});

		await teacher.save();
		await teacher.populate({ path: "classIds", select: "name room homeroom" });

		return NextResponse.json({ success: true, teacher }, { status: 200 });
	} catch (error) {
		console.error("Error updating teacher profile:", error);
		return NextResponse.json({ success: false, error: error.message || "Failed to update profile" }, { status: 500 });
	}
}
