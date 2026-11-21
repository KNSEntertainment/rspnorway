import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			index: true,
			default: "",
		},
		userName: {
			type: String,
			default: "Anonymous",
		},
		userEmail: {
			type: String,
			index: true,
			default: "",
		},
		userRole: {
			type: String,
			enum: ["admin", "treasurer", "member", "guest", "unknown"],
			default: "unknown",
		},
		membershipType: {
			type: String,
			default: "none", // executive, general, none, etc.
			index: true,
		},
		action: {
			type: String,
			required: true,
			index: true,
			// Common actions: LOGIN, LOGIN_FAILED, LOGOUT, PAGE_VIEW, PROFILE_UPDATE, PASSWORD_CHANGE,
			// EVENT_REGISTRATION, EVENT_CHECKIN, SEND_MESSAGE, ADMIN_ACTION, DOWNLOAD, etc.
		},
		category: {
			type: String,
			enum: ["auth", "navigation", "profile", "communication", "event", "finance", "admin", "system", "general"],
			default: "general",
			index: true,
		},
		description: {
			type: String,
			required: true,
		},
		path: {
			type: String,
			default: "",
			index: true,
		},
		pageTitle: {
			type: String,
			default: "",
		},
		referrer: {
			type: String,
			default: "",
		},
		ipAddress: {
			type: String,
			default: "",
		},
		userAgent: {
			type: String,
			default: "",
		},
		browser: {
			type: String,
			default: "Unknown",
		},
		os: {
			type: String,
			default: "Unknown",
		},
		device: {
			type: String,
			enum: ["desktop", "mobile", "tablet", "unknown"],
			default: "unknown",
		},
		status: {
			type: String,
			enum: ["success", "failed", "warning", "info"],
			default: "success",
			index: true,
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
	},
	{
		timestamps: true,
	}
);

// Compound indexes for optimal query performance on dashboard
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ userEmail: 1, createdAt: -1 });
ActivityLogSchema.index({ membershipType: 1, createdAt: -1 });
ActivityLogSchema.index({ category: 1, createdAt: -1 });

const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);

export default ActivityLog;
