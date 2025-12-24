import mongoose from "mongoose";

const teacherTodoSchema = new mongoose.Schema(
	{
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", index: true, required: true },
		title: { type: String, required: true },
		description: { type: String, default: "" },
		status: { type: String, enum: ["open", "in-progress", "done"], default: "open" },
		priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
		dueDate: { type: Date },
		classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
		tags: [{ type: String }],
	},
	{ timestamps: true }
);

export default mongoose.models.TeacherTodo || mongoose.model("TeacherTodo", teacherTodoSchema);
