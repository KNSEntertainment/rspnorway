import mongoose from "mongoose";

// Users Collection: Admin users only
// This collection is exclusively for administrative users who need access to the dashboard and admin features
const userSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		userName: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ["admin", "treasurer"], default: "admin", required: true },
		phone: { type: String },
		isActive: { type: Boolean, default: true },
		// Password reset tokens
		resetToken: { type: String },
		resetTokenExpiry: { type: Date },
		// Email verification
		emailVerified: { type: Boolean, default: false },
		emailVerificationToken: { type: String },
		emailVerificationExpiry: { type: Date },
		// Metadata
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who created this user
		lastLoginAt: { type: Date },
	},
	{
		timestamps: true,
	}
);

// Add indexes for performance
userSchema.index({ resetToken: 1 });
userSchema.index({ emailVerificationToken: 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);
