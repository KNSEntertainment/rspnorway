import mongoose from "mongoose";

const HeroSchema = new mongoose.Schema(
	{
		mainheading: {
			type: String,
			required: true,
			trim: true,
		},
		subheading: {
			type: String,
			required: true,
			trim: true,
		},

		heroimage: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Hero || mongoose.model("Hero", HeroSchema);
