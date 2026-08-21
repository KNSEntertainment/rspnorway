import sanitizeHtml from "sanitize-html";

export function sanitizeFeedbackHtml(html: string): string {
	return sanitizeHtml(html, {
		allowedTags: ["p", "br", "strong", "b", "em", "i"],
		allowedAttributes: {},
	});
}

export function feedbackTextLength(html: string): number {
	return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim().length;
}
