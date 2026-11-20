import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 401 });
		}

		await connectDB();
		const { searchParams } = new URL(req.url);
		const email = searchParams.get("email");

		if (email) {
			// Return specific user by email
			const user = await User.findOne({ email }).select("-password -resetToken -setupToken");
			if (!user) {
				return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
			}
			return NextResponse.json(user, { status: 200 });
		}

		// Return all users
		const users = await User.find();
		return NextResponse.json({ success: true, users }, { status: 200 });
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
