import mongoose from "mongoose";

const MembershipSchema = new mongoose.Schema({
	fullName: { type: String, required: true },
	email: { type: String, required: true },
	phone: { type: String, required: true },
	address: { type: String, required: true },
	city: { type: String, required: true },
	postalCode: { type: String, required: true },
	dateOfBirth: { type: String, required: true },
	gender: { type: String, required: true },
	province: { type: String },
	district: { type: String },
	profession: { type: String },
	membershipType: { type: String, enum: ["general", "active"], required: true },
	membershipStatus: { type: String, enum: ["blocked", "pending", "approved"], required: true },
	nationalMembershipNo: { type: String },
	skills: { type: String },
	volunteerInterest: { type: [String], default: [] },
	agreeTerms: { type: Boolean, required: true },
	profilePhoto: { type: String },
	password: { type: String },
	passwordSetupToken: { type: String },
	passwordSetupTokenExpiry: { type: Date },
	passwordResetToken: { type: String },
	passwordResetTokenExpiry: { type: Date },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Membership || mongoose.model("Membership", MembershipSchema);
