"use client";
import { useState } from "react";
import StudentForm from "@/components/StudentForm";

// Fields for Student collection
// const STUDENT_FIELDS = ["firstName", "lastName", "dob", "gender", "guardianName", "guardianPhone", "guardianEmail", "address", "classGroup", "enrollmentDate", "allergies", "medicalNotes", "transportRoute", "pickupPerson", "emergencyContact", "photoUrl"];

export default function AdmissionForm() {
	const [loading, setLoading] = useState(false);

	return (
		<div className="max-w-4xl mx-auto pt-32">
			<StudentForm
				submitLabel="Submit Application"
				loading={loading}
				resetOnSubmit={true}
				onSubmit={async (formData) => {
					// removed unused state
					setLoading(true);
					try {
						// Always set status to pending for admission, regardless of what is in the form
						const studentData = { ...formData, status: "pending" };
						const response = await fetch("/api/students", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ students: [studentData] }),
						});
						const result = await response.json();
						if (!response.ok || !result.success) {
							throw new Error(result.message || result.error || "Error submitting application");
						}
						// success message handled elsewhere or can be added as needed
						return true;
					} catch (error) {
						console.log(error);
						return false;
					} finally {
						setLoading(false);
					}
				}}
			/>
		</div>
	);
}
