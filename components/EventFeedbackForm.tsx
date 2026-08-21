"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FeedbackRichTextInput from "@/components/FeedbackRichTextInput";

interface EventFeedbackFormProps {
	eventId: string;
	/** Skip the card wrapper + heading, for use inside a page that already provides its own context/heading. */
	compact?: boolean;
}

export default function EventFeedbackForm({ eventId, compact = false }: EventFeedbackFormProps) {
	const locale = useLocale();
	const t = useTranslations("eventFeedback");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!name.trim()) {
			setError(t("nameRequiredError"));
			return;
		}

		setSubmitting(true);
		try {
			const res = await fetch("/api/events/feedback", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ eventId, name, email, message, locale }),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || t("submitError"));
			}
			setSubmitted(true);
			setName("");
			setEmail("");
			setMessage("");
		} catch (err) {
			setError(err instanceof Error ? err.message : t("submitError"));
		} finally {
			setSubmitting(false);
		}
	};

	if (submitted) {
		const content = (
			<div className="flex flex-col items-center text-center gap-2 py-4">
				<CheckCircle className="w-10 h-10 text-green-600" />
				<h3 className="text-lg font-bold text-gray-900">{t("thankYouTitle")}</h3>
				<p className="text-gray-600 text-sm">{t("thankYouSubtitle")}</p>
				<Button variant="outline" onClick={() => setSubmitted(false)} className="mt-2">
					{t("submitAnother")}
				</Button>
			</div>
		);
		return compact ? content : <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-100">{content}</div>;
	}

	const form = (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid sm:grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label htmlFor="feedback-name">{t("nameLabel")}</Label>
					<Input id="feedback-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} required />
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="feedback-email">{t("emailLabel")}</Label>
					<Input id="feedback-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} />
				</div>
			</div>

			<div className="space-y-1.5">
				<Label>{t("messageLabel")}</Label>
				<FeedbackRichTextInput value={message} onChange={setMessage} placeholder={t("messagePlaceholder")} />
			</div>

			{error && <p className="text-sm text-red-600">{error}</p>}

			<Button type="submit" disabled={submitting} className="bg-brand hover:bg-brand/90">
				{submitting ? t("submitting") : t("submit")}
			</Button>
		</form>
	);

	if (compact) return form;

	return (
		<div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-100">
			<div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
				<div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
					<MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
				</div>
				<h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("formHeading")}</h2>
			</div>
			<p className="text-gray-600 text-sm mb-4">{t("formSubtitle")}</p>
			{form}
		</div>
	);
}
