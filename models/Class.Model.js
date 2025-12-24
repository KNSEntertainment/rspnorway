import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true, unique: true },
		slug: { type: String, required: true, trim: true, unique: true },
		description: { type: String, default: "" },
		room: { type: String, default: "" },
		homeroom: { type: Boolean, default: false },
		order: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

classSchema.pre("validate", function setSlug(next) {
	if (this.name && !this.slug) {
		this.slug = this.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");
	}
	next();
});

if (process.env.NODE_ENV === "development") {
	delete mongoose.models.Class;
}

export default mongoose.models.Class || mongoose.model("Class", classSchema);
