import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Assignment from "@/models/Assignment.Model";
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

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const auth = await getAuth(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const formData = await request.formData();
        const title = formData.get("title")?.toString().trim();
        const classGroup = formData.get("classGroup")?.toString().trim();
        const subject = formData.get("subject")?.toString().trim();
        const dueDateRaw = formData.get("dueDate")?.toString();
        const description = formData.get("description")?.toString().trim() || "";
        const videoLink = formData.get("videoLink")?.toString().trim();
        const status = formData.get("status")?.toString() || "Draft";
        const scheduledPublishAtRaw = formData.get("scheduledPublishAt")?.toString();

        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
        }

        // Authorization: only the creator or admin can update
        if (auth.role !== "admin" && assignment.createdBy !== auth.email) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const update = {};
        if (title) update.title = title;
        if (classGroup) update.classGroup = classGroup;
        if (subject) update.subject = subject;
        if (description !== undefined) update.description = description;
        if (status) update.status = status;
        if (videoLink !== undefined) update.videoLink = videoLink; // Model doesn't have videoLink field directly, it stores in resources.

        if (dueDateRaw) {
            const dueDate = new Date(dueDateRaw);
            if (!Number.isNaN(dueDate.getTime())) {
                update.dueDate = dueDate;
            }
        }

        if (scheduledPublishAtRaw) {
            const scheduledAt = new Date(scheduledPublishAtRaw);
            if (!Number.isNaN(scheduledAt.getTime())) {
                update.scheduledPublishAt = scheduledAt;
            }
        } else {
            // If they cleared scheduled time
            update.scheduledPublishAt = null;
        }

        // Handle new files
        const files = formData.getAll("files") || [];
        let resources = [...(assignment.resources || [])];

        // Update YouTube link in resources if changed
        if (videoLink !== undefined) {
            // Remove old YouTube link if exists
            resources = resources.filter(r => r.name !== "YouTube");
            if (videoLink) {
                resources.push({ name: "YouTube", url: videoLink, type: "link" });
            }
        }

        for (const file of files) {
            if (file && typeof file.name === "string" && typeof file.arrayBuffer === "function") {
                const saved = await saveUploadedFile(file, "assignments");
                resources.push({ ...saved, name: file.name });
            }
        }
        update.resources = resources;

        const updatedAssignment = await Assignment.findByIdAndUpdate(id, update, { new: true });

        return NextResponse.json({ success: true, assignment: updatedAssignment }, { status: 200 });
    } catch (error) {
        console.error("Error updating assignment:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const auth = await getAuth(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
        }

        if (auth.role !== "admin" && assignment.createdBy !== auth.email) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await Assignment.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "Assignment deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting assignment:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
