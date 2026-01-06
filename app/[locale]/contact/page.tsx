"use client";

import { useLoading } from "@/context/LoadingContext";
import useFetchData from "@/hooks/useFetchData";
import { Mail, MapPin, Phone } from "lucide-react";
import React, { useState } from "react";

type Setting = {
	address?: string;
	phone?: string;
	email?: string;
	// add other fields if needed
};

export default function ContactPage() {
	const [form, setForm] = useState({ name: "", email: "", message: "" });
	const { isLoading, setLoading } = useLoading();
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");

	const { data: settings } = useFetchData("/api/settings", "settings");
	const typedSettings = settings as Setting[] | undefined;

	function handleChange(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) {
		setForm({ ...form, [e.target.name]: e.target.value });
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setSuccess("");
		setError("");
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (res.ok) {
				setSuccess("Your message has been sent! We will get back to you soon.");
				setForm({ name: "", email: "", message: "" });
			} else {
				setError(data.error || "Failed to send message.");
			}
		} catch (err) {
			if (err instanceof Error) {
				setError("Failed to send message. " + err.message);
			} else {
				setError("Failed to send message.");
			}
		}
		setLoading(false);
	}

	return (
		<section className="container min-h-screen mt-20 md:mt-24 mx-auto px-4 py-12 md:py-16 mb-16">
			<h2 className="text-3xl text-center font-bold mb-6">
				Contact <span className="mx-auto text-[#0094da]">Us</span>
			</h2>
			<div className="w-24 h-1 mx-auto bg-[#0094da] md:mb-12 rounded-full"></div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-5xl">
				<div className="bg-white lg:col-span-2 shadow-xl rounded-lg p-8 w-full">
					<h1 className="text-lg md:text-3xl font-bold text-center mb-2 md:mb-4 text-brand">We&apos;d love to hear from you!</h1>
					<p className="text-center text-gray-600 mb-8"> Fill out the form below and we&apos;ll respond as soon as possible.</p>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700">Name</label>
							<input type="text" name="name" value={form.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 bg-white/80 shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 text-gray-800 placeholder-gray-400" placeholder="Your Name" />
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Email</label>
							<input type="email" name="email" value={form.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 bg-white/80 shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 text-gray-800 placeholder-gray-400" placeholder="you@email.com" />
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Message</label>
							<textarea name="message" value={form.message} onChange={handleChange} required rows={5} className="mt-1 block w-full rounded-md border border-gray-300 bg-white/80 shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none px-4 py-2 text-gray-800 placeholder-gray-400" placeholder="Type your message here..." />
						</div>
						<button type="submit" disabled={isLoading} className="w-full py-3 px-6 bg-brand text-white font-semibold rounded-md shadow hover:bg-brand/90 transition-colors">
							{isLoading ? "Sending..." : "Send Message"}
						</button>
						{success && <p className="text-green-600 text-center mt-2">{success}</p>}
						{error && <p className="text-red-600 text-center mt-2">{error}</p>}
					</form>
				</div>
				<div className="bg-brand/5 rounded-lg p-8 w-full grid">
					<div className="row-span-1 mb-2 md:mb-0">
						<h3 className="text-2xl font-bold text-brand">Contact Information</h3>
					</div>

					<div className="row-span-1 mb-2 md:mb-0 flex items-start gap-4">
						<MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
						<div>
							<p className="font-semibold text-gray-900 mb-1">Visiting Address</p>
							{/* <p className="text-gray-700">{settings?.[0]?.address}</p> */}
							<p className="text-gray-700">{typedSettings?.[0]?.address}</p>
						</div>
					</div>

					<div className="row-span-1 mb-2 md:mb-0 flex items-start gap-4">
						<Phone className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
						<div>
							<p className="font-semibold text-gray-900 mb-1">Phone Numbers</p>
							{/* <p className="text-gray-700">{settings?.[0]?.phone}</p> */}
							<p className="text-gray-700">{typedSettings?.[0]?.phone}</p>
						</div>
					</div>

					<div className="row-span-1 flex items-start gap-4">
						<Mail className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
						<div>
							<p className="font-semibold text-gray-900 mb-1">Email</p>
							{/* <p className="text-gray-700">{settings?.[0]?.email}</p> */}
							<p className="text-gray-700 underline">
								<a href={`mailto:${typedSettings?.[0]?.email}`}>{typedSettings?.[0]?.email}</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
