import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
	{
		media: { type: [String], required: true },
		category: { type: String, required: true },
		classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: false },
		classLabel: { type: String, required: false },
		alt: { type: String, required: false },
	},
	{ timestamps: true }
);

export default mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);
