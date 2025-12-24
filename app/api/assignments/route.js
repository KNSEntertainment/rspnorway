import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Assignment from "@/models/Assignment.Model";
import Student from "@/models/Student.Model";
import { saveUploadedFile } from "@/lib/saveUploadedFile";

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

		const { searchParams } = new URL(request.url);
		const classGroup = searchParams.get("classGroup");
		const status = searchParams.get("status");
		let filter = {};
		if (classGroup) filter.classGroup = classGroup;
		if (status) filter.status = status;

		if (auth.role === "admin") {
			// Admin sees all assignments
			// no extra filter
		} else if (auth.role === "parent") {
			// Parent: get their children's classGroups
			const children = await Student.find({ guardianEmail: auth.email }).select("classGroup").lean();
			const classGroups = children.map((c) => c.classGroup).filter(Boolean);
			if (classGroups.length > 0) {
				filter.classGroup = { $in: classGroups };
			} else {
				// No children, see nothing
				filter._id = null;
			}
		} else {
			// Teacher or other: see only their own assignments
			filter.createdBy = auth.email;
		}

		// Auto-promote scheduled items whose publish time has passed
		const now = new Date();
		const promotionFilter = {
			status: "Scheduled",
			scheduledPublishAt: { $lte: now },
			...(auth.role !== "admin" ? { createdBy: auth.email } : {}),
		};
		await Assignment.updateMany(promotionFilter, { status: "Published" });

		const assignments = await Assignment.find(filter).sort({ createdAt: -1 }).lean();
		return NextResponse.json({ success: true, assignments }, { status: 200 });
	} catch (error) {
		console.error("Error fetching assignments:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
export async function POST(request) {
	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const title = formData.get("title")?.toString().trim();
		const classGroup = formData.get("classGroup")?.toString().trim();
		const subject = formData.get("subject")?.toString().trim();
		const dueDateRaw = formData.get("dueDate")?.toString();
		const description = formData.get("description")?.toString().trim() || "";
		const videoLink = formData.get("videoLink")?.toString().trim();
		const status = formData.get("status")?.toString() || "Draft";
		const scheduledPublishAtRaw = formData.get("scheduledPublishAt")?.toString();

		if (!title || !classGroup || !subject || !dueDateRaw) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		const dueDate = new Date(dueDateRaw);
		if (Number.isNaN(dueDate.getTime())) {
			return NextResponse.json({ success: false, error: "Invalid due date" }, { status: 400 });
		}

		let scheduledPublishAt;
		if (scheduledPublishAtRaw) {
			scheduledPublishAt = new Date(scheduledPublishAtRaw);
			if (Number.isNaN(scheduledPublishAt.getTime())) {
				return NextResponse.json({ success: false, error: "Invalid scheduled publish date" }, { status: 400 });
			}
		}

		const files = formData.getAll("files") || [];
		const resources = [];
		if (videoLink) {
			const isYoutube = /youtu(be\.com|\.be)/i.test(videoLink);
			if (!isYoutube) {
				return NextResponse.json({ success: false, error: "YouTube link is not valid" }, { status: 400 });
			}
			resources.push({ name: "YouTube", url: videoLink, type: "link" });
		}
		for (const file of files) {
			if (file && typeof file.name === "string" && typeof file.arrayBuffer === "function") {
				const saved = await saveUploadedFile(file, "assignments");
				resources.push({ ...saved, name: file.name });
			}
		}

		const assignment = await Assignment.create({
			title,
			classGroup,
			subject,
			description,
			dueDate,
			status,
			scheduledPublishAt,
			resources,
			createdBy: auth.email,
		});

		return NextResponse.json({ success: true, assignment }, { status: 201 });
	} catch (error) {
		console.error("Error creating assignment:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function PATCH(request) {
	try {
		await connectDB();
		const auth = await getAuth(request);
		if (!auth) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const id = body?.id || body?._id;
		const status = body?.status;
		const scheduledPublishAtRaw = body?.scheduledPublishAt;

		const allowedStatuses = ["Draft", "Scheduled", "Published", "Done"];
		if (!id || !status || !allowedStatuses.includes(status)) {
			return NextResponse.json({ success: false, error: "Invalid id or status" }, { status: 400 });
		}

		let scheduledPublishAt;
		if (scheduledPublishAtRaw) {
			scheduledPublishAt = new Date(scheduledPublishAtRaw);
			if (Number.isNaN(scheduledPublishAt.getTime())) {
				return NextResponse.json({ success: false, error: "Invalid scheduled publish date" }, { status: 400 });
			}
		}

		const filter = { _id: id };
		if (auth.role !== "admin") {
			filter.createdBy = auth.email;
		}

		const update = { status };
		if (scheduledPublishAt) {
			update.scheduledPublishAt = scheduledPublishAt;
		}

		const assignment = await Assignment.findOneAndUpdate(filter, update, { new: true });
		if (!assignment) {
			return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, assignment }, { status: 200 });
	} catch (error) {
		console.error("Error updating assignment:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
