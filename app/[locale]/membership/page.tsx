"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

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

	const t = useTranslations("membership");

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
			<div className="container mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
					<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">{t("welcome")}</h2>
					<p className="text-gray-700 mb-6">{t("welcome_msg")}</p>
					<button onClick={() => setSubmitted(false)} className="bg-brand text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
						{t("submit_another")}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="md:px-4 py-12">
			{/* Membership Form */}
			<div className="bg-white  md:shadow-md p-8 md:p-12">
				<div className="flex flex-col items-center justify-center">
					<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t("title")}</h2>
					<p className="text-gray-600 mb-8"> {t("subtitle")}</p>
				</div>

				<div className="space-y-6">
					{/* Personal Information */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t("personal_info")}</h3>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("full_name")} <span className="text-red-500">*</span>
								</label>
								<input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t("full_name_placeholder")} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("email_address")} <span className="text-red-500">*</span>
								</label>
								<input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleEmailBlur} className={`w-full px-4 py-2 border ${emailError ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder={t("email_address_placeholder")} />
								{emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("phone_number")} <span className="text-red-500">*</span>
								</label>
								<input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t("phone_number_placeholder")} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("date_of_birth")} <span className="text-red-500">*</span>
								</label>
								<input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("gender")} <span className="text-red-500">*</span>
								</label>
								<select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
									<option value="">{t("select_gender")}</option>
									<option value="male">{t("male")}</option>
									<option value="female">{t("female")}</option>
									<option value="other">{t("other")}</option>
									<option value="prefer-not-to-say">{t("prefer_not_to_say")}</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("address_nepal")}</label>
								<input type="text" name="nepaliOrigin" value={formData.nepaliOrigin} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t("address_nepal_ph")} />
							</div>
						</div>
					</div>

					{/* Address in Norway */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t("address_norway")}</h3>
						<div className="grid md:grid-cols-2 gap-6">
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("street_address")} <span className="text-red-500">*</span>
								</label>
								<input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t("street_address_ph")} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("city")} <span className="text-red-500">*</span>
								</label>
								<input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t("city_ph")} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("postal_code")} <span className="text-red-500">*</span>
								</label>
								<input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t("postal_code_ph")} />
							</div>
						</div>
					</div>

					{/* Professional Information */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t("professional_info")}</h3>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("occupation")}</label>
								<input type="text" name="profession" value={formData.profession} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t("occupation_ph")} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("skills_expertise")}</label>
								<input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t("skills_expertise_ph")} />
							</div>
						</div>
					</div>

					{/* Membership Type */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t("membership_type")}</h3>
						<div className="space-y-3">
							<label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
								<input type="radio" name="membershipType" value="general" checked={formData.membershipType === "general"} onChange={handleChange} className="w-4 h-4 text-blue-600" />
								<div className="ml-3">
									<span className="font-medium text-gray-900">{t("general_member")}</span>
									<p className="text-sm text-gray-600">{t("general_member_desc")}</p>
								</div>
							</label>
							<label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
								<input type="radio" name="membershipType" value="active" checked={formData.membershipType === "active"} onChange={handleChange} className="w-4 h-4 text-blue-600" />
								<div className="ml-3">
									<span className="font-medium text-gray-900">{t("active_member")}</span>
									<p className="text-sm text-gray-600">{t("active_member_desc")}</p>
								</div>
							</label>
						</div>
					</div>

					{/* Volunteer Interests */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t("areas_of_interests")}</h3>
						<div className="grid md:grid-cols-2 gap-3">
							{[t("interest_politics"), t("interest_social"), t("interest_education"), t("interest_culture"), t("interest_events"), t("interest_fundraising")].map((interest) => (
								<label key={interest} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
									<input type="checkbox" name="volunteerInterest" value={interest} checked={formData.volunteerInterest.includes(interest)} onChange={handleChange} className="w-4 h-4 text-brand rounded" />
									<span className="ml-3 text-gray-700">{interest}</span>
								</label>
							))}
						</div>
					</div>

					{/* Terms and Conditions */}
					<div className="bg-gray-50 rounded-lg p-2 md:p-6">
						<label className="flex items-start cursor-pointer">
							<input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded mt-1" />
							<span className="ml-2 md:ml-3 text-gray-700">
								{/* I agree to the{" "}
									<Link href="/terms" className="text-blue-600 hover:underline">
										Terms and Conditions
									</Link>{" "}
									and{" "}
									<Link href="/privacy-policy" className="text-blue-600 hover:underline">
										Privacy Policy
									</Link>
									. I understand that my information will be used solely for RSP Norway membership purposes.
									<span className="text-red-500"> *</span> */}
								{t("agree_terms")} <span className="text-red-500"> *</span>
							</span>
						</label>
					</div>

					{/* Submit Button */}
					<div className="flex gap-4">
						<button onClick={handleSubmit} className={`flex-1 bg-brand text-white py-2 md:py-4 px-6 md:px-8 rounded-lg font-semibold hover:bg-brand/90 transition-colors shadow-lg hover:shadow-xl${!formData.agreeTerms ? " opacity-50 cursor-not-allowed" : ""}`} disabled={!formData.agreeTerms}>
							{t("submit")}
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
							className="px-6 md:px-8 py-2 md:py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
						>
							{t("reset")}
						</button>
					</div>
				</div>
			</div>

			{/* Contact Info */}
			<div className="mt-12 bg-gradient-to-r from-blue-400 to-brand text-white p-8 text-center">
				<h3 className="text-2xl font-bold mb-4">{t("need_help")}</h3>
				<p className="mb-6 font-medium text-lg">{t("contact_us_any_questions")}</p>
				<div className="flex flex-wrap justify-center gap-4">
					<a href="mailto:info@rspnorway.org" className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						{t("email_us")}
					</a>
				</div>
			</div>
		</div>
	);
}
