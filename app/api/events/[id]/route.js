import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export const config = {
	api: {
		bodyParser: false,
	},
};

async function deleteFromCloudinary(url) {
	try {
		// Delete the file from Cloudinary
		const publicId = url.split("/").pop().split(".")[0];
		console.log("Deleting Cloudinary publicId:", publicId);
		const result = await cloudinary.uploader.destroy(`magic_chalk_event_images/${publicId}`);
		console.log("Cloudinary deletion result:", result);
		if (result.result !== "ok" && result.result !== "not_found") {
			throw new Error(`Failed to delete resource: ${result.result}`);
		}
	} catch (error) {
		console.error("Error deleting from Cloudinary:", error);
		throw error;
	}
}

export async function PUT(request, { params }) {
	const { id } = params;

	try {
		await connectDB();

		const token = request.cookies.get("authToken")?.value;
		if (!token) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}
		let payload;
		try {
			const secretKey = new TextEncoder().encode(JWT_SECRET);
			({ payload } = await jwtVerify(token, secretKey));
		} catch {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}
		const role = payload?.role;
		const requesterEmail = payload?.email || "";
		if (!role || !["teacher", "admin"].includes(role)) {
			return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
		}

		const formData = await request.formData();
		const eventId = id;

		const eventData = {};
		for (const [key, value] of formData.entries()) {
			if (key !== "eventposter" && key !== "eventposter2" && key !== "eventposter3" && key !== "eventvideo") {
				eventData[key] = value;
			}
		}

		const classId = formData.get("classId");
		const classLabel = formData.get("classLabel");
		if (classId !== null) {
			eventData.classId = classId || null;
		}
		if (classLabel !== null) {
			eventData.classLabel = classLabel || "";
		}

		const event = await Event.findById(eventId);
		if (!event) {
			return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
		}
		if (role === "teacher" && event.createdBy && event.createdBy !== requesterEmail) {
			return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
		}

		// Handle video update and deletion
		const eventvideo = formData.get("eventvideo");
		if (eventvideo && eventvideo.size > 0) {
			if (event.eventvideoUrl) {
				console.log("Old video URL:", event.eventvideoUrl);
				await deleteFromCloudinary(event.eventvideoUrl);
			}
			eventData.eventvideoUrl = await uploadToCloudinary(eventvideo, "magic_chalk_event_images");
		}

		// Handle other uploads similarly...

		const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, { new: true });

		return NextResponse.json({ success: true, event: updatedEvent }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// Helper to delete Cloudinary files
// async function deleteFromCloudinary(url) {
// 	const publicId = url.split("/").pop().split(".")[0];
// 	await cloudinary.uploader.destroy(`magic_chalk_event_images/${publicId}`);
// }

// DELETE API to delete event
export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const token = request.cookies.get("authToken")?.value;
		if (!token) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}
		let payload;
		try {
			const secretKey = new TextEncoder().encode(JWT_SECRET);
			({ payload } = await jwtVerify(token, secretKey));
		} catch {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}
		const role = payload?.role;
		const requesterEmail = payload?.email || "";
		if (!role || !["teacher", "admin"].includes(role)) {
			return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
		}

		const event = await Event.findById(id);
		if (!event) {
			return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
		}
		if (role === "teacher" && event.createdBy && event.createdBy !== requesterEmail) {
			return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
		}

		await Event.findByIdAndDelete(id);

		// Delete images from Cloudinary
		if (event.eventposterUrl) await deleteFromCloudinary(event.eventposterUrl);
		if (event.eventposter2Url) await deleteFromCloudinary(event.eventposter2Url);
		if (event.eventposter3Url) await deleteFromCloudinary(event.eventposter3Url);
		// if (event.eventvideoUrl) await deleteFromCloudinary(event.eventvideoUrl);

		return NextResponse.json({ success: true, message: "Event deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// GET API to fetch event details
export async function GET(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const event = await Event.findById(id);
		if (!event) {
			return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, event }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
