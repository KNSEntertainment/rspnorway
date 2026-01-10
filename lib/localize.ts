export function localize(field: Map<string, string> | undefined, locale: string, fallback = "en") {
	if (!field) return "";
	return field.get(locale) || field.get(fallback) || "";
}
