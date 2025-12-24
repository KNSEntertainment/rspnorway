import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student.Model";
import { sendParentWelcomeEmail } from "@/lib/email";

const REQUIRED_FIELDS = ["firstName", "lastName", "dob", "classGroup", "enrollmentDate", "guardianName", "guardianPhone", "address", "emergencyContact"];
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

function normalizeDate(value) {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request) {
	try {
		await connectDB();
		const auth = await getAuth(request);
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (id) {
			const query = { _id: id };
			if (auth?.role === "parent") {
				query.guardianEmail = auth.email;
			}
			const student = await Student.findOne(query);
			if (!student) {
				return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
			}
			return NextResponse.json({ success: true, student }, { status: 200 });
		}

		const filter = auth?.role === "parent" ? { guardianEmail: auth.email } : {};
		const students = await Student.find(filter).sort({ createdAt: -1 });
		return NextResponse.json({ success: true, students }, { status: 200 });
	} catch (error) {
		console.error("Error fetching students:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		await connectDB();
		const body = await request.json();
		const { students } = body || {};

		if (!Array.isArray(students)) {
			return NextResponse.json({ success: false, error: "Request body must include students array" }, { status: 400 });
		}

		const docs = [];
		const errors = [];

		students.forEach((row, index) => {
			const missing = REQUIRED_FIELDS.filter((field) => !row?.[field]);
			const dob = normalizeDate(row?.dob);
			const enrollmentDate = normalizeDate(row?.enrollmentDate);

			if (missing.length > 0 || !dob || !enrollmentDate) {
				errors.push({ index, reason: `Missing or invalid fields: ${[...missing, !dob && "dob", !enrollmentDate && "enrollmentDate"].filter(Boolean).join(", ")}` });
				return;
			}

			docs.push({
				firstName: row.firstName,
				lastName: row.lastName,
				dob,
				gender: row.gender || "",
				guardianName: row.guardianName,
				guardianPhone: row.guardianPhone,
				guardianEmail: row.guardianEmail?.trim() || undefined,
				address: row.address,
				classGroup: row.classGroup,
				enrollmentDate,
				allergies: row.allergies || "",
				medicalNotes: row.medicalNotes || "",
				transportRoute: row.transportRoute || "",
				pickupPerson: row.pickupPerson || "",
				emergencyContact: row.emergencyContact,
			});
		});

		if (docs.length === 0) {
			return NextResponse.json({ success: false, inserted: 0, errors }, { status: 400 });
		}

		const created = await Student.insertMany(docs, { ordered: false });

		const passwordSetBase = `${process.env.NEXT_PUBLIC_BASE_URL}/parent/set-password`;
		Promise.allSettled(
			created
				.filter((s) => s.guardianEmail)
				.map((s) =>
					sendParentWelcomeEmail(s.guardianEmail, {
						guardianName: s.guardianName,
						studentName: `${s.firstName} ${s.lastName}`.trim() || "your child",
						classGroup: s.classGroup,
						username: s.guardianEmail,
						passwordSetUrl: `${passwordSetBase}?email=${encodeURIComponent(s.guardianEmail)}`,
					})
				)
		).catch((err) => console.error("Welcome email batch failed", err));

		return NextResponse.json({ success: true, inserted: created.length, errors }, { status: errors.length ? 207 : 201 });
	} catch (error) {
		console.error("Error saving students:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function PUT(request) {
	try {
		await connectDB();
		const auth = await getAuth(request);
		const body = await request.json();
		const { id, student } = body || {};

		if (!id || !student) {
			return NextResponse.json({ success: false, error: "Request must include id and student payload" }, { status: 400 });
		}

		const missing = REQUIRED_FIELDS.filter((field) => !student?.[field]);
		const dob = normalizeDate(student?.dob);
		const enrollmentDate = normalizeDate(student?.enrollmentDate);
		if (missing.length > 0 || !dob || !enrollmentDate) {
			return NextResponse.json({ success: false, error: `Missing or invalid fields: ${[...missing, !dob && "dob", !enrollmentDate && "enrollmentDate"].filter(Boolean).join(", ")}` }, { status: 400 });
		}

		const update = {
			firstName: student.firstName,
			lastName: student.lastName,
			dob,
			gender: student.gender || "",
			guardianName: student.guardianName,
			guardianPhone: student.guardianPhone,
			guardianEmail: student.guardianEmail?.trim() || undefined,
			address: student.address,
			classGroup: student.classGroup,
			enrollmentDate,
			allergies: student.allergies || "",
			medicalNotes: student.medicalNotes || "",
			transportRoute: student.transportRoute || "",
			pickupPerson: student.pickupPerson || "",
			emergencyContact: student.emergencyContact,
			photoUrl: student.photoUrl || "",
		};
		// Allow status update if present in payload
		if (typeof student.status === "string") {
			update.status = student.status;
		}

		const query = { _id: id };
		if (auth?.role === "parent") {
			query.guardianEmail = auth.email;
		}

		// Get previous student for status check
		const prevStudent = await Student.findOne(query);
		const updated = await Student.findOneAndUpdate(query, update, { new: true });
		if (!updated) {
			return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
		}

		// If status changed from pending to active, send welcome email and create parent user
		if (prevStudent && prevStudent.status === "pending" && update.status === "active" && updated.guardianEmail) {
			// 1. Send welcome email with password set link
			const passwordSetBase = process.env.NEXT_PUBLIC_BASE_URL + "/parent/set-password";
			const passwordSetUrl = `${passwordSetBase}?email=${encodeURIComponent(updated.guardianEmail)}`;
			try {
				await sendParentWelcomeEmail(updated.guardianEmail, {
					guardianName: updated.guardianName,
					studentName: `${updated.firstName} ${updated.lastName}`.trim() || "your child",
					classGroup: updated.classGroup,
					username: updated.guardianEmail,
					passwordSetUrl,
				});
			} catch (err) {
				console.error("Failed to send parent welcome email:", err);
			}
			// 2. Create parent user if not exists
			try {
				await connectDB(); // Ensure DB connection before model import
				const User = (await import("@/models/User.Model")).default;
				const existing = await User.findOne({ email: updated.guardianEmail });
				console.log("Parent user existence check:", existing);
				if (!existing) {
					const userData = {
						fullName: updated.guardianName,
						email: updated.guardianEmail,
						userName: updated.guardianEmail, // Ensure correct field name
						password: "", // Password will be set by parent via link
						role: "parent",
						phone: updated.guardianPhone,
					};
					console.log("Creating parent user with data:", userData);
					const createdUser = await User.create(userData);
					console.log("Parent user created:", createdUser);
				}
			} catch (err) {
				console.error("Failed to create parent user:", err);
			}
		}

		return NextResponse.json({ success: true, student: updated }, { status: 200 });
	} catch (error) {
		console.error("Error updating student:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
