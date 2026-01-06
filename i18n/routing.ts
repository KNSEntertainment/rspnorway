import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["en", "no", "ne"],
	defaultLocale: "en",
	localePrefix: "as-needed", // URLs will be /about, /en/about, /no/about, etc
});
