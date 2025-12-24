import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
	{
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
		date: { type: Date, required: true },
		status: { type: String, enum: ["present", "absent"], required: true },
		classGroup: { type: String, default: "" },
		markedBy: { type: String, default: "" },
		note: { type: String, default: "" },
		emailNotified: { type: Boolean, default: false },
		emailNotifiedAt: { type: Date },
	},
	{ timestamps: true }
);

AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
