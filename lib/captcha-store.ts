// Store captcha data in memory (in production, use Redis or database)
const captchaStore = new Map<string, { text: string; expires: number }>();

// Clean up expired captchas
setInterval(() => {
	const now = Date.now();
	for (const [id, data] of captchaStore.entries()) {
		if (data.expires < now) {
			captchaStore.delete(id);
		}
	}
}, 60000); // Clean every minute

export { captchaStore };
