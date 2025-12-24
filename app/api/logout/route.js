import { NextResponse } from "next/server";

export async function POST() {
	const response = NextResponse.json({
		success: true,
		message: "Logged out successfully",
	});

	// Clear the authToken cookie
	response.cookies.set("authToken", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 0, // Expire immediately
		path: "/",
	});

	return response;
}
