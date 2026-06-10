import mongoose from "mongoose";

const EventRegistrationSchema = new mongoose.Schema(
	{
		registrationId: {
			type: String,
			required: true,
		},
		eventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
			required: true,
		},
		userId: {
			type: String,
			required: true,
		},
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		phone: {
			type: String,
			required: true,
			trim: true,
		},
		adults: {
			type: Number,
			required: true,
			min: 1,
		},
		children: {
			type: Number,
			required: true,
			min: 0,
			default: 0,
		},
		elders: {
			type: Number,
			required: true,
			min: 0,
			default: 0,
		},
		students: {
			type: Number,
			min: 0,
			default: 0,
		},
		specialRequests: {
			type: String,
			trim: true,
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		paymentProofUrl: {
			type: String,
		},
		qrCode: {
			type: String,
		},
		status: {
			type: String,
			enum: ["pending", "confirmed", "cancelled"],
			default: "pending",
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "completed", "failed", "refunded"],
			default: "pending",
		},
		paymentId: {
			type: String,
		},
		checkedIn: {
			type: Boolean,
			default: false,
		},
		checkedInAt: {
			type: Date,
		},
		checkedInBy: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
EventRegistrationSchema.index({ registrationId: 1 });
EventRegistrationSchema.index({ eventId: 1 });
EventRegistrationSchema.index({ userId: 1 });
EventRegistrationSchema.index({ email: 1 });

// Virtual for full name
EventRegistrationSchema.virtual("fullName").get(function () {
	return `${this.firstName} ${this.lastName}`;
});

// Method to get total attendees
EventRegistrationSchema.methods.getTotalAttendees = function () {
	return (this.adults || 0) + (this.students || 0) + (this.children || 0) + (this.elders || 0);
};

// Pre-save middleware to generate registration ID if not provided
EventRegistrationSchema.pre("save", function (next) {
	if (!this.registrationId) {
		const timestamp = Date.now().toString(36);
		const randomStr = Math.random().toString(36).substring(2, 8);
		this.registrationId = `REG-${timestamp}-${randomStr}`.toUpperCase();
	}
	next();
});

const EventRegistration = mongoose.models.EventRegistration || mongoose.model("EventRegistration", EventRegistrationSchema);

export default EventRegistration;
