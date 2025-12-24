import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: [true, "First name is required"],
		minlength: [2, "First name must be at least 2 characters long"],
	},
	lastName: {
		type: String,
		required: [true, "Last name is required"],
		minlength: [2, "Last name must be at least 2 characters long"],
	},
	email: {
		type: String,
		required: [true, "Email is required"],
		match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
	},
	phone: {
		type: String,
		required: [true, "Phone number is required"],
	},

	message: {
		type: String,
		required: [true, "Message is required"],
		minlength: [10, "Message must be at least 10 characters long"],
	},
	childName: {
		type: String,
		default: "",
	},
	classGroup: {
		type: String,
		default: "",
	},
	relation: {
		type: String,
		default: "Parent/Guardian",
	},
	topic: {
		type: String,
		default: "",
	},
	priority: {
		type: String,
		enum: ["normal", "urgent"],
		default: "normal",
	},
	status: {
		type: String,
		enum: ["open", "closed"],
		default: "open",
	},
	studentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Student",
		default: null,
	},
	messages: {
		type: [
			{
				senderType: { type: String, enum: ["parent", "teacher"], required: true },
				senderName: { type: String, default: "" },
				body: { type: String, required: true },
				via: { type: String, default: "portal" },
				createdAt: { type: Date, default: Date.now },
			},
		],
		default: [],
	},
	lastMessageAt: {
		type: Date,
		default: Date.now,
	},
	unreadForTeacher: {
		type: Boolean,
		default: true,
	},
	unreadForParent: {
		type: Boolean,
		default: false,
	},
	teacherEmail: {
		type: String,
		default: "",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
