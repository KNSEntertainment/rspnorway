export function localize(field: Map<string, string> | Record<string, string> | undefined, locale: string, fallback = "en") {
	if (!field) return "";

	// Handle Map objects
	if (field instanceof Map) {
		return field.get(locale) || field.get(fallback) || "";
	}

	// Handle plain objects (from JSON/API responses)
	return field[locale] || field[fallback] || "";
}
