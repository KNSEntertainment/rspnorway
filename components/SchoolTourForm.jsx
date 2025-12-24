import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

const SchoolTourForm = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const onSubmit = async (data) => {
		setIsSubmitting(true);
		setErrorMessage("");

		try {
			const response = await fetch("/api/tour-bookings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to submit form");
			}

			setSubmitSuccess(true);
			reset();
			setTimeout(() => {
				router.push("/tour-confirmation");
			}, 3000);
		} catch (error) {
			console.error("Error submitting form:", error);
			setErrorMessage("There was a problem submitting your form. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto p-4 md:pt-32 bg-white rounded-lg shadow-md">
			<h1 className="text-2xl md:text-3xl font-bold text-center text-blue-600 mb-6">Book a School Tour</h1>

			{submitSuccess ? (
				<div className="p-4 mb-6 bg-[#0094da] text-[#0094da] rounded-md" role="alert">
					<p>Thank you for booking a tour! We&apos;ll contact you shortly to confirm your appointment.</p>
					<p>Redirecting you to confirmation page...</p>
				</div>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className="pt-32 space-y-6">
					<div className="space-y-4">
						<h2 className="text-xl font-semibold text-gray-800">Parent/Guardian Information</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="parentFirstName" className="block text-sm font-medium text-gray-700 mb-1">
									First Name *
								</label>
								<input id="parentFirstName" type="text" {...register("parentFirstName", { required: "First name is required" })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" aria-invalid={errors.parentFirstName ? "true" : "false"} />
								{errors.parentFirstName && (
									<p className="mt-1 text-sm text-red-600" role="alert">
										{errors.parentFirstName.message}
									</p>
								)}
							</div>

							<div>
								<label htmlFor="parentLastName" className="block text-sm font-medium text-gray-700 mb-1">
									Last Name *
								</label>
								<input id="parentLastName" type="text" {...register("parentLastName", { required: "Last name is required" })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" aria-invalid={errors.parentLastName ? "true" : "false"} />
								{errors.parentLastName && (
									<p className="mt-1 text-sm text-red-600" role="alert">
										{errors.parentLastName.message}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
									Email Address *
								</label>
								<input
									id="email"
									type="email"
									{...register("email", {
										required: "Email is required",
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message: "Invalid email address",
										},
									})}
									className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									aria-invalid={errors.email ? "true" : "false"}
								/>
								{errors.email && (
									<p className="mt-1 text-sm text-red-600" role="alert">
										{errors.email.message}
									</p>
								)}
							</div>

							<div>
								<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
									Phone Number *
								</label>
								<input
									id="phone"
									type="tel"
									{...register("phone", {
										required: "Phone number is required",
										pattern: {
											value: /^[\d\s\+\-\(\)]{8,10}$/,
											message: "Please enter a valid phone number",
										},
									})}
									className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									aria-invalid={errors.phone ? "true" : "false"}
								/>
								{errors.phone && (
									<p className="mt-1 text-sm text-red-600" role="alert">
										{errors.phone.message}
									</p>
								)}
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<h2 className="text-xl font-semibold text-gray-800">Child Information</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="childFirstName" className="block text-sm font-medium text-gray-700 mb-1">
									Child&apos;s First Name *
								</label>
								<input id="childFirstName" type="text" {...register("childFirstName", { required: "Child&apos;s first name is required" })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" aria-invalid={errors.childFirstName ? "true" : "false"} />
								{errors.childFirstName && (
									<p className="mt-1 text-sm text-red-600" role="alert">
										{errors.childFirstName.message}
									</p>
								)}
							</div>

							<div>
								<label htmlFor="childLastName" className="block text-sm font-medium text-gray-700 mb-1">
									Child&apos;s Last Name *
								</label>
								<input id="childLastName" type="text" {...register("childLastName", { required: "Child&apos;s last name is required" })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" aria-invalid={errors.childLastName ? "true" : "false"} />
								{errors.childLastName && (
									<p className="mt-1 text-sm text-red-600" role="alert">
										{errors.childLastName.message}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="childDob" className="block text-sm font-medium text-gray-700 mb-1">
									Child&apos;s Date of Birth *
								</label>
								<input id="childDob" type="date" {...register("childDob", { required: "Date of birth is required" })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" aria-invalid={errors.childDob ? "true" : "false"} />
								{errors.childDob && (
									<p className="mt-1 text-sm text-red-600" role="alert">
										{errors.childDob.message}
									</p>
								)}
							</div>

							<div>
								<label htmlFor="currentSchool" className="block text-sm font-medium text-gray-700 mb-1">
									Current School/Daycare (if any)
								</label>
								<input id="currentSchool" type="text" {...register("currentSchool")} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<h2 className="text-xl font-semibold text-gray-800">Tour Preferences</h2>

						<div>
							<label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
								Preferred Tour Date *
							</label>
							<input
								id="preferredDate"
								type="date"
								{...register("preferredDate", {
									required: "Preferred date is required",
									validate: (value) => new Date(value) >= new Date().setHours(0, 0, 0, 0) || "Please select a future date",
								})}
								min={new Date().toISOString().split("T")[0]}
								className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								aria-invalid={errors.preferredDate ? "true" : "false"}
							/>
							{errors.preferredDate && (
								<p className="mt-1 text-sm text-red-600" role="alert">
									{errors.preferredDate.message}
								</p>
							)}
						</div>

						<div>
							<label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
								Preferred Time *
							</label>
							<select id="preferredTime" {...register("preferredTime", { required: "Please select a preferred time" })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" aria-invalid={errors.preferredTime ? "true" : "false"}>
								<option value="">Select a time...</option>
								<option value="9:00 AM">9:00 AM</option>
								<option value="10:00 AM">10:00 AM</option>
								<option value="11:00 AM">11:00 AM</option>
								<option value="1:00 PM">1:00 PM</option>
								<option value="2:00 PM">2:00 PM</option>
							</select>
							{errors.preferredTime && (
								<p className="mt-1 text-sm text-red-600" role="alert">
									{errors.preferredTime.message}
								</p>
							)}
						</div>

						<div>
							<label htmlFor="alternateDate" className="block text-sm font-medium text-gray-700 mb-1">
								Alternate Tour Date (optional)
							</label>
							<input
								id="alternateDate"
								type="date"
								{...register("alternateDate", {
									validate: (value) => !value || new Date(value) >= new Date().setHours(0, 0, 0, 0) || "Please select a future date",
								})}
								min={new Date().toISOString().split("T")[0]}
								className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								aria-invalid={errors.alternateDate ? "true" : "false"}
							/>
							{errors.alternateDate && (
								<p className="mt-1 text-sm text-red-600" role="alert">
									{errors.alternateDate.message}
								</p>
							)}
						</div>

						<div>
							<label htmlFor="alternateTime" className="block text-sm font-medium text-gray-700 mb-1">
								Alternate Time (optional)
							</label>
							<select id="alternateTime" {...register("alternateTime")} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
								<option value="">Select a time...</option>
								<option value="9:00 AM">9:00 AM</option>
								<option value="10:00 AM">10:00 AM</option>
								<option value="11:00 AM">11:00 AM</option>
								<option value="1:00 PM">1:00 PM</option>
								<option value="2:00 PM">2:00 PM</option>
							</select>
						</div>
					</div>

					<div>
						<label htmlFor="questions" className="block text-sm font-medium text-gray-700 mb-1">
							Questions or Special Requests
						</label>
						<textarea id="questions" rows="4" {...register("questions")} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Please let us know if you have any questions or special requirements for the tour."></textarea>
					</div>

					<div>
						<label className="flex items-start">
							<input type="checkbox" {...register("agreeTerms", { required: "You must agree to the terms" })} className="mt-1 mr-2" aria-invalid={errors.agreeTerms ? "true" : "false"} />
							<span className="text-sm text-gray-700">
								I agree to the{" "}
								<a href="/terms" className="text-blue-600 hover:underline">
									terms and conditions
								</a>{" "}
								and consent to the processing of my personal data for the purpose of scheduling a school tour. *
							</span>
						</label>
						{errors.agreeTerms && (
							<p className="mt-1 text-sm text-red-600" role="alert">
								{errors.agreeTerms.message}
							</p>
						)}
					</div>

					{errorMessage && (
						<div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md" role="alert">
							{errorMessage}
						</div>
					)}

					<div className="flex justify-center">
						<button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
							{isSubmitting ? "Submitting..." : "Book School Tour"}
						</button>
					</div>
				</form>
			)}
		</div>
	);
};

export default SchoolTourForm;
