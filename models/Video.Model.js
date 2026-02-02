import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
	{
		url: { type: String, required: true }, // Cloudinary video URL
		thumbnail: { type: String, required: false }, // Cloudinary thumbnail/poster URL
		title: { type: String, required: true },
		category: { type: String, required: true },
		duration: { type: String, required: false }, // e.g., "2:45"
		description: { type: String, required: false },
		creator: { type: String, default: "RSP Norway" },
		uploadedBy: { type: String, required: false }, // Admin user who uploaded
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

export default mongoose.models.Video || mongoose.model("Video", videoSchema);
