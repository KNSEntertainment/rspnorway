import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment.Model";
import Teacher from "@/models/Teacher.Model";
import { sendAppointmentConfirmation } from "@/lib/email";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

async function getAuth(req) {
    try {
        const tokenObj = req.cookies.get("authToken");
        const token = tokenObj?.value;
        if (!token || !JWT_SECRET) return null;
        const secretKey = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secretKey);
        return { ...payload, id: payload.id || payload.userId || payload.sub }; // Normalize ID
    } catch {
        return null;
    }
}

export async function PATCH(request, { params }) {
    try {
        await connectDB();
        const auth = await getAuth(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, reason, date, time } = body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
        }

        const isTeacher = auth.role === "teacher";
        const isParent = auth.role === "parent";
        const isAdmin = auth.role === "admin";

        // Permission Checks
        if (isTeacher) {
            const teacher = await Teacher.findOne({ email: auth.email });
            if (!teacher || String(appointment.teacherId) !== String(teacher._id)) {
                return NextResponse.json({ success: false, error: "Not authorized for this teacher's appointment" }, { status: 403 });
            }
        } else if (isParent) {
            if (String(appointment.parentId) !== String(auth.id)) {
                return NextResponse.json({ success: false, error: "Not authorized for this parent's appointment" }, { status: 403 });
            }
            // Parents can only:
            // 1. Accept/Reject if status is 'proposed'
            // 2. Mark as 'completed'
            const validParentStatuses = ["confirmed", "rejected", "completed"];
            if (!validParentStatuses.includes(status)) {
                return NextResponse.json({ success: false, error: "Invalid action for parent" }, { status: 400 });
            }
            if (status === "confirmed" || status === "rejected") {
                if (appointment.status !== "proposed") {
                    return NextResponse.json({ success: false, error: "Can only respond to proposed appointments" }, { status: 400 });
                }
            }
        } else if (!isAdmin) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        if (status) appointment.status = status;
        if (reason !== undefined) appointment.reason = reason;
        if (date) appointment.date = new Date(date);
        if (time) appointment.time = time;
        appointment.updatedAt = new Date();

        await appointment.save();

        if (status === "confirmed") {
            try {
                const refreshed = await Appointment.findById(appointment._id)
                    .populate("teacherId", "email firstName lastName")
                    .populate("parentId", "email fullName phone")
                    .populate("studentId", "firstName lastName");

                if (refreshed && refreshed.teacherId?.email && (refreshed.parentId?.email || refreshed.email)) {
                    const parentEmail = refreshed.parentId?.email || refreshed.email;
                    const teacherEmail = refreshed.teacherId.email;

                    await sendAppointmentConfirmation(
                        [teacherEmail, parentEmail],
                        {
                            parentName: refreshed.parentId?.fullName || refreshed.name || "Parent",
                            teacherName: `${refreshed.teacherId.firstName} ${refreshed.teacherId.lastName}`,
                            studentName: `${refreshed.studentId.firstName} ${refreshed.studentId.lastName}`,
                            date: refreshed.date,
                            time: refreshed.time,
                            topic: refreshed.topic
                        }
                    );
                }
            } catch (emailErr) {
                console.error("Email sending failed:", emailErr);
            }
        }

        return NextResponse.json({ success: true, appointment });
    } catch (error) {
        console.error("Error updating appointment:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
