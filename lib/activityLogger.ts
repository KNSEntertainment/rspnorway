import ConnectDB from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog.Model";

export interface LogActivityParams {
	userId?: string;
	userName?: string;
	userEmail?: string;
	userRole?: string;
	membershipType?: string;
	action: string;
	category?: "auth" | "navigation" | "profile" | "communication" | "event" | "finance" | "admin" | "system" | "general";
	description: string;
	path?: string;
	pageTitle?: string;
	referrer?: string;
	ipAddress?: string;
	userAgent?: string;
	status?: "success" | "failed" | "warning" | "info";
	metadata?: Record<string, unknown>;
	req?: Request | { headers?: Record<string, string | string[] | undefined> | Headers };
}

/**
 * Lightweight User-Agent parser that identifies Browser, OS, and Device without heavy external dependencies
 */
export function parseUserAgent(ua: string = ""): {
	browser: string;
	os: string;
	device: "desktop" | "mobile" | "tablet" | "unknown";
} {
	if (!ua) {
		return { browser: "Unknown", os: "Unknown", device: "unknown" };
	}

	// const uaLower = ua.toLowerCase();

	// Detect Device
	let device: "desktop" | "mobile" | "tablet" | "unknown" = "desktop";
	if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
		device = "tablet";
	} else if (/mobile|iphone|ipod|android|blackberry|iemobile|kindle|silk|opera mini/i.test(ua)) {
		device = "mobile";
	}

	// Detect Browser
	let browser = "Unknown Browser";
	if (/edg\//i.test(ua)) {
		browser = "Microsoft Edge";
	} else if (/opr\/|opera/i.test(ua)) {
		browser = "Opera";
	} else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua) && !/opr\//i.test(ua)) {
		browser = "Chrome";
	} else if (/firefox|fxios/i.test(ua)) {
		browser = "Firefox";
	} else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
		browser = "Safari";
	} else if (/msie|trident/i.test(ua)) {
		browser = "Internet Explorer";
	}

	// Detect OS
	let os = "Unknown OS";
	if (/windows phone/i.test(ua)) {
		os = "Windows Phone";
	} else if (/win(dows)?/i.test(ua)) {
		if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
		else if (/windows nt 6.3/i.test(ua)) os = "Windows 8.1";
		else if (/windows nt 6.2/i.test(ua)) os = "Windows 8";
		else if (/windows nt 6.1/i.test(ua)) os = "Windows 7";
		else os = "Windows";
	} else if (/iphone|ipad|ipod/i.test(ua)) {
		os = "iOS";
	} else if (/mac os x|macintosh/i.test(ua)) {
		os = "macOS";
	} else if (/android/i.test(ua)) {
		os = "Android";
	} else if (/linux/i.test(ua)) {
		os = "Linux";
	} else if (/cros/i.test(ua)) {
		os = "Chrome OS";
	}

	return { browser, os, device };
}

/**
 * Extract client IP from headers safely
 */
export function getClientIp(headersObj?: Headers | Record<string, string | string[] | undefined> | null): string {
	if (!headersObj) return "";

	let rawIp = "";

	if (typeof (headersObj as Headers).get === "function") {
		const h = headersObj as Headers;
		rawIp = h.get("x-forwarded-for") || h.get("x-real-ip") || h.get("cf-connecting-ip") || h.get("fastly-client-ip") || "";
	} else {
		const h = headersObj as Record<string, string | string[] | undefined>;
		const xForwardedFor = h["x-forwarded-for"];
		const xRealIp = h["x-real-ip"];
		const cfConnectingIp = h["cf-connecting-ip"];

		const headerVal = xForwardedFor || xRealIp || cfConnectingIp;
		if (Array.isArray(headerVal)) {
			rawIp = headerVal[0] || "";
		} else if (typeof headerVal === "string") {
			rawIp = headerVal;
		}
	}

	if (!rawIp) return "";

	// If x-forwarded-for contains multiple IPs (client, proxy1, proxy2), take the first one
	const firstIp = rawIp.split(",")[0]?.trim() || "";

	// Normalize local development IPv6 loopback
	if (firstIp === "::1" || firstIp === "127.0.0.1") {
		return "127.0.0.1 (Localhost)";
	}

	return firstIp;
}

/**
 * Sanitize metadata to guarantee no sensitive credentials or private secrets are ever stored
 */
const SENSITIVE_KEYS = ["password", "passwd", "pass", "pwd", "secret", "token", "bearer", "authorization", "creditcard", "cardnumber", "cvv", "ccv", "pin", "apikey", "api_key", "resettoken", "verificationtoken"];

export function sanitizeMetadata(data: unknown): Record<string, unknown> {
	if (!data || typeof data !== "object") return {};
	if (Array.isArray(data)) return { list: data.slice(0, 10) };

	const cleaned: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
		const lowerKey = key.toLowerCase();
		if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
			cleaned[key] = "[PROTECTED]";
			continue;
		}

		if (value && typeof value === "object" && !Array.isArray(value)) {
			cleaned[key] = sanitizeMetadata(value);
		} else if (Array.isArray(value)) {
			cleaned[key] = value.slice(0, 15);
		} else {
			cleaned[key] = value;
		}
	}

	return cleaned;
}

/**
 * Central activity logger function
 * Asynchronously writes to MongoDB without blocking or crashing the caller
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
	try {
		await ConnectDB();

		let ip = params.ipAddress || "";
		let ua = params.userAgent || "";

		// Extract from req headers if provided
		if (params.req) {
			const reqHeaders = "headers" in params.req ? params.req.headers : undefined;
			if (reqHeaders) {
				if (!ip) ip = getClientIp(reqHeaders);
				if (!ua) {
					if (typeof (reqHeaders as Headers).get === "function") {
						ua = (reqHeaders as Headers).get("user-agent") || "";
					} else {
						const rawUa = (reqHeaders as Record<string, string | string[] | undefined>)["user-agent"];
						ua = Array.isArray(rawUa) ? rawUa[0] || "" : rawUa || "";
					}
				}
			}
		}

		const { browser, os, device } = parseUserAgent(ua);
		const sanitizedMeta = sanitizeMetadata(params.metadata);

		// Normalize role and membership type
		const userRole = (params.userRole || "unknown").toLowerCase();
		let membershipType = (params.membershipType || "").toLowerCase();
		if (!membershipType || membershipType === "undefined") {
			if (userRole === "admin" || userRole === "treasurer") {
				membershipType = "executive";
			} else {
				membershipType = "general";
			}
		}

		await ActivityLog.create({
			userId: params.userId || "",
			userName: params.userName || "Anonymous",
			userEmail: params.userEmail ? params.userEmail.toLowerCase().trim() : "",
			userRole: ["admin", "treasurer", "member", "guest"].includes(userRole) ? userRole : "unknown",
			membershipType: membershipType || "none",
			action: params.action.toUpperCase(),
			category: params.category || "general",
			description: params.description,
			path: params.path || "",
			pageTitle: params.pageTitle || "",
			referrer: params.referrer || "",
			ipAddress: ip,
			userAgent: ua,
			browser,
			os,
			device,
			status: params.status || "success",
			metadata: sanitizedMeta,
		});
	} catch (error) {
		// Never allow a failure in logging to break the main application flow
		console.error("ActivityLogger failed to record log:", error);
	}
}
