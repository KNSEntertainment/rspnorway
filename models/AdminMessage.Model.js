import mongoose from "mongoose";

const AdminMessageSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, "Title is required"],
		trim: true,
		maxlength: [200, "Title cannot exceed 200 characters"],
	},

	content: {
		type: String,
		required: [true, "Content is required"],
		minlength: [10, "Content must be at least 10 characters long"],
	},

	type: {
		type: String,
		enum: ["announcement", "reminder", "update", "alert", "general"],
		default: "general",
	},

	priority: {
		type: String,
		enum: ["low", "medium", "high", "urgent"],
		default: "medium",
	},

	recipientType: {
		type: String,
		enum: ["all", "executive", "general", "specific"],
		default: "all",
	},

	sentBy: {
		type: String,
		required: [true, "Sender information is required"],
		ref: "Membership", // Reference to admin who sent it
	},

	isActive: {
		type: Boolean,
		default: true,
	},

	expiresAt: {
		type: Date,
		default: null, // null means no expiration
	},

	readBy: [{
		memberId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Membership",
		},
		readAt: {
			type: Date,
			default: Date.now,
		},
	}],

	attachments: [{
		filename: String,
		url: String,
		fileType: String,
		size: Number,
	}],

	createdAt: {
		type: Date,
		default: Date.now,
	},

	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Index for better query performance
AdminMessageSchema.index({ recipientType: 1, isActive: 1, createdAt: -1 });
AdminMessageSchema.index({ "readBy.memberId": 1 });

// Pre-save middleware to update the updatedAt field
AdminMessageSchema.pre('save', function(next) {
	this.updatedAt = new Date();
	next();
});

export default mongoose.models.AdminMessage || mongoose.model("AdminMessage", AdminMessageSchema);
