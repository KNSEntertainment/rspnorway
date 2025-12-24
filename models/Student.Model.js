import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		dob: { type: Date, required: true },
		gender: { type: String },
		guardianName: { type: String, required: true },
		guardianPhone: { type: String, required: true },
		guardianEmail: {
			type: String,
			validate: {
				validator: (value) => !value || /.+@.+\..+/.test(value),
				message: "Please provide a valid guardian email",
			},
		},
		address: { type: String, required: true },
		classGroup: { type: String, required: true },
		enrollmentDate: { type: Date, required: true },
		allergies: { type: String, default: "" },
		medicalNotes: { type: String, default: "" }, // allergies/medical info only
		photoUrl: { type: String, default: "" },
		transportRoute: { type: String, default: "" },
		pickupPerson: { type: String, default: "" },
		emergencyContact: { type: String, required: true },
		status: {
			type: String,
			default: "pending",
			enum: ["active", "pending", "rejected"],
		},
	},
	{ timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
