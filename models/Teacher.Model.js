import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true, index: true },
		phone: { type: String, required: true },
		employeeId: { type: String, required: true, unique: true },
		designation: { type: String, required: true },
		subjects: [{ type: String }],
		classIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
		yearsOfExperience: { type: Number, default: 0 },
		qualifications: { type: String, default: "" },
		bio: { type: String, default: "" },
		address: { type: String, default: "" },
		dateOfBirth: { type: Date },
		hireDate: { type: Date },
		emergencyContactName: { type: String, default: "" },
		emergencyContactPhone: { type: String, default: "" },
		status: { type: String, enum: ["pending", "active", "inactive"], default: "pending" },
		avatarUrl: { type: String, default: "" },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		inviteToken: { type: String },
		inviteExpires: { type: Date },
		inviteSentAt: { type: Date },
		metadata: { type: Map, of: String },
	},
	{ timestamps: true }
);

teacherSchema.virtual("fullName").get(function fullName() {
	return `${this.firstName} ${this.lastName}`.trim();
});

export default mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
