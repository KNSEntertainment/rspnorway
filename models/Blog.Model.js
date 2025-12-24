import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
	{
		blogTitle: {
			type: String,
			required: true,
			trim: true,
		},
		blogDesc: {
			type: String,
			required: true,
			trim: true,
		},
		blogAuthor: {
			type: String,
			trim: true,
		},
		blogMainPicture: {
			type: String,
			required: true,
		},
		blogSecondPicture: {
			type: String,
		},
		blogDate: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
