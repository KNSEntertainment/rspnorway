import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		author: { type: String, required: true },
		tags: { type: [String], default: [] },
		published: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
