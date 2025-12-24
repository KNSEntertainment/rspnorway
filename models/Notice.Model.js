import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
	{
		noticetitle: {
			type: String,
			required: true,
			trim: true,
		},
		noticedate: {
			type: String,
			required: false,
			trim: true,
			default: () => new Date().toISOString(),
		},
		notice: {
			type: String,
			required: true,
			trim: true,
		},
		noticeimage: {
			type: String,
		},
		classGroup: {
			type: String,
			required: true,
			trim: true,
		},
		createdBy: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
