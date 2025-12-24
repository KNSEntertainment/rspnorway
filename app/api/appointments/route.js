import { NextResponse } from "next/server";

import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment.Model";
import Student from "@/models/Student.Model";
import Teacher from "@/models/Teacher.Model";
import User from "@/models/User.Model";

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

export async function POST(request) {
    try {
        await connectDB();
        const auth = await getAuth(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Only parents can request appointments
        if (auth.role !== "parent" && auth.role !== "admin") {
            return NextResponse.json({ success: false, error: "Only parents can request appointments" }, { status: 403 });
        }

        const body = await request.json();
        const { teacherId, studentId, date, time, topic } = body;

        if (!teacherId || !studentId || !date || !time) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Get parent details (for the name/email/phone fields required by the schema)
        // We use the auth user's details for these required legacy fields
        const user = await User.findById(auth.userId || auth.id);
        const student = await Student.findById(studentId);
        const teacher = await Teacher.findById(teacherId);

        if (!user || !student || !teacher) {
            return NextResponse.json({ success: false, error: "Invalid user, student, or teacher" }, { status: 404 });
        }

        const appointment = await Appointment.create({
            type: "teacher-meeting",
            // Legacy required fields - map from user/student
            name: user.fullName || student.guardianName || "User",
            email: user.email,
            phone: student.guardianPhone || user.phone || "Not provided",

            // Appointment details
            date: new Date(date),
            time,
            topic,
            status: "requested",

            // Relations
            teacherId,
            studentId,
            parentId: user._id,
        });

        return NextResponse.json({ success: true, appointment });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        await connectDB();
        const auth = await getAuth(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        let filter = { type: "teacher-meeting" };

        if (auth.role === "admin") {
            // Admin sees all? Or maybe filtered by params
        } else if (auth.role === "parent") {
            // Parent sees their own requests
            // We can find by parentId (User ID)
            // Need to map auth.email to User first if we don't have ID in token, but usually we do
            // Assuming auth payload has id/userId. If not, find User by email.
            let userId = auth.userId || auth.id;
            if (!userId) {
                const user = await User.findOne({ email: auth.email });
                if (user) userId = user._id;
            }
            if (userId) {
                filter.parentId = userId;
            }
        } else if (auth.role === "teacher") {
            // Teacher sees requests for them
            // Find teacher record by email first
            const teacher = await Teacher.findOne({ email: auth.email });
            if (teacher) {
                filter.teacherId = teacher._id;
            } else {
                return NextResponse.json({ success: true, appointments: [] });
            }
        }

        const appointments = await Appointment.find(filter)
            .populate("teacherId", "firstName lastName designation")
            .populate("studentId", "firstName lastName classGroup")
            .populate("parentId", "fullName email phone")
            .sort({ date: 1, time: 1 })
            .lean();

        return NextResponse.json({ success: true, appointments });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
