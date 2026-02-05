"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

// Configure NProgress
NProgress.configure({
	showSpinner: false,
	trickleSpeed: 200,
	minimum: 0.08,
});

export default function ProgressBar() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		// Start the progress bar
		NProgress.start();
		// Complete the progress bar after a short delay
		const timer = setTimeout(() => {
			NProgress.done();
		}, 100);

		return () => {
			clearTimeout(timer);
			NProgress.done();
		};
	}, [pathname, searchParams]);

	return null;
}
