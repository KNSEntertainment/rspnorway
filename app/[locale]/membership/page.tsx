"use client";
import Link from "next/link";
import { useState } from "react";

export default function MembershipPage() {
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		postalCode: "",
		dateOfBirth: "",
		gender: "",
		nepaliOrigin: "",
		profession: "",
		membershipType: "general",
		skills: "",
		volunteerInterest: [] as string[],
		agreeTerms: false,
	});

	const [submitted, setSubmitted] = useState(false);
	const [emailError, setEmailError] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const target = e.target as HTMLInputElement | HTMLSelectElement;
		const name = target.name;
		const value = target.value;
		if (target instanceof HTMLInputElement && target.type === "checkbox" && name === "volunteerInterest") {
			const checked = target.checked;
			const currentInterests = formData.volunteerInterest;
			setFormData({
				...formData,
				volunteerInterest: checked ? [...currentInterests, value] : currentInterests.filter((item) => item !== value),
			});
		} else if (target instanceof HTMLInputElement && target.type === "checkbox") {
			setFormData({ ...formData, [name]: target.checked });
		} else {
			setFormData({ ...formData, [name]: value });
		}
	};

	const handleEmailBlur = async () => {
		if (!formData.email) return;
		try {
			const res = await fetch(`/api/membership?email=${encodeURIComponent(formData.email)}`);
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data) && data.length > 0) {
					setEmailError("This email is already registered.");
				} else {
					setEmailError("");
				}
			}
		} catch {
			setEmailError("");
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLButtonElement | HTMLFormElement>) => {
		e.preventDefault();
		try {
			const res = await fetch("/api/membership", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});
			if (!res.ok) throw new Error("Failed to submit application");
			setSubmitted(true);
			setFormData({
				fullName: "",
				email: "",
				phone: "",
				address: "",
				city: "",
				postalCode: "",
				dateOfBirth: "",
				gender: "",
				nepaliOrigin: "",
				profession: "",
				membershipType: "general",
				skills: "",
				volunteerInterest: [],
				agreeTerms: false,
			});
		} catch (error) {
			alert("There was an error submitting your application. Please try again." + error);
		}
	};

	if (submitted) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
					<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to RSP Norway!</h2>
					<p className="text-gray-700 mb-6">Your membership application has been received successfully. Our team will review your application and contact you within 48 hours.</p>
					<button onClick={() => setSubmitted(false)} className="bg-brand text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
						Submit Another
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen mt-12 md:mt-24 bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Hero Section */}
			{/* <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
				<div className="max-w-6xl mx-auto px-4">
					<h1 className="text-4xl md:text-5xl font-bold mb-4">Join RSP Norway</h1>
					<p className="text-xl text-blue-100 max-w-3xl">Be part of the movement to build a progressive, corruption-free Nepal. Your voice matters in shaping future of our nation.</p>
				</div>
			</div> */}

			{/* Benefits Section */}
			<div className="max-w-6xl mx-auto px-4 py-12">
				{/* <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Membership Benefits</h2>
				<div className="grid md:grid-cols-3 gap-6 mb-12">
					<BenefitCard
						icon={
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						}
						title="Community Network"
						description="Connect with like-minded Nepalis in Norway and be part of a vibrant community working for change."
					/>
					<BenefitCard
						icon={
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						}
						title="Participate in Decision Making"
						description="Vote on policies, participate in discussions, and help shape RSP's direction and initiatives."
					/>
					<BenefitCard
						icon={
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						}
						title="Exclusive Events & Updates"
						description="Access to member-only events, policy discussions, and direct updates from RSP leadership."
					/>
				</div> */}

				{/* Membership Form */}
				<div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
					<h2 className="text-3xl font-bold text-gray-900 mb-2">Membership Application Form</h2>
					<p className="text-gray-600 mb-8"> Your voice matters in shaping future of our nation. Fill out the information below to become a member of RSP Norway and be part of the movement to build a progressive, corruption-free Nepal.</p>

					<div className="space-y-6">
						{/* Personal Information */}
						<div>
							<h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Full Name <span className="text-red-500">*</span>
									</label>
									<input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your full name" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Email Address <span className="text-red-500">*</span>
									</label>
									<input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleEmailBlur} className={`w-full px-4 py-2 border ${emailError ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder="your.email@example.com" />
									{emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Phone Number <span className="text-red-500">*</span>
									</label>
									<input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+47 XXX XX XXX" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Date of Birth <span className="text-red-500">*</span>
									</label>
									<input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Gender <span className="text-red-500">*</span>
									</label>
									<select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
										<option value="">Select Gender</option>
										<option value="male">Male</option>
										<option value="female">Female</option>
										<option value="other">Other</option>
										<option value="prefer-not-to-say">Prefer not to say</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Nepali Origin (Province/District)</label>
									<input type="text" name="nepaliOrigin" value={formData.nepaliOrigin} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Kathmandu, Bagmati" />
								</div>
							</div>
						</div>

						{/* Address in Norway */}
						<div>
							<h3 className="text-xl font-semibold text-gray-900 mb-4">Address in Norway</h3>
							<div className="grid md:grid-cols-2 gap-6">
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Street Address <span className="text-red-500">*</span>
									</label>
									<input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Street name and number" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										City <span className="text-red-500">*</span>
									</label>
									<input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Oslo" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Postal Code <span className="text-red-500">*</span>
									</label>
									<input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="XXXX" />
								</div>
							</div>
						</div>

						{/* Professional Information */}
						<div>
							<h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h3>
							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Profession/Occupation</label>
									<input type="text" name="profession" value={formData.profession} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Engineer, Student, Business" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Skills/Expertise</label>
									<input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., IT, Marketing, Legal" />
								</div>
							</div>
						</div>

						{/* Membership Type */}
						<div>
							<h3 className="text-xl font-semibold text-gray-900 mb-4">Membership Type</h3>
							<div className="space-y-3">
								<label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
									<input type="radio" name="membershipType" value="general" checked={formData.membershipType === "general"} onChange={handleChange} className="w-4 h-4 text-blue-600" />
									<div className="ml-3">
										<span className="font-medium text-gray-900">General Member</span>
										<p className="text-sm text-gray-600">Support RSP&apos;s vision and participate in community activities</p>
									</div>
								</label>
								<label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
									<input type="radio" name="membershipType" value="active" checked={formData.membershipType === "active"} onChange={handleChange} className="w-4 h-4 text-blue-600" />
									<div className="ml-3">
										<span className="font-medium text-gray-900">Active Member</span>
										<p className="text-sm text-gray-600">Actively participate in campaigns, events, and policy discussions</p>
									</div>
								</label>
							</div>
						</div>

						{/* Volunteer Interests */}
						<div>
							<h3 className="text-xl font-semibold text-gray-900 mb-4">Areas of Interest (Optional)</h3>
							<div className="grid md:grid-cols-2 gap-3">
								{["Event Organization", "Social Media", "Fundraising", "Policy Research", "Youth Outreach", "Media Relations"].map((interest) => (
									<label key={interest} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
										<input type="checkbox" name="volunteerInterest" value={interest} checked={formData.volunteerInterest.includes(interest)} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
										<span className="ml-3 text-gray-700">{interest}</span>
									</label>
								))}
							</div>
						</div>

						{/* Terms and Conditions */}
						<div className="bg-gray-50 rounded-lg p-6">
							<label className="flex items-start cursor-pointer">
								<input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded mt-1" />
								<span className="ml-3 text-gray-700">
									I agree to the{" "}
									<Link href="/terms" className="text-blue-600 hover:underline">
										Terms and Conditions
									</Link>{" "}
									and{" "}
									<Link href="/privacy-policy" className="text-blue-600 hover:underline">
										Privacy Policy
									</Link>
									. I understand that my information will be used solely for RSP Norway membership purposes.
									<span className="text-red-500"> *</span>
								</span>
							</label>
						</div>

						{/* Submit Button */}
						<div className="flex gap-4">
							<button onClick={handleSubmit} className={`flex-1 bg-brand text-white py-4 px-8 rounded-lg font-semibold hover:bg-brand/90 transition-colors shadow-lg hover:shadow-xl${!formData.agreeTerms ? " opacity-50 cursor-not-allowed" : ""}`} disabled={!formData.agreeTerms}>
								Submit
							</button>
							<button
								onClick={() =>
									setFormData({
										fullName: "",
										email: "",
										phone: "",
										address: "",
										city: "",
										postalCode: "",
										dateOfBirth: "",
										gender: "",
										nepaliOrigin: "",
										profession: "",
										membershipType: "general",
										skills: "",
										volunteerInterest: [],
										agreeTerms: false,
									})
								}
								className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
							>
								Reset
							</button>
						</div>
					</div>
				</div>

				{/* Contact Info */}
				<div className="mt-12 bg-gradient-to-r from-blue-400 to-brand text-white rounded-2xl p-8 text-center">
					<h3 className="text-2xl font-bold mb-4">Need Help?</h3>
					<p className="mb-6">If you have any questions about membership, feel free to contact us.</p>
					<div className="flex flex-wrap justify-center gap-4">
						<a href="mailto:info@rspnorway.org" className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
							<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
							Email Us
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

// function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
// 	return (
// 		<div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
// 			<div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">{icon}</div>
// 			<h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
// 			<p className="text-gray-600">{description}</p>
// 		</div>
// 	);
// }
