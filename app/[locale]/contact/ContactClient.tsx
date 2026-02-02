// "use client";
// import { Mail, MapPin, Phone } from "lucide-react";
// import React, { useState } from "react";
// import SectionHeader from "@/components/SectionHeader";

// type Setting = {
// 	_id?: string;
// 	address?: string;
// 	phone?: string;
// 	email?: string;
// };

// interface Translations {
// 	title: string;
// 	subtitle: string;
// 	description: string;
// 	form: {
// 		name: string;
// 		name_placeholder: string;
// 		email: string;
// 		email_placeholder: string;
// 		message: string;
// 		message_placeholder: string;
// 		send: string;
// 		sending: string;
// 	};
// 	success: string;
// 	error: string;
// 	info: {
// 		title: string;
// 		address: string;
// 		phone: string;
// 		email: string;
// 	};
// }

// interface Props {
// 	settings: Setting[];
// 	translations: Translations;
// }

// export default function ContactPageClient({ settings, translations: t }: Props) {
// 	const [form, setForm] = useState({ name: "", email: "", message: "" });
// 	const [success, setSuccess] = useState("");
// 	const [error, setError] = useState("");
// 	const [submitting, setSubmitting] = useState(false);

// 	const typedSettings = settings;

// 	function handleChange(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) {
// 		setForm({ ...form, [e.target.name]: e.target.value });
// 	}

// 	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
// 		e.preventDefault();
// 		setSuccess("");
// 		setError("");
// 		setSubmitting(true);
// 		try {
// 			const res = await fetch("/api/contact", {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify(form),
// 			});
// 			const data = await res.json();
// 			if (res.ok) {
// 				setSuccess("Your message has been sent! We will get back to you soon.");
// 				setForm({ name: "", email: "", message: "" });
// 			} else {
// 				setError(data.error || "Failed to send message.");
// 			}
// 		} catch (err) {
// 			if (err instanceof Error) {
// 				setError("Failed to send message. " + err.message);
// 			} else {
// 				setError("Failed to send message.");
// 			}
// 		}
// 		setSubmitting(false);
// 	}

