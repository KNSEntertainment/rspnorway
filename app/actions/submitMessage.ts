"use server";

import { revalidatePath } from "next/cache";
import Message from "@/models/Message.Model";
import connectDB from "@/lib/mongodb";

export async function submitMessage(formData: FormData) {
	try {
		await connectDB();

		const now = new Date();
		const parentFirstName = String(formData.get("firstName"));
		const parentLastName = String(formData.get("lastName"));
		const parentEmail = String(formData.get("email"));
		const parentPhone = String(formData.get("phone"));
		const parentMessage = String(formData.get("message"));

		const message = new Message({
			firstName: parentFirstName,
			lastName: parentLastName,
			email: parentEmail,
			phone: parentPhone,
			message: parentMessage,
			relation: "Parent/Guardian",
			topic: "General question",
			priority: "normal",
			status: "open",
			messages: [
				{
					senderType: "parent",
					senderName: `${parentFirstName} ${parentLastName}`.trim() || "Parent",
					body: parentMessage,
					via: "contact-form",
					createdAt: now,
				},
			],
			lastMessageAt: now,
			unreadForTeacher: true,
		});

		console.log("Received data:", {
			firstName: formData.get("firstName"),
			lastName: formData.get("lastName"),
			// ...
		});

		await message.save();

		revalidatePath("/contact");
		return { success: true, message: "Message sent successfully!" };
	} catch (error) {
		console.error("Error submitting message:", error);
		return { success: false, message: "Failed to send message. Please try again." };
	}
}
