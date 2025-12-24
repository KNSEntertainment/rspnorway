import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		url: { type: String, required: true },
		size: { type: Number },
		type: { type: String },
	},
	{ _id: false }
);

const AssignmentSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		classGroup: { type: String, required: true, trim: true },
		subject: { type: String, required: true, trim: true },
		description: { type: String, default: "" },
		dueDate: { type: Date, required: true },
		status: { type: String, enum: ["Draft", "Scheduled", "Published", "Done"], default: "Draft" },
		scheduledPublishAt: { type: Date },
		resources: { type: [ResourceSchema], default: [] },
		createdBy: { type: String, required: true, trim: true },
	},
	{ timestamps: true }
);

AssignmentSchema.index({ classGroup: 1, dueDate: -1 });
if (process.env.NODE_ENV === "development") {
	delete mongoose.models.Assignment;
}

export default mongoose.model("Assignment", AssignmentSchema);
