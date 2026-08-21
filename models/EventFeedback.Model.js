import mongoose from "mongoose";

const EventFeedbackSchema = new mongoose.Schema(
	{
		eventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
			required: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
			match: /^\S+@\S+\.\S+$/,
		},
		message: {
			type: String,
			required: true,
		},
		locale: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

EventFeedbackSchema.index({ eventId: 1 });

const EventFeedback = mongoose.models.EventFeedback || mongoose.model("EventFeedback", EventFeedbackSchema);

export default EventFeedback;
