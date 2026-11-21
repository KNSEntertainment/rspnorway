"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ActivityTracker() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { data: session, status } = useSession();

	const lastLoggedPath = useRef<string | null>(null);
	const lastLogTimestamp = useRef<number>(0);

	useEffect(() => {
		// Only track when authenticated and pathname is valid
		if (status !== "authenticated" || !session?.user || !pathname) {
			return;
		}

		// Ignore Next internal and API paths
		if (pathname.includes("/api/") || pathname.includes("_next") || pathname.includes("/favicon.ico")) {
			return;
		}

		const queryString = searchParams?.toString();
		const currentFullPath = queryString ? `${pathname}?${queryString}` : pathname;

		const now = Date.now();
		// Deduplicate if same path visited within 4 seconds
		if (lastLoggedPath.current === currentFullPath && now - lastLogTimestamp.current < 4000) {
			return;
		}

		lastLoggedPath.current = currentFullPath;
		lastLogTimestamp.current = now;

		const timer = setTimeout(() => {
			try {
				const payload = JSON.stringify({
					path: currentFullPath,
					pageTitle: typeof document !== "undefined" ? document.title : "",
					referrer: typeof document !== "undefined" ? document.referrer : "",
				});

				if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
					const blob = new Blob([payload], { type: "application/json" });
					navigator.sendBeacon("/api/logs/track-page", blob);
				} else {
					fetch("/api/logs/track-page", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: payload,
						keepalive: true,
					}).catch(() => {});
				}
			} catch {
				// Silently fail - tracking should never affect user experience
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [pathname, searchParams, session, status]);

	return null;
}
