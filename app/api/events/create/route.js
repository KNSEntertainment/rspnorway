import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(request) {
	try {
		await connectDB();

		const token = request.cookies.get("authToken")?.value;
		if (!token) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}
		const secretKey = new TextEncoder().encode(JWT_SECRET);
		const { payload } = await jwtVerify(token, secretKey);
		const role = payload?.role;
		const creatorEmail = payload?.email || "";
		if (!role || !["teacher", "admin"].includes(role)) {
			return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
		}

		const formData = await request.formData();
		console.log("Received form data", formData);
		const eventname = formData.get("eventname");
		const eventdescription = formData.get("eventdescription");
		const eventvenue = formData.get("eventvenue");
		const eventdate = formData.get("eventdate");
		const eventtime = formData.get("eventtime");
		const classId = formData.get("classId");
		const classLabel = formData.get("classLabel");
		const eventposter = formData.get("eventposter");
		if (!eventposter || typeof eventposter.arrayBuffer !== "function") {
			return NextResponse.json({ success: false, error: "Invalid file upload for eventposter" }, { status: 400 });
		}

		const eventposter2 = formData.get("eventposter2");
		const eventposter3 = formData.get("eventposter3");
		const eventvideo = formData.get("eventvideo");

		// Validate input
		if (!eventname || !eventposter) {
			return NextResponse.json({ success: false, error: "Required fields are missing" }, { status: 400 });
		}
		if (role === "teacher" && !classLabel && !classId) {
			return NextResponse.json({ success: false, error: "Class is required for teacher-created events" }, { status: 400 });
		}

		// Format the date
		const formattedDate = eventdate ? new Date(eventdate).toISOString().split("T")[0] : "";

		// Upload images to Cloudinary
		const eventposterUrl = await uploadToCloudinary(eventposter, "magic_chalk_event_images");
		const eventposter2Url = eventposter2 ? await uploadToCloudinary(eventposter2, "magic_chalk_event_images") : null;
		const eventposter3Url = eventposter3 ? await uploadToCloudinary(eventposter3, "magic_chalk_event_images") : null;
		const eventvideoUrl = eventvideo ? await uploadToCloudinary(eventvideo, "magic_chalk_event_images") : null;

		// Save event to MongoDB
		console.log("Creating event in database");
		const event = await Event.create({
			eventname,
			eventdescription,
			eventvenue,
			eventdate: formattedDate,
			eventtime,
			classId: classId || null,
			classLabel: classLabel || "",
			createdBy: creatorEmail,
			eventposterUrl,
			eventposter2Url,
			eventposter3Url,
			eventvideoUrl,
		});
		console.log("Event created successfully:", event);

		return NextResponse.json({ success: true, event }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
