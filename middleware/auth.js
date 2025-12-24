import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export function middleware(req) {
	const token = req.cookies.get("authToken");

	if (!token) {
		// If no token is found, redirect to login page
		return NextResponse.redirect(new URL("/login", req.url));
	}

	try {
		// Verify the token
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded; // Optionally, pass user info to the request
	} catch (error) {
		// Invalid or expired token
		return NextResponse.redirect(new URL("/login", req.url));
	}

	// Proceed to the requested route
	return NextResponse.next();
}

// Define protected routes
export const config = {
	matcher: ["/dashboard/:path*"], // Protect all routes under /dashboard
};
