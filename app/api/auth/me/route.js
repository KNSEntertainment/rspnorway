import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student.Model";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export async function GET(req) {
	try {
		const tokenObj = req.cookies.get("authToken");
		const token = tokenObj?.value;

		if (!token) {
			return NextResponse.json({ user: null }, { status: 401 });
		}

		const secretKey = new TextEncoder().encode(JWT_SECRET);
		const { payload } = await jwtVerify(token, secretKey);

		await connectDB();
		let children = [];
		if (payload.role === "parent") {
			const records = await Student.find({ guardianEmail: payload.email }).select("firstName lastName classGroup guardianPhone").lean();
			children = records.map((child) => ({
				id: String(child._id),
				name: `${child.firstName} ${child.lastName}`.trim(),
				classGroup: child.classGroup || null,
				phone: child.guardianPhone || null
			}));
		}

		return NextResponse.json({
			user: {
				email: payload.email,
				id: payload.id,
				role: payload.role || null,
				children,
			},
		});
	} catch (error) {
		console.error("Failed to verify token:", error);
		return NextResponse.json({ user: null }, { status: 401 });
	}
}
