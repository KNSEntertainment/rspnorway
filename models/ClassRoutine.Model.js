import mongoose from "mongoose";

const classRoutineSchema = new mongoose.Schema(
	{
		classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
		day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], required: true },
		subject: { type: String, required: true, trim: true },
		startTime: { type: String, required: true },
		endTime: { type: String, required: true },
		room: { type: String, trim: true, default: "" },
		createdBy: { type: String, trim: true },
	},
	{ timestamps: true }
);

classRoutineSchema.index({ classId: 1, day: 1, startTime: 1 });

export default mongoose.models.ClassRoutine || mongoose.model("ClassRoutine", classRoutineSchema);
