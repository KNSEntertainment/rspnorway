import mongoose from "mongoose";

// Membership Collection: Regular members only
// This collection is exclusively for regular members who apply for membership through the public form
const MembershipSchema = new mongoose.Schema({
	// Personal Information
	fullName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	phone: { type: String, required: true },
	address: { type: String, required: true },
	city: { type: String, required: true },
	postalCode: { type: String, required: true },
	dateOfBirth: { type: String, required: true },
	gender: { type: String, required: true, enum: ["male", "female", "other", "prefer-not-to-say"] },
	
	// Nepal Location
	province: { type: String },
	district: { type: String },
	
	// Professional Information
	profession: { type: String },
	skills: { type: String },
	
	// Membership Details
	membershipType: { type: String, enum: ["general", "executive"], required: true, default: "general" },
	membershipStatus: { type: String, enum: ["blocked", "pending", "approved"], required: true, default: "pending" },
	volunteerInterest: { type: [String], default: [] },
	
	// Permissions and Consent
	agreeTerms: { type: Boolean, required: true },
	permissionPhotos: { type: Boolean, default: false },
	permissionPhone: { type: Boolean, default: false },
	permissionEmail: { type: Boolean, default: false },
	
	// Profile
	profilePhoto: { type: String },
	
	// Authentication Fields
	password: { type: String },
	passwordSetupToken: { type: String },
	passwordSetupTokenExpiry: { type: Date },
	passwordResetToken: { type: String },
	passwordResetTokenExpiry: { type: Date },
	
	// Email Verification
	emailVerified: { type: Boolean, default: false },
	emailVerificationToken: { type: String },
	emailVerificationExpiry: { type: Date },
	
	// Email Preferences
	emailPreferences: {
		messages: { type: Boolean, default: true },
		announcements: { type: Boolean, default: true },
		newsletters: { type: Boolean, default: true },
		events: { type: Boolean, default: true },
	},
	
	// Metadata
	approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who approved this member
	approvedAt: { type: Date },
	memberSinceDate: { type: Date, default: Date.now }, // Editable member since date for ID cards
	lastLoginAt: { type: Date },
	loginAttempts: { type: Number, default: 0 },
	lockUntil: { type: Date },
}, {
	timestamps: true,
});

// Add indexes for performance
MembershipSchema.index({ membershipStatus: 1 });
MembershipSchema.index({ emailVerificationToken: 1 });
MembershipSchema.index({ passwordSetupToken: 1 });
MembershipSchema.index({ passwordResetToken: 1 });

// Add text index for search functionality
MembershipSchema.index({ fullName: "text" });

export default mongoose.models.Membership || mongoose.model("Membership", MembershipSchema);