// 	return (
// 		<main>
// 			<section aria-labelledby="contact-heading">
// 				{/*
// 				NOTE: Check all color combinations (e.g., .bg-brand/5, .text-brand, .text-gray-600) for sufficient contrast using a tool like WebAIM Contrast Checker or Lighthouse.
// 				Adjust Tailwind config or color classes if needed for accessibility.
// 			*/}
// 				<h1 id="contact-heading" className="sr-only">
// 					{t.title}
// 				</h1>
// 				<SectionHeader heading={t.title} />
// 				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 -mt-6 md:-mt-0 gap-8">
// 					<div className="bg-white lg:col-span-2 shadow-xl rounded-lg p-8 w-full">
// 						<h2 className="text-lg md:text-2xl font-bold text-center mb-2 md:mb-4 text-brand">{t.subtitle}</h2>
// 						<p className="text-center text-gray-600 mb-8">{t.description}</p>
// 						<form onSubmit={handleSubmit} className="space-y-6" aria-label="Contact form">
// 							<div>
// 								<label htmlFor="name" className="block text-sm font-medium text-gray-700">
// 									{t.form.name}
// 								</label>
// 								<input id="name" type="text" name="name" value={form.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 bg-white/80 shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 text-gray-800 placeholder-gray-400" placeholder={t.form.name_placeholder} autoComplete="name" aria-required="true" />
// 							</div>
// 							<div>
// 								<label htmlFor="email" className="block text-sm font-medium text-gray-700">
// 									{t.form.email}
// 								</label>
// 								<input id="email" type="email" name="email" value={form.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 bg-white/80 shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 text-gray-800 placeholder-gray-400" placeholder={t.form.email_placeholder} autoComplete="email" aria-required="true" />
// 							</div>
// 							<div>
// 								<label htmlFor="message" className="block text-sm font-medium text-gray-700">
// 									{t.form.message}
// 								</label>
// 								<textarea id="message" name="message" value={form.message} onChange={handleChange} required rows={5} className="mt-1 block w-full rounded-md border border-gray-300 bg-white/80 shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 text-gray-800 placeholder-gray-400" placeholder={t.form.message_placeholder} aria-required="true" />
// 							</div>
// 							<button type="submit" className="w-full py-3 px-6 bg-brand text-white font-semibold rounded-md shadow hover:bg-brand/90 transition-colors" disabled={submitting} aria-busy={submitting}>
// 								{submitting ? t.form.sending : t.form.send}
// 							</button>
// 							{success && (
// 								<p className="text-green-600 text-center mt-2" role="status" aria-live="polite">
// 									{t.success}
// 								</p>
// 							)}
// 							{error && (
// 								<p className="text-red-600 text-center mt-2" role="alert" aria-live="assertive">
// 									{t.error}
// 								</p>
// 							)}
// 						</form>
// 					</div>
// 					<aside className="bg-brand/5 rounded-lg p-8 w-full grid" aria-labelledby="contact-info-heading">
// 						<div className="row-span-1 mb-2 md:mb-0">
// 							<h3 id="contact-info-heading" className="text-2xl font-bold text-brand">
// 								{t.info.title}
// 							</h3>
// 						</div>
// 						<div className="row-span-1 mb-2 md:mb-0 flex items-start gap-4">
// 							<MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-1" aria-hidden="true" />
// 							<div>
// 								<p className="font-semibold text-gray-900 mb-1">{t.info.address}</p>
// 								<address className="text-gray-700 not-italic">{typedSettings?.[0]?.address}</address>
// 							</div>
// 						</div>
// 						<div className="row-span-1 mb-2 md:mb-0 flex items-start gap-4">
// 							<Phone className="w-5 h-5 text-brand flex-shrink-0 mt-1" aria-hidden="true" />
// 							<div>
// 								<p className="font-semibold text-gray-900 mb-1">{t.info.phone}</p>
// 								<a className="text-gray-700 underline" href={`tel:${typedSettings?.[0]?.phone}`}>
// 									{typedSettings?.[0]?.phone}
// 								</a>
// 							</div>
// 						</div>
// 						<div className="row-span-1 flex items-start gap-4">
// 							<Mail className="w-5 h-5 text-brand flex-shrink-0 mt-1" aria-hidden="true" />
// 							<div>
// 								<p className="font-semibold text-gray-900 mb-1">{t.info.email}</p>
// 								<a className="text-gray-700 underline" href={`mailto:${typedSettings?.[0]?.email}`}>
// 									{typedSettings?.[0]?.email}
// 								</a>
// 							</div>
// 						</div>
// 					</aside>
// 				</div>
// 			</section>
// 		</main>
// 	);
// }

