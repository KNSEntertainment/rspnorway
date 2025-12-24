// pages/api/admission-form.js
import connectDB from "@/lib/mongodb";
import AdmissionForm from "@/models/AdmissionForm";

export default async function handler(req, res) {
	await connectDB();

	// Only allow POST requests
	if (req.method !== "POST") {
		return res.status(405).json({ success: false, message: "Method not allowed" });
	}

	try {
		// Save the form data in the database
		const formData = await AdmissionForm.create(req.body);

		// Return success response
		return res.status(201).json({
			success: true,
			message: "Application submitted successfully",
			data: formData,
		});
	} catch (error) {
		console.error("Error submitting form:", error);

		// Handle validation errors
		if (error.name === "ValidationError") {
			const validationErrors = {};

			for (const field in error.errors) {
				validationErrors[field] = error.errors[field].message;
			}

			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: validationErrors,
			});
		}

		// Handle other errors
		return res.status(500).json({
			success: false,
			message: "Error submitting application",
			error: error.message,
		});
	}
}
