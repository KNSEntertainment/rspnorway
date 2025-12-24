import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
	{
		audiencename: {
			type: String,
			required: true,
			trim: true,
		},
		audienceaddress: {
			type: String,
			required: true,
			trim: true,
		},
		audiencetestimony: {
			type: String,
			required: true,
			trim: true,
		},
		audienceimage: {
			type: String, // Path to the uploaded image
			required: true,
		},
	},
	{
		timestamps: true, // Automatically includes createdAt and updatedAt
	}
);

export default mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