"use client";
import { Mail, MapPin, Phone, Send, CheckCircle, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import SectionHeader from "@/components/SectionHeader";

type Setting = {
	_id?: string;
	address?: string;
	phone?: string;
	email?: string;
};

interface Translations {
	title: string;
	subtitle: string;
	description: string;
	form: {
		name: string;
		name_placeholder: string;
		email: string;
		email_placeholder: string;
		message: string;
		message_placeholder: string;
		send: string;
		sending: string;
	};
	success: string;
	error: string;
	info: {
		title: string;
		address: string;
		phone: string;
		email: string;
	};
}

interface Props {
	settings: Setting[];
	translations: Translations;
}
export default function ContactPageClient({ settings, translations: t }: Props) {
	const [form, setForm] = useState({ name: "", email: "", message: "" });
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const setting = settings?.[0] || {};

	function handleChange(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) {
		setForm({ ...form, [e.target.name]: e.target.value });
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSuccess("");
		setError("");
		setSubmitting(true);
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			if (res.ok) {
				setSuccess(t.success);
				setForm({ name: "", email: "", message: "" });
			} else {
				setError(t.error);
			}
		} catch (err) {
			setError(t.error);
		}
		setSubmitting(false);
	}

	return (
		<main className="bg-slate-50 py-16">
			<div className="container mx-auto px-4 max-w-7xl">
				<header className="text-center mb-12">
					<SectionHeader heading={t.title} />
					<p className="text-slate-600 mt-4 text-lg max-w-2xl mx-auto">{t.description}</p>
				</header>

				<div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-200">
					{/* Left: Contact Information (The "Official" Sidebar) */}
					<aside className="lg:w-1/3 bg-blue-900 p-8 md:p-12 text-white relative overflow-hidden">
						{/* Decorative Circle */}
						<div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-800 rounded-full opacity-50" />

						<div className="relative z-10">
							<h3 className="text-3xl font-bold mb-8">{t.info.title}</h3>

							<div className="space-y-8">
								<div className="flex gap-5 group">
									<div className="bg-blue-800 p-3 rounded-xl group-hover:bg-blue-700 transition-colors">
										<MapPin className="w-6 h-6 text-blue-200" />
									</div>
									<div>
										<p className="text-blue-300 text-sm font-bold uppercase tracking-wider">{t.info.address}</p>
										<address className="not-italic text-lg text-white mt-1">{setting.address}</address>
									</div>
								</div>

								<div className="flex gap-5 group">
									<div className="bg-blue-800 p-3 rounded-xl group-hover:bg-blue-700 transition-colors">
										<Phone className="w-6 h-6 text-blue-200" />
									</div>
									<div>
										<p className="text-blue-300 text-sm font-bold uppercase tracking-wider">{t.info.phone}</p>
										<a href={`tel:${setting.phone}`} className="text-lg text-white hover:text-blue-200 transition-colors">
											{setting.phone}
										</a>
									</div>
								</div>

								<div className="flex gap-5 group">
									<div className="bg-blue-800 p-3 rounded-xl group-hover:bg-blue-700 transition-colors">
										<Mail className="w-6 h-6 text-blue-200" />
									</div>
									<div>
										<p className="text-blue-300 text-sm font-bold uppercase tracking-wider">{t.info.email}</p>
										<a href={`mailto:${setting.email}`} className="text-lg text-white hover:text-blue-200 transition-colors block break-words">
											{setting.email}
										</a>
									</div>
								</div>
							</div>
						</div>
					</aside>

					{/* Right: Contact Form */}
					<div className="lg:w-2/3 p-8 md:p-12 bg-white">
						<h2 className="text-2xl font-bold text-slate-800 mb-8">{t.subtitle}</h2>

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label htmlFor="name" className="text-sm font-bold text-slate-700">
										{t.form.name}
									</label>
									<input id="name" name="name" type="text" value={form.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all" placeholder={t.form.name_placeholder} />
								</div>
								<div className="space-y-2">
									<label htmlFor="email" className="text-sm font-bold text-slate-700">
										{t.form.email}
									</label>
									<input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all" placeholder={t.form.email_placeholder} />
								</div>
							</div>

							<div className="space-y-2">
								<label htmlFor="message" className="text-sm font-bold text-slate-700">
									{t.form.message}
								</label>
								<textarea id="message" name="message" value={form.message} onChange={handleChange} required rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all resize-none" placeholder={t.form.message_placeholder} />
							</div>

							<button type="submit" disabled={submitting} className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
								{submitting ? (
									t.form.sending
								) : (
									<>
										{t.form.send}
										<Send className="w-4 h-4" />
									</>
								)}
							</button>

							{/* Status Messages */}
							{success && (
								<div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl animate-in fade-in slide-in-from-top-2">
									<CheckCircle className="w-5 h-5" />
									<p className="text-sm font-medium">{success}</p>
								</div>
							)}
							{error && (
								<div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-in fade-in slide-in-from-top-2">
									<AlertCircle className="w-5 h-5" />
									<p className="text-sm font-medium">{error}</p>
								</div>
							)}
						</form>
					</div>
				</div>
			</div>
		</main>
	);
}
