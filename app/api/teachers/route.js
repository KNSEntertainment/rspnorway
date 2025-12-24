import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher.Model";
import User from "@/models/User.Model";
import ClassModel from "@/models/Class.Model";
import Student from "@/models/Student.Model";
import { sendTeacherInviteEmail } from "@/lib/email";

export async function GET() {
	try {
		await connectDB();
		const teachers = await Teacher.find().populate({ path: "classIds" }).sort({ createdAt: -1 }).lean();

		// For each teacher, enhance their class data with student counts
		const enhancedTeachers = await Promise.all(
			teachers.map(async (teacher) => {
				if (Array.isArray(teacher.classIds)) {
					const updatedClasses = await Promise.all(
						teacher.classIds.map(async (cls) => {
							if (typeof cls === "object" && cls.name) {
								const studentCount = await Student.countDocuments({ classGroup: cls.name });
								return { ...cls, studentsCount: studentCount };
							}
							return cls;
						})
					);
					return { ...teacher, classIds: updatedClasses };
				}
				return teacher;
			})
		);

		return NextResponse.json({ success: true, teachers: enhancedTeachers }, { status: 200 });
	} catch (error) {
		console.error("Error fetching teachers:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		await connectDB();
		const body = await request.json();
		const { firstName, lastName, email, phone, employeeId, designation, subjects = [], classIds = [], yearsOfExperience = 0, qualifications = "", bio = "", address = "", dateOfBirth, hireDate, emergencyContactName = "", emergencyContactPhone = "", status = "pending", avatarUrl = "" } = body || {};

		if (!firstName || !lastName || !email || !phone || !employeeId || !designation) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		const normalizedEmail = email.trim().toLowerCase();

		const existingUser = await User.findOne({ email: normalizedEmail });
		if (existingUser) {
			return NextResponse.json({ success: false, error: "A user with this email already exists" }, { status: 400 });
		}

		const existingTeacher = await Teacher.findOne({ $or: [{ email: normalizedEmail }, { employeeId }] });
		if (existingTeacher) {
			return NextResponse.json({ success: false, error: "Teacher with this email or employee ID already exists" }, { status: 400 });
		}

		const classDocs = await ClassModel.find({ _id: { $in: classIds } });
		const resolvedClassIds = classDocs.map((c) => c._id);

		const tempPassword = crypto.randomBytes(12).toString("base64");
		const hashedPassword = await bcrypt.hash(tempPassword, 10);
		const inviteToken = crypto.randomBytes(24).toString("hex");
		const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

		const userDoc = await User.create({
			fullName: `${firstName} ${lastName}`.trim(),
			email: normalizedEmail,
			userName: normalizedEmail,
			password: hashedPassword,
			role: "teacher",
		});

		const teacherDoc = await Teacher.create({
			firstName,
			lastName,
			email: normalizedEmail,
			phone,
			employeeId,
			designation,
			subjects: Array.isArray(subjects)
				? subjects
				: String(subjects || "")
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean),
			classIds: resolvedClassIds,
			yearsOfExperience: Number(yearsOfExperience) || 0,
			qualifications,
			bio,
			address,
			dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
			hireDate: hireDate ? new Date(hireDate) : undefined,
			emergencyContactName,
			emergencyContactPhone,
			status,
			avatarUrl,
			userId: userDoc._id,
			inviteToken,
			inviteExpires,
			inviteSentAt: new Date(),
		});

		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
		const passwordSetUrl = `${baseUrl}/user?email=${encodeURIComponent(normalizedEmail)}&token=${inviteToken}`;

		try {
			await sendTeacherInviteEmail(normalizedEmail, {
				teacherName: `${firstName} ${lastName}`.trim(),
				employeeId,
				designation,
				passwordSetUrl,
				username: normalizedEmail,
			});
		} catch (emailError) {
			// Log more details if available
			console.error("Error sending teacher invite email:", emailError);
			if (emailError && emailError.response) {
				console.error("Email error response:", emailError.response);
			}
			return NextResponse.json({ success: false, error: `Teacher created but invite email failed: ${emailError && emailError.message ? emailError.message : emailError}` }, { status: 500 });
		}

		return NextResponse.json({ success: true, teacher: teacherDoc }, { status: 201 });
	} catch (error) {
		console.error("Error creating teacher:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
