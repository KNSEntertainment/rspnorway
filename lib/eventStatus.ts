export function isEventPast(eventDate?: string | null): boolean {
	if (!eventDate) return false;
	const date = new Date(eventDate);
	if (Number.isNaN(date.getTime())) return false;
	return date.getTime() < new Date().setHours(0, 0, 0, 0);
}
