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
		minlength: [1, "Content cannot be empty"],
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
		enum: ["all", "executive", "general", "specific", "individual"],
		default: "all",
	},

	recipientEmails: [{
		type: String,
		trim: true,
		lowercase: true,
	}],

	recipientDetails: [{
		id: String,
		name: String,
		email: String,
		position: String,
	}],

	senderName: {
		type: String,
	},

	senderPosition: {
		type: String,
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

	emailSent: {
		type: Boolean,
		default: false,
	},

	emailSentAt: {
		type: Date,
	},

	emailSentCount: {
		type: Number,
		default: 0,
	},

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
AdminMessageSchema.index({ recipientEmails: 1 });
AdminMessageSchema.index({ "recipientDetails.email": 1 });
AdminMessageSchema.index({ "recipientDetails.id": 1 });
AdminMessageSchema.index({ sentBy: 1 });

// Pre-save middleware to update the updatedAt field
AdminMessageSchema.pre('save', function(next) {
	this.updatedAt = new Date();
	next();
});

if (mongoose.models && mongoose.models.AdminMessage) {
	delete mongoose.models.AdminMessage;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.AdminMessage) {
	delete mongoose.modelSchemas.AdminMessage;
}

export default mongoose.models.AdminMessage || mongoose.model("AdminMessage", AdminMessageSchema);
