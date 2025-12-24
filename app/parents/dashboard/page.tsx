"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, MessageSquare, X, Image as ImageIcon, Info, CalendarDays, Bell, ChevronLeft, UserCheck } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import AppointmentModal from "./appointment-modal";

// Hardcoded data moved or removed in favor of dynamic state

type Assignment = {
	_id: string;
	title: string;
	description?: string;
	dueDate?: string;
	classGroup?: string;
	status?: string;
	[key: string]: any;
};
type MealKey = "breakfast" | "lunch" | "snack";
type MealItem = { title: string; detail: string };
type MealPlanDay = { day: string } & Record<MealKey, MealItem>;

const mealSlots: { key: MealKey; label: string }[] = [
	{ key: "breakfast", label: "Breakfast" },
	{ key: "lunch", label: "Lunch" },
	{ key: "snack", label: "Afternoon Snack" },
];

const mealPlan: MealPlanDay[] = [
	{
		day: "Monday",
		breakfast: { title: "Oatmeal with berries", detail: "Low sugar, served with milk." },
		lunch: { title: "Grilled chicken, brown rice, veggies", detail: "Includes fruit cup and water." },
		snack: { title: "Yogurt & apple slices", detail: "Nut-free option." },
	},
	{
		day: "Tuesday",
		breakfast: { title: "Scrambled eggs & toast", detail: "Whole grain toast with seasonal fruit." },
		lunch: { title: "Veggie pasta with marinara", detail: "Topped with parmesan, side salad." },
		snack: { title: "Cheese cubes & crackers", detail: "Served with cucumber sticks." },
	},
	{
		day: "Wednesday",
		breakfast: { title: "Banana pancakes", detail: "Made with whole wheat, served with milk." },
		lunch: { title: "Baked fish, quinoa, broccoli", detail: "Lemon dressing on the side." },
		snack: { title: "Hummus & carrot sticks", detail: "Nut-free dip." },
	},
	{
		day: "Thursday",
		breakfast: { title: "Greek yogurt parfait", detail: "Granola and mixed berries." },
		lunch: { title: "Turkey sandwich on wheat", detail: "Lettuce, tomato, and veggie soup." },
		snack: { title: "Trail mix (seed-based)", detail: "Includes raisins and pretzels." },
	},
	{
		day: "Friday",
		breakfast: { title: "Spinach & cheese omelette", detail: "Served with whole fruit." },
		lunch: { title: "Veggie fried rice", detail: "Peas, carrots, egg; low sodium." },
		snack: { title: "Banana bread slice", detail: "Whole grain, low sugar." },
	},
];

const GALLERY_PAGE_SIZE = 8;

function toEventDateParts(date?: string): { month: string; day: string } {
	if (!date) return { month: "TBA", day: "" };
	const parsed = new Date(date);
	if (!Number.isNaN(parsed.getTime())) {
		return {
			month: parsed.toLocaleString("en-US", { month: "short" }).toUpperCase(),
			day: parsed.getDate().toString().padStart(2, "0"),
		};
	}
	return { month: date, day: "" };
}

function formatDateTime(value?: string | Date) {
	if (!value) return "";
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
}

type GalleryItem = {
	id: string;
	url: string;
	alt?: string;
	category?: string;
	classId?: string;
	classLabel?: string;
};

const sections = [
	// Assignment type for TS

	{ key: "dashboard", label: "Dashboard" },
	{ key: "children", label: "Child Info" },
	{ key: "notices", label: "Notices" },
	{ key: "messages", label: "Messages" },
	{ key: "assignments", label: "Assignments" },
	{ key: "meals", label: "School Meals" },
	{ key: "events", label: "Events" },
	{ key: "gallery", label: "Gallery" },
	{ key: "meetings", label: "Appointments" },
];

function ParentsDashboardPageContent() {
	const [active, setActive] = useState<string>("dashboard");
	const activeLabel = useMemo(() => sections.find((s) => s.key === active)?.label || "Dashboard", [active]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [children, setChildren] = useState<any[]>([]);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [loadingAssignments, setLoadingAssignments] = useState(false);
	const [assignmentsError, setAssignmentsError] = useState("");
	const router = useRouter();
	const searchParams = useSearchParams();
	const studentIdParam = searchParams.get("studentId");

	const redirectToLogin = useCallback(
		(setter?: (msg: string) => void) => {
			setter?.("Session expired. Redirecting to login...");
			if (typeof window !== "undefined") {
				window.location.href = "/user";
			} else {
				router.replace("/user");
			}
		},
		[router]
	);
	// Fetch assignments when assignments tab is active
	useEffect(() => {
		if (active !== "assignments") return;
		let ignore = false;
		const loadAssignments = async () => {
			setLoadingAssignments(true);
			setAssignmentsError("");
			try {
				const res = await fetch("/api/assignments");
				if (res.status === 401) {
					if (!ignore) redirectToLogin(setAssignmentsError);
					return;
				}
				const data = await res.json();
				if (!res.ok || !data?.success || !Array.isArray(data.assignments)) {
					throw new Error(data?.error || "Unable to load assignments");
				}
				if (!ignore) {
					setAssignments(data.assignments);
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load assignments";
				if (!ignore) setAssignmentsError(message);
			} finally {
				if (!ignore) setLoadingAssignments(false);
			}
		};
		loadAssignments();
		return () => {
			ignore = true;
		};
	}, [active, redirectToLogin]);

	const [loadingChildren, setLoadingChildren] = useState(false);
	const [childrenError, setChildrenError] = useState("");
	const [noticesData, setNoticesData] = useState<{ id: string; title: string; date: string; body: string; image?: string; classGroup?: string }[]>([]);
	const [noticeSearch, setNoticeSearch] = useState("");
	const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
	const [loadingNotices, setLoadingNotices] = useState(false);
	const [noticesError, setNoticesError] = useState("");
	const [eventsData, setEventsData] = useState<{ id: string; title: string; date?: string; venue?: string; description?: string; classLabel?: string }[]>([]);
	const [loadingEvents, setLoadingEvents] = useState(false);
	const [eventsError, setEventsError] = useState("");
	const [galleryMedia, setGalleryMedia] = useState<GalleryItem[]>([]);
	// const [galleryCategories, setGalleryCategories] = useState<string[]>([]);
	const [activeGalleryFilter, setActiveGalleryFilter] = useState<string>("All");
	const [galleryPage, setGalleryPage] = useState(1);
	const [loadingGallery, setLoadingGallery] = useState(false);
	const [galleryError, setGalleryError] = useState("");
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [messages, setMessages] = useState<any[]>([]);
	const [messagesLoading, setMessagesLoading] = useState(false);
	const [messagesError, setMessagesError] = useState("");
	const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
	const [replyBody, setReplyBody] = useState("");
	const [creatingMessage, setCreatingMessage] = useState(false);
	const [showNewMessageForm, setShowNewMessageForm] = useState(false);
	const [newMessageForm, setNewMessageForm] = useState({ studentId: "", priority: "normal", topic: "", message: "" });

	// Appointments
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [appointments, setAppointments] = useState<any[]>([]);
	const [loadingAppointments, setLoadingAppointments] = useState(false);
	const [showAppointmentModal, setShowAppointmentModal] = useState(false);
	const [appointmentAction, setAppointmentAction] = useState<{ type: "accept" | "reject" | "complete" | null; id: string | null }>({ type: null, id: null });
	const [appointmentForm, setAppointmentForm] = useState({ reason: "" });
	const [submittingAppointment, setSubmittingAppointment] = useState(false);

	const formatResourceLabel = useCallback((r: any) => {
		if (!r) return "Resource";
		const raw = typeof r === "string" ? r : r.label || r.url || "";
		if (!raw) return "Resource";

		// If it's a short, specific label (not a path/URL), keep it
		if (typeof r !== "string" && r.label && r.label.length < 40 && !r.label.includes("/") && !r.label.startsWith("http")) {
			return r.label;
		}

		// Try to extract filename from URL or path
		try {
			const decoded = decodeURIComponent(raw);
			const parts = decoded.split("/");
			const name = parts[parts.length - 1].split("?")[0]; // remove query params
			if (name && name.length > 0 && !name.startsWith("http")) {
				// If it looks like a Cloudinary public ID with folders, we already have the last part
				// If it's too long, truncate it
				return name.length > 40 ? name.substring(0, 37) + "..." : name;
			}
		} catch (e) {
			console.error("Error decoding resource label:", e);
		}

		return raw.length > 40 ? raw.substring(0, 37) + "..." : raw;
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const normalizeMessageThread = useCallback((msg: any) => {
		const parentName = `${msg.firstName || ""} ${msg.lastName || ""} `.trim() || "Parent";
		const baseThread = Array.isArray(msg.messages) ? [...msg.messages] : [];
		if (!baseThread.length && msg.message) {
			baseThread.push({ senderType: "parent", senderName: parentName, body: msg.message, via: "contact-form", createdAt: msg.createdAt || new Date().toISOString() });
		}
		const lastMessageAt = msg.lastMessageAt || (baseThread.length ? baseThread[baseThread.length - 1]?.createdAt : msg.createdAt) || new Date().toISOString();
		return { ...msg, messages: baseThread, lastMessageAt };
	}, []);

	const fetchMessages = useCallback(() => {
		let ignore = false;
		const load = async () => {
			setMessagesLoading(true);
			setMessagesError("");
			try {
				const res = await fetch("/api/messages");
				if (res.status === 401) {
					if (!ignore) redirectToLogin(setMessagesError);
					return;
				}
				const data = await res.json();
				if (!res.ok || !data?.success || !Array.isArray(data.messages)) {
					throw new Error(data?.error || "Unable to load messages");
				}
				if (!ignore) {
					const normalized = data.messages.map((m: any) => normalizeMessageThread(m)).sort((a: any, b: any) => new Date(b.lastMessageAt || b.createdAt || 0).getTime() - new Date(a.lastMessageAt || a.createdAt || 0).getTime());
					setMessages(normalized);
					setSelectedMessageId((prev) => {
						if (prev && normalized.some((m: any) => (m._id || m.id) === prev)) return prev;
						return normalized.length ? normalized[0]._id || normalized[0].id || null : null;
					});
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load messages";
				if (!ignore) setMessagesError(message);
			} finally {
				if (!ignore) setMessagesLoading(false);
			}
		};
		load();
		return () => {
			ignore = true;
		};
	}, [normalizeMessageThread, redirectToLogin]);

	const fetchChildren = useCallback(() => {
		let ignore = false;
		const load = async () => {
			setLoadingChildren(true);
			setChildrenError("");
			try {
				const res = await fetch("/api/auth/me");
				if (res.status === 401) {
					if (!ignore) redirectToLogin(setChildrenError);
					return;
				}
				const data = await res.json();
				if (!res.ok || !data?.user) {
					throw new Error(data?.error || "Unable to load children");
				}
				if (!ignore) {
					setChildren(Array.isArray(data.user.children) ? data.user.children : []);
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load children";
				if (!ignore) {
					setChildrenError(message);
				}
			} finally {
				if (!ignore) setLoadingChildren(false);
			}
		};
		load();
		return () => {
			ignore = true;
		};
	}, [redirectToLogin]);

	useEffect(() => {
		if (active !== "children") return;
		return fetchChildren();
	}, [active]);

	// Always load notices on initial mount (not just when Notices tab is active)
	useEffect(() => {
		let ignore = false;
		const loadNotices = async () => {
			setLoadingNotices(true);
			setNoticesError("");
			try {
				const res = await fetch("/api/notices");
				if (res.status === 401) {
					if (!ignore) redirectToLogin(setNoticesError);
					return;
				}
				const data = await res.json();
				if (!res.ok || !data?.success || !Array.isArray(data.notices)) {
					throw new Error(data?.error || "Unable to load notices");
				}
				if (!ignore) {
					const normalized = data.notices.map((n: any) => ({
						id: n._id,
						title: n.noticetitle,
						date: n.noticedate,
						body: n.notice,
						image: n.noticeimage, // Extraction of notice image
						classGroup: n.classGroup,
					}));
					setNoticesData(normalized);
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load notices";
				if (!ignore) setNoticesError(message);
			} finally {
				if (!ignore) setLoadingNotices(false);
			}
		};
		loadNotices();
		return () => {
			ignore = true;
		};
	}, []);

	useEffect(() => {
		if (active !== "gallery" && active !== "dashboard") return;
		if (children.length === 0 && !loadingChildren) {
			fetchChildren();
		}
		let ignore = false;
		const loadGallery = async () => {
			setLoadingGallery(true);
			setGalleryError("");
			try {
				const res = await fetch("/api/gallery");
				if (res.status === 401) {
					if (!ignore) redirectToLogin(setGalleryError);
					return;
				}
				const data = await res.json();
				if (!res.ok || !data?.success || !Array.isArray(data.gallery)) {
					throw new Error(data?.error || "Unable to load gallery");
				}
				if (!ignore) {
					const expanded = data.gallery.flatMap((item: any) => {
						const mediaItems = Array.isArray(item.media) ? item.media : item.media ? [item.media] : [];
						return mediaItems
							.map((entry: any, idx: number) => {
								const raw = typeof entry === "string" ? entry : entry?.url || entry?.src || entry?.secure_url || "";
								const url = typeof raw === "string" ? raw.trim() : "";
								if (!url) return null;
								return {
									id: `${item._id} -${idx} `,
									url,
									alt: (typeof entry === "object" ? entry?.alt : undefined) || item.alt || item.category || "Classroom photo",
									category: item.category || "Uncategorized",
									classId: item.classId?._id || item.classId || "",
									classLabel: item.classLabel || item.classId?.name || "",
								};
							})
							.filter(Boolean);
					});
					setGalleryMedia(expanded);
					setGalleryPage(1);
					setActiveGalleryFilter("All");
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load gallery";
				if (!ignore) setGalleryError(message);
			} finally {
				if (!ignore) setLoadingGallery(false);
			}
		};
		loadGallery();
		return () => {
			ignore = true;
		};
	}, [active]);

	const selectedStudent = useMemo(() => {
		if (!studentIdParam) return null;
		return children.find((c) => String((c as any).id || (c as any)._id) === studentIdParam) || null;
	}, [children, studentIdParam]);

	const allowedClassLabels = useMemo(() => {
		if (selectedStudent) {
			return new Set([selectedStudent.classGroup ? selectedStudent.classGroup.toString().trim().toLowerCase() : ""]);
		}
		const labels = children.map((child) => (child.classGroup ? child.classGroup.toString().trim().toLowerCase() : "")).filter(Boolean);
		return new Set(labels);
	}, [children, selectedStudent]);

	useEffect(() => {
		if (active !== "messages") return;
		if (children.length === 0 && !loadingChildren) {
			fetchChildren();
		}
		return fetchMessages();
	}, [active, children.length, loadingChildren, fetchChildren, fetchMessages]);

	useEffect(() => {
		if (!messages.length) {
			setSelectedMessageId(null);
			return;
		}
		const exists = messages.some((m) => (m._id || m.id) === selectedMessageId);
		if (!exists) {
			setSelectedMessageId(messages[0]._id || messages[0].id || null);
		}
	}, [messages, selectedMessageId]);

	useEffect(() => {
		if (newMessageForm.studentId || children.length === 0) return;
		setNewMessageForm((prev) => ({ ...prev, studentId: String((children[0] as any).id || (children[0] as any)._id || "") }));
	}, [children, newMessageForm.studentId]);

	const selectedMessage = useMemo(() => messages.find((m) => (m._id || m.id) === selectedMessageId) || null, [messages, selectedMessageId]);

	useEffect(() => {
		if (active !== "events") return;
		if (children.length === 0 && !loadingChildren) {
			fetchChildren();
		}
		let ignore = false;
		const loadEvents = async () => {
			setLoadingEvents(true);
			setEventsError("");
			try {
				const res = await fetch("/api/events");
				if (res.status === 401) {
					if (!ignore) redirectToLogin(setEventsError);
					return;
				}
				const data = await res.json();
				if (!res.ok || !data?.success || !Array.isArray(data.events)) {
					throw new Error(data?.error || "Unable to load events");
				}
				if (!ignore) {
					const normalized = data.events
						.sort((a: any, b: any) => new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime())
						.map((evt: any) => ({
							id: evt._id,
							title: evt.eventname,
							date: evt.eventdate,
							venue: evt.eventvenue,
							description: evt.eventdescription,
							classLabel: evt.classLabel || evt.classId?.name || "",
						}));
					setEventsData(normalized);
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load events";
				if (!ignore) setEventsError(message);
			} finally {
				if (!ignore) setLoadingEvents(false);
			}
		};
		loadEvents();
		return () => {
			ignore = true;
		};
	}, [active, allowedClassLabels, redirectToLogin, fetchChildren, loadingChildren]);

	const fetchAppointments = useCallback(() => {
		let ignore = false;
		const loadAppointments = async () => {
			setLoadingAppointments(true);
			try {
				const res = await fetch("/api/appointments");
				if (res.status === 401) {
					if (!ignore) redirectToLogin();
					return;
				}
				const data = await res.json();
				if (!res.ok || !data?.success || !Array.isArray(data.appointments)) {
					throw new Error(data?.error || "Unable to load appointments");
				}
				if (!ignore) {
					setAppointments(data.appointments);
				}
			} catch (error) {
				console.error("Failed to load appointments:", error);
			} finally {
				if (!ignore) setLoadingAppointments(false);
			}
		};
		loadAppointments();
		return () => {
			ignore = true;
		};
	}, [redirectToLogin]);

	const handleUpdateAppointment = async (id: string, status: string, additionalData: any = {}) => {
		setSubmittingAppointment(true);
		try {
			const res = await fetch(`/api/appointments/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status, ...additionalData }),
			});
			if (res.status === 401) {
				redirectToLogin();
				return;
			}
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Failed to update appointment");
			}
			setAppointments((prev) => prev.map((a) => (a._id === id || a.id === id ? data.appointment : a)));
			setAppointmentAction({ type: null, id: null });
			setAppointmentForm({ reason: "" });
		} catch (error) {
			console.error("Error updating appointment:", error);
			alert(error instanceof Error ? error.message : "Failed to update appointment");
		} finally {
			setSubmittingAppointment(false);
		}
	};

	useEffect(() => {
		if (active !== "meetings" && active !== "dashboard") return;
		if (children.length === 0 && !loadingChildren) {
			fetchChildren();
		}
		return fetchAppointments();
	}, [active, children.length, loadingChildren, fetchChildren, fetchAppointments]);

	const openLightbox = (index: number) => {
		if (lightboxItems.length === 0) return;
		const target = Math.max(0, Math.min(index, lightboxItems.length - 1));
		setLightboxIndex(target);
		setLightboxOpen(true);
	};

	const closeLightbox = () => setLightboxOpen(false);

	const showPrev = () => {
		setLightboxIndex((prev) => {
			if (lightboxItems.length === 0) return 0;
			return (prev - 1 + lightboxItems.length) % lightboxItems.length;
		});
	};

	const showNext = () => {
		setLightboxIndex((prev) => {
			if (lightboxItems.length === 0) return 0;
			return (prev + 1) % lightboxItems.length;
		});
	};

	const handleSendReply = async () => {
		if (!selectedMessageId || !replyBody.trim()) return;
		setMessagesError("");
		try {
			const res = await fetch(`/api/messages/${selectedMessageId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ body: replyBody }),
			});
			if (res.status === 401) {
				redirectToLogin(setMessagesError);
				return;
			}
			const data = await res.json();
			if (!res.ok || !data?.success || !data?.message) {
				throw new Error(data?.error || "Failed to send reply");
			}
			const updated = normalizeMessageThread(data.message);
			setMessages((prev) => prev.map((m) => ((m._id || m.id) === (updated._id || updated.id) ? updated : m)));
			setReplyBody("");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to send reply";
			setMessagesError(message);
		}
	};

	const handleCreateMessage = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!newMessageForm.studentId || !newMessageForm.message.trim()) {
			setMessagesError("Please pick a child and write a message.");
			return;
		}
		setCreatingMessage(true);
		setMessagesError("");
		try {
			const res = await fetch("/api/messages", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					studentId: newMessageForm.studentId,
					topic: newMessageForm.topic,
					priority: newMessageForm.priority,
					message: newMessageForm.message,
				}),
			});
			if (res.status === 401) {
				redirectToLogin(setMessagesError);
				return;
			}
			const data = await res.json();
			if (!res.ok || !data?.success || !data?.message) {
				throw new Error(data?.error || "Failed to send message");
			}
			const normalized = normalizeMessageThread(data.message);
			setMessages((prev) => [normalized, ...prev]);
			setSelectedMessageId(normalized._id || normalized.id || null);
			setNewMessageForm((prev) => ({ studentId: prev.studentId, topic: "", priority: "normal", message: "" }));
			setShowNewMessageForm(false);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to send message";
			setMessagesError(message);
		} finally {
			setCreatingMessage(false);
		}
	};

	useEffect(() => {
		if (!lightboxOpen) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setLightboxOpen(false);
			}
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				showPrev();
			}
			if (e.key === "ArrowRight") {
				e.preventDefault();
				showNext();
			}
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [lightboxOpen]);

	const classScopedGallery = galleryMedia.filter((item) => {
		if (!item.classLabel) return true; // no class tag -> visible to all
		if (allowedClassLabels.size === 0) return false; // class-tagged but no child class known
		return allowedClassLabels.has(item.classLabel.toString().trim().toLowerCase());
	});

	const galleryFilters = React.useMemo(() => {
		const classScopedCategories = Array.from(new Set(classScopedGallery.map((item) => item.category || "Uncategorized")));
		return ["All", ...classScopedCategories];
	}, [classScopedGallery]);

	useEffect(() => {
		if (!galleryFilters.includes(activeGalleryFilter)) {
			setActiveGalleryFilter("All");
			setGalleryPage(1);
		}
	}, [galleryFilters, activeGalleryFilter]);

	const filteredGallery = activeGalleryFilter === "All" ? classScopedGallery : classScopedGallery.filter((item) => item.category === activeGalleryFilter);
	const totalGalleryPages = Math.max(1, Math.ceil(filteredGallery.length / GALLERY_PAGE_SIZE));
	const currentGalleryPage = Math.min(galleryPage, totalGalleryPages);
	const paginatedGallery = filteredGallery.slice((currentGalleryPage - 1) * GALLERY_PAGE_SIZE, currentGalleryPage * GALLERY_PAGE_SIZE);

	const lightboxItems = filteredGallery.length > 0 ? filteredGallery : galleryMedia;

	const galleryStats = useMemo(() => {
		const statsMap = new Map<string, number>();
		classScopedGallery.forEach((item) => {
			const cat = item.category || "Uncategorized";
			statsMap.set(cat, (statsMap.get(cat) || 0) + 1);
		});
		return Array.from(statsMap.entries()).map(([label, count], idx) => ({ id: idx, label, count }));
	}, [classScopedGallery]);

	const filteredAppointments = useMemo(() => {
		if (!selectedStudent) return appointments;
		return appointments.filter((apt) => !apt.studentId || String(apt.studentId._id || apt.studentId) === String(selectedStudent.id || selectedStudent._id));
	}, [appointments, selectedStudent]);

	const dashboardStats = useMemo(() => {
		const upcomingMeetings = appointments.filter((a) => a.status === "confirmed" || a.status === "scheduled").length;
		const unreadNotices = noticesData.length; // Placeholder for unread logic if exists
		return [
			{ label: "Notices", value: unreadNotices, hint: "Total" },
			{ label: "Meetings", value: upcomingMeetings, hint: "Upcoming" },
			{ label: "Assignments", value: assignments.length, hint: "Current" },
		];
	}, [appointments, noticesData, assignments]);

	return (
		<div className="min-h-screen bg-gray-50 pt-28">
			<header className="bg-white shadow-sm">
				<div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm text-gray-500">Welcome back</p>
						<h1 className="text-2xl font-semibold text-gray-900">{activeLabel}</h1>
						<p className="text-sm text-gray-500">Stay on top of notices, meetings, and transport.</p>
						{selectedStudent && (
							<div className="mt-2 flex items-center gap-2">
								<span className="text-sm font-medium text-[#0094da] bg-[#0094da] px-3 py-1 rounded-full">Showing for: {selectedStudent.name}</span>
								<Link href="/parents/dashboard" className="text-xs text-gray-500 hover:text-gray-700 underline">
									Clear filter
								</Link>
							</div>
						)}
					</div>
					<div className="flex flex-wrap gap-2">
						<button onClick={() => setShowAppointmentModal(true)} className="inline-flex items-center gap-2 rounded-full bg-[#0094da] px-4 py-2 text-white text-sm font-medium hover:bg-[#0094da] transition">
							<CalendarDays className="h-4 w-4" />
							Book Appointment
						</button>
						<button className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-gray-700 text-sm font-medium hover:bg-gray-100 transition">
							<Bell className="h-4 w-4" />
							Alerts
						</button>
					</div>
				</div>
			</header>

			<nav className="bg-white border-b border-gray-100">
				<div className="mx-auto max-w-6xl px-4 overflow-auto">
					<div className="flex gap-2 py-3 min-w-max">
						{sections.map((item) => {
							const isActive = item.key === active;
							return (
								<button key={item.key} onClick={() => setActive(item.key)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${isActive ? "bg-[#0094da] text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
									{item.label}
								</button>
							);
						})}
					</div>
				</div>
			</nav>

			<main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
				{active === "dashboard" && (
					<div>
						<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{dashboardStats.map((item) => (
								<div key={item.label} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
									<p className="text-sm text-gray-500">{item.label}</p>
									<div className="mt-2 flex items-end gap-2">
										<span className="text-2xl font-semibold text-gray-900">{item.value}</span>
										<span className="text-xs text-[#0094da]">{item.hint}</span>
									</div>
								</div>
							))}
						</section>

						<section className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
							<div className="lg:col-span-2 space-y-6">
								<div className="rounded-xl bg-white border border-gray-100 shadow-sm">
									<div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
										<div className="flex items-center gap-2">
											<Info className="h-4 w-4 text-blue-600" />
											<h2 className="text-base font-semibold text-gray-900">Recent Notices</h2>
										</div>
										<Link href="#" className="text-sm text-[#0094da] hover:underline">
											View all
										</Link>
									</div>
									<ul className="divide-y divide-gray-100">
										{noticesData
											.filter((n) => {
												if (!n.classGroup) return true;
												if (allowedClassLabels.size === 0) return true;
												return allowedClassLabels.has(n.classGroup.toString().trim().toLowerCase());
											})
											.slice(0, 3)
											.map((notice) => (
												<li key={notice.id} className="px-4 py-3 flex items-start justify-between gap-4">
													<div className="flex gap-3 min-w-0">
														{notice.image && (
															<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
																<Image src={notice.image} alt={notice.title} fill className="object-cover" />
															</div>
														)}
														<div className="min-w-0">
															<p className="text-sm font-semibold text-gray-900 truncate">{notice.title}</p>
															<p className="text-xs text-gray-500">{notice.date}</p>
														</div>
													</div>
													<span className="text-xs rounded-full bg-blue-50 text-blue-700 px-2 py-1 border border-blue-100 shrink-0">New</span>
												</li>
											))}
									</ul>
								</div>

								<div className="rounded-xl bg-white border border-gray-100 shadow-sm">
									<div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
										<div className="flex items-center gap-2">
											<MessageSquare className="h-4 w-4 text-amber-600" />
											<h2 className="text-base font-semibold text-gray-900">Appointments</h2>
										</div>
										<Link href="#" className="text-sm text-[#0094da] hover:underline">
											Schedule
										</Link>
									</div>
									<ul className="divide-y divide-gray-100">
										{loadingAppointments && <p className="p-4 text-sm text-gray-500">Loading...</p>}
										{!loadingAppointments && filteredAppointments.length === 0 && <p className="p-4 text-sm text-gray-500">No upcoming meetings.</p>}
										{filteredAppointments.slice(0, 3).map((meeting) => (
											<li key={meeting._id || meeting.id} className="px-4 py-3 flex items-center justify-between">
												<div className="min-w-0 flex-1">
													<p className="text-sm font-semibold text-gray-900 truncate">{meeting.topic || "Teacher Meeting"}</p>
													<p className="text-xs text-gray-500">
														{new Date(meeting.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {meeting.time}
													</p>
												</div>
												<span className={`text-[10px] sm:text-xs rounded-full px-2 py-0.5 border shrink-0 ${meeting.status === "confirmed" || meeting.status === "scheduled" ? "bg-[#0094da] text-[#0094da] border-[#0094da]" : "bg-amber-50 text-amber-700 border-amber-100"}`}>{meeting.status}</span>
											</li>
										))}
									</ul>
								</div>
							</div>

							<div className="space-y-6">
								<div className="rounded-xl bg-white border border-gray-100 shadow-sm">
									<div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
										<ImageIcon className="h-4 w-4 text-pink-600" />
										<h2 className="text-base font-semibold text-gray-900">Gallery</h2>
									</div>
									<ul className="divide-y divide-gray-100">
										{loadingGallery && <p className="px-4 py-3 text-sm text-gray-500">Loading gallery stats...</p>}
										{!loadingGallery && galleryStats.length === 0 && <p className="px-4 py-3 text-sm text-gray-500">No photos available.</p>}
										{galleryStats.slice(0, 5).map((gallery) => (
											<li key={gallery.id} className="px-4 py-3 flex items-center justify-between">
												<p className="text-sm font-semibold text-gray-900">{gallery.label}</p>
												<span className="text-xs text-gray-500">
													{gallery.count} {gallery.count === 1 ? "photo" : "photos"}
												</span>
											</li>
										))}
									</ul>
									<div className="px-4 py-3">
										<button onClick={() => setActive("gallery")} className="text-sm text-[#0094da] hover:underline">
											Open gallery
										</button>
									</div>
								</div>

								{/* <div className="rounded-xl bg-white border border-gray-100 shadow-sm">
									<div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
										<Bus className="h-4 w-4 text-indigo-600" />
										<h2 className="text-base font-semibold text-gray-900">Transport routes</h2>
									</div>
									<ul className="divide-y divide-gray-100">
										{routes.map((route) => (
											<li key={route.id} className="px-4 py-3 flex items-center justify-between">
												<div>
													<p className="text-sm font-semibold text-gray-900">{route.name}</p>
													<p className="text-xs text-gray-500">Stop: {route.stop}</p>
												</div>
												<span className="text-xs text-gray-600">{route.time}</span>
											</li>
										))}
									</ul>
								</div> */}
							</div>
						</section>

						{/* <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 flex items-center gap-3">
								<Home className="h-5 w-5 text-teal-600" />
								<div>
									<p className="text-sm font-semibold text-gray-900">Student profile</p>
									<p className="text-xs text-gray-500">View academic and attendance details.</p>
								</div>
							</div>
							<div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 flex items-center gap-3">
								<UserCheck className="h-5 w-5 text-emerald-600" />
								<div>
									<p className="text-sm font-semibold text-gray-900">Update contacts</p>
									<p className="text-xs text-gray-500">Keep your phone and address current.</p>
								</div>
							</div>
							<div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 flex items-center gap-3">
								<Bell className="h-5 w-5 text-amber-600" />
								<div>
									<p className="text-sm font-semibold text-gray-900">Notifications</p>
									<p className="text-xs text-gray-500">Control alerts for notices.</p>
								</div>
							</div>
						</section> */}
					</div>
				)}

				{active === "children" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-900">Child / Children Info</h2>
							{/* <Link href="/parents/dashboard/students" className="text-sm text-[#0094da] hover:underline">
								Manage profiles
							</Link> */}
						</div>
						<p className="text-sm text-gray-600">View or update your child’s profile details and contacts.</p>

						{loadingChildren && <div className="text-sm text-gray-500">Loading children...</div>}
						{childrenError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{childrenError}</div>}
						{!loadingChildren && !childrenError && children.length === 0 && <div className="text-sm text-gray-600">No child records found for this account.</div>}

						{children.length > 0 && (
							<div className="grid gap-3 md:grid-cols-2">
								{children.map((child) => (
									<div key={child.id} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 shadow-sm">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-semibold text-gray-900">{child.name}</p>
												<p className="text-xs text-gray-600">Class: {child.classGroup || "-"}</p>
											</div>
											<Link href={`/parents/dashboard/students/${child.id || child._id}`} className="text-xs font-semibold text-[#0094da] hover:underline">
												View details
											</Link>
										</div>
									</div>
								))}
							</div>
						)}
					</section>
				)}

				{active === "messages" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">Messages</h2>
								<p className="text-sm text-gray-600">Chat with your child’s teacher and keep all replies in one place.</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<button type="button" onClick={() => setShowNewMessageForm(!showNewMessageForm)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${showNewMessageForm ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-[#0094da] text-white hover:bg-[#0094da]"}`}>
									{showNewMessageForm ? "Cancel" : "Send Message"}
								</button>
								{!showNewMessageForm && (
									<button type="button" onClick={() => fetchMessages()} className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-transparent">
										Refresh
									</button>
								)}
							</div>
						</div>

						{messagesError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{messagesError}</div>}

						{showNewMessageForm && (
							<div className="max-w-md mx-auto rounded-lg border border-[#0094da] bg-[#0094da]/50 p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-base font-bold text-gray-900">Compose New Message</h3>
									<button onClick={() => setShowNewMessageForm(false)} className="text-gray-400 hover:text-gray-600 p-1">
										<X className="w-5 h-5" />
									</button>
								</div>
								<form onSubmit={handleCreateMessage} className="space-y-4">
									<div className="grid gap-4 md:grid-cols-3">
										<label className="flex flex-col gap-1.5 text-sm text-gray-700 md:col-span-2">
											<span className="font-semibold text-gray-900">Regarding Student</span>
											<select value={newMessageForm.studentId} onChange={(e) => setNewMessageForm((prev) => ({ ...prev, studentId: e.target.value }))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#0094da] outline-none transition">
												{children.length === 0 && <option value="">No children found</option>}
												{children.map((child) => (
													<option key={child.id || child._id} value={child.id || child._id}>
														{child.name} {child.classGroup ? `· Class ${child.classGroup}` : ""}
													</option>
												))}
											</select>
										</label>
										<label className="flex flex-col gap-1.5 text-sm text-gray-700">
											<span className="font-semibold text-gray-900">Urgency</span>
											<select value={newMessageForm.priority} onChange={(e) => setNewMessageForm((prev) => ({ ...prev, priority: e.target.value }))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#0094da] outline-none transition">
												<option value="normal">Normal</option>
												<option value="urgent">Urgent</option>
											</select>
										</label>
									</div>
									<label className="flex flex-col gap-1.5 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Subject / Topic</span>
										<input value={newMessageForm.topic} onChange={(e) => setNewMessageForm((prev) => ({ ...prev, topic: e.target.value }))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#0094da] outline-none transition" placeholder="Transportation, homework, attendance..." />
									</label>
									<label className="flex flex-col gap-1.5 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Message Details</span>
										<textarea value={newMessageForm.message} onChange={(e) => setNewMessageForm((prev) => ({ ...prev, message: e.target.value }))} rows={4} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#0094da] outline-none transition" placeholder="Share your question or update clearly for the teacher" />
									</label>
									<div className="flex items-center justify-end gap-3 pt-2">
										<button type="button" onClick={() => setShowNewMessageForm(false)} className="px-6 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
											Cancel
										</button>
										<button type="submit" disabled={creatingMessage} className={`rounded-full px-8 py-2 text-sm font-semibold shadow-md transition ${creatingMessage ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#0094da] text-white hover:bg-[#0094da] transform hover:-translate-y-0.5"}`}>
											{creatingMessage ? "Sending..." : "Send Message"}
										</button>
									</div>
								</form>
							</div>
						)}

						<div className="grid gap-4 lg:grid-cols-3">
							<div className="space-y-2 lg:col-span-1">
								<div className="rounded-lg border border-gray-100 bg-gray-50 p-3 shadow-sm h-full">
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-sm font-semibold text-gray-900">Conversations</h3>
										<span className="text-xs text-gray-500">{messages.length} total</span>
									</div>
									<div className="space-y-2 max-h-[520px] overflow-y-auto">
										{messagesLoading && <p className="text-sm text-gray-600">Loading messages...</p>}
										{!messagesLoading && messages.length === 0 && <p className="text-sm text-gray-600">No messages yet.</p>}
										{messages.map((msg) => {
											const msgId = msg._id || msg.id;
											const lastEntry = (msg.messages || []).slice(-1)[0];
											const snippet = lastEntry?.body?.slice(0, 80) || msg.message || "";
											const lastAt = formatDateTime(msg.lastMessageAt || lastEntry?.createdAt || msg.createdAt);
											const isSelected = msgId === selectedMessageId;
											return (
												<button key={msgId} type="button" onClick={() => setSelectedMessageId(msgId)} className={`w-full text-left rounded-lg border px-3 py-2 transition ${isSelected ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-100"}`}>
													<div className="flex items-start justify-between gap-2">
														<div className="space-y-1">
															<p className="text-sm font-semibold text-gray-900">{`${msg.firstName || "Parent"} ${msg.lastName || ""} `.trim()}</p>
															<p className="text-xs text-gray-600">{msg.childName ? `Child: ${msg.childName} ` : "Child info pending"}</p>
															<p className="text-xs text-gray-600 line-clamp-2">{snippet}</p>
														</div>
														<div className="flex flex-col items-end gap-1 text-right">
															<span className={`text-[11px] px-2 py-0.5 rounded-full border ${msg.status === "closed" ? "bg-gray-100 text-gray-700 border-gray-200" : "bg-[#0094da] text-[#0094da] border-[#0094da]"}`}>{msg.status === "closed" ? "Resolved" : "Open"}</span>
															<span className={`text-[11px] px-2 py-0.5 rounded-full border ${msg.priority === "urgent" ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>{msg.priority === "urgent" ? "Urgent" : "Normal"}</span>
															<span className="text-[11px] text-gray-500">{lastAt}</span>
														</div>
													</div>
												</button>
											);
										})}
									</div>
								</div>
							</div>

							<div className="space-y-3 lg:col-span-2">
								<div className="rounded-lg border border-gray-100 bg-white shadow-sm p-4 min-h-[320px]">
									{selectedMessage ? (
										<div className="space-y-3">
											<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
												<div>
													<p className="text-base font-semibold text-gray-900">{`${selectedMessage.firstName || "Parent"} ${selectedMessage.lastName || ""} `.trim()}</p>
													<p className="text-xs text-gray-600">
														{selectedMessage.email} · {selectedMessage.phone || "No phone on file"}
													</p>
													<p className="text-xs text-gray-600">
														{selectedMessage.childName ? `Child: ${selectedMessage.childName} ` : "Child info pending"} {selectedMessage.classGroup ? `· Class ${selectedMessage.classGroup} ` : ""}
													</p>
												</div>
												<div className="flex flex-wrap gap-2 items-center">
													<span className={`text-[11px] px-2 py-0.5 rounded-full border ${selectedMessage.status === "closed" ? "bg-gray-100 text-gray-700 border-gray-200" : "bg-[#0094da] text-[#0094da] border-[#0094da]"}`}>{selectedMessage.status === "closed" ? "Resolved" : "Open"}</span>
													<span className={`text-[11px] px-2 py-0.5 rounded-full border ${selectedMessage.priority === "urgent" ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>{selectedMessage.priority === "urgent" ? "Urgent" : "Normal"}</span>
													<span className="text-[11px] px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">{selectedMessage.topic || "General"}</span>
												</div>
											</div>

											<div className="space-y-2 max-h-[360px] overflow-y-auto rounded-md border border-gray-100 bg-gray-50 p-3">
												{(selectedMessage.messages || []).map((msg: any, idx: number) => {
													const fromParent = msg.senderType !== "teacher";
													return (
														<div key={`${msg.createdAt || idx}-${idx}`} className={`flex ${fromParent ? "justify-start" : "justify-end"}`}>
															<div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${fromParent ? "bg-white border border-gray-100 text-gray-900" : "bg-blue-600 text-white"}`}>
																<div className={`text-[11px] mb-1 ${fromParent ? "text-gray-500" : "text-blue-100"}`}>
																	{fromParent ? msg.senderName || "You" : "Teacher"} · {formatDateTime(msg.createdAt || selectedMessage.createdAt)}
																</div>
																<p className="whitespace-pre-line leading-relaxed">{msg.body}</p>
															</div>
														</div>
													);
												})}
											</div>

											<div className="space-y-2">
												<label className="text-sm text-gray-700 font-semibold">Reply to teacher</label>
												<textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={3} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Type your reply" />
												<div className="flex flex-wrap gap-2 items-center">
													<button type="button" onClick={handleSendReply} disabled={!replyBody.trim()} className={`rounded-full px-4 py-2 text-sm font-semibold ${!replyBody.trim() ? "bg-gray-200 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
														Send reply
													</button>
												</div>
											</div>
										</div>
									) : (
										<p className="text-sm text-gray-600">Select a conversation to view messages.</p>
									)}
								</div>
							</div>
						</div>
					</section>
				)}

				{active === "notices" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
								<Bell className="w-5 h-5 text-blue-600" /> Notices
							</h2>
							<input type="text" placeholder="Search notices..." value={noticeSearch} onChange={(e) => setNoticeSearch(e.target.value)} className="rounded border border-gray-200 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
						</div>
						{loadingNotices && <div className="text-sm text-gray-500">Loading notices...</div>}
						{noticesError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{noticesError}</div>}
						{!loadingNotices && !noticesError && noticesData.length === 0 && <div className="text-sm text-gray-600">No notices available.</div>}

						{noticesData.length > 0 && (
							<ul className="divide-y divide-gray-100">
								{noticesData
									.filter((n) => {
										// Search filter
										const matchesSearch = n.title.toLowerCase().includes(noticeSearch.toLowerCase()) || n.body.toLowerCase().includes(noticeSearch.toLowerCase()) || n.date.toLowerCase().includes(noticeSearch.toLowerCase());
										if (!matchesSearch) return false;

										// Class filter
										if (!n.classGroup) return true; // Show general notices
										if (allowedClassLabels.size === 0) return true;
										return allowedClassLabels.has(n.classGroup.toString().trim().toLowerCase());
									})
									.map((notice) => {
										const isExpanded = expandedNotice === notice.id;
										return (
											<li key={notice.id} className="py-3">
												<button className="w-full text-left flex items-center justify-between gap-2 group focus:outline-none" onClick={() => setExpandedNotice(isExpanded ? null : notice.id)} aria-expanded={isExpanded}>
													<div>
														<span className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition">{notice.title}</span>
														<span className="ml-2 text-xs text-gray-500">{notice.date}</span>
														{notice.classGroup && <span className="ml-2 text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 border border-gray-200">{notice.classGroup}</span>}
													</div>
													<span className={`ml-2 transition-transform ${isExpanded ? "rotate-90" : "rotate-0"}`}>
														<ChevronRight className="w-4 h-4 text-gray-400" />
													</span>
												</button>
												<div className={`mt-2 pl-1 pr-2 space-y-3 transition-all duration-200 ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`} style={{ willChange: "max-height, opacity" }}>
													{notice.image && (
														<div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
															<Image src={notice.image} alt={notice.title} fill className="object-cover" />
														</div>
													)}
													<p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{notice.body}</p>
												</div>
											</li>
										);
									})}
							</ul>
						)}
					</section>
				)}

				{active === "gallery" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex items-center justify-between flex-wrap gap-3">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">Gallery</h2>
								<p className="text-sm text-gray-600">Classroom and activity photos shared by teachers.</p>
							</div>
							<span className="text-xs rounded-full bg-gray-100 text-gray-800 px-2 py-1 border border-gray-200">Tap to zoom · Arrows to browse</span>
						</div>

						{galleryFilters.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{galleryFilters.map((filter) => {
									const isActive = activeGalleryFilter === filter;
									return (
										<button
											key={filter}
											onClick={() => {
												setActiveGalleryFilter(filter);
												setGalleryPage(1);
											}}
											className={`rounded-full px-3 py-1 text-xs font-semibold transition ${isActive ? "bg-[#0094da] text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
										>
											{filter}
										</button>
									);
								})}
							</div>
						)}

						{loadingGallery && <div className="text-sm text-gray-500">Loading photos...</div>}
						{galleryError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{galleryError}</div>}
						{!loadingGallery && !galleryError && filteredGallery.length === 0 && <div className="text-sm text-gray-600">No photos yet. Your child’s classroom uploads will appear here.</div>}

						{filteredGallery.length > 0 && (
							<div className="space-y-3">
								<div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
									{paginatedGallery.map((item) => {
										const globalIndex = filteredGallery.findIndex((g) => g.id === item.id);
										return (
											<button type="button" key={item.id} onClick={() => openLightbox(globalIndex)} className="group relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0094da] focus:ring-offset-2">
												<div className="relative h-32 w-full">
													<Image src={item.url} alt={item.alt || item.category || "Gallery Preview"} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
												</div>
												<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
												<div className="absolute bottom-1 left-1 rounded bg-white/80 px-2 py-0.5 text-[11px] text-gray-700">{item.category || "Photo"}</div>
											</button>
										);
									})}
								</div>

								{totalGalleryPages > 1 && (
									<div className="flex items-center justify-between text-xs text-gray-700">
										<div className="space-x-2">
											<button type="button" onClick={() => setGalleryPage((p) => Math.max(1, p - 1))} disabled={currentGalleryPage === 1} className="rounded-full border border-gray-200 px-3 py-1 disabled:opacity-50">
												Prev
											</button>
											<button type="button" onClick={() => setGalleryPage((p) => Math.min(totalGalleryPages, p + 1))} disabled={currentGalleryPage === totalGalleryPages} className="rounded-full border border-gray-200 px-3 py-1 disabled:opacity-50">
												Next
											</button>
										</div>
										<span>
											Page {currentGalleryPage} of {totalGalleryPages}
										</span>
									</div>
								)}
							</div>
						)}

						{lightboxOpen && lightboxItems[lightboxIndex] && (
							<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
								<div className="relative w-full max-w-4xl">
									<button type="button" onClick={closeLightbox} className="absolute -top-10 right-0 text-white hover:text-gray-200" aria-label="Close gallery viewer">
										<X className="h-6 w-6" />
									</button>
									<div className="relative overflow-hidden rounded-xl bg-black shadow-2xl">
										<div className="relative w-full" style={{ minHeight: "80vh" }}>
											<Image src={lightboxItems[lightboxIndex].url} alt={lightboxItems[lightboxIndex].alt || "Classroom photo"} fill sizes="(max-width: 768px) 90vw, 80vw" className="object-contain bg-black" referrerPolicy="no-referrer" unoptimized />
										</div>
										<div className="absolute inset-y-0 left-0 flex items-center">
											<button type="button" onClick={showPrev} className="p-3 text-white/90 hover:text-white" aria-label="Previous photo">
												<ChevronLeft className="h-6 w-6" />
											</button>
										</div>
										<div className="absolute inset-y-0 right-0 flex items-center">
											<button type="button" onClick={showNext} className="p-3 text-white/90 hover:text-white" aria-label="Next photo">
												<ChevronRight className="h-6 w-6" />
											</button>
										</div>
										<div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm px-4 py-2 flex items-center justify-between">
											<span>{lightboxItems[lightboxIndex].alt || "Classroom photo"}</span>
											<span className="text-xs text-gray-200">
												{lightboxIndex + 1} / {lightboxItems.length}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}
					</section>
				)}

				{active === "meals" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">School Meals</h2>
								<p className="text-sm text-gray-600">Sample week plan (6 days · Breakfast, Lunch, Snack).</p>
							</div>
							{/* <span className="text-xs rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 border border-yellow-200">Sample</span> */}
						</div>

						<div className="grid gap-4">
							{mealPlan.map((plan) => (
								<div key={plan.day} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs text-gray-500">Day</p>
											<p className="text-sm font-semibold text-gray-900">{plan.day}</p>
										</div>
										{/* <span className="text-[11px] rounded-full bg-gray-100 text-gray-800 px-2 py-1 border border-gray-200">Sample day</span> */}
									</div>

									<div className="grid gap-3 md:grid-cols-3">
										{mealSlots.map((slot) => (
											<div key={slot.key} className="rounded-md border border-gray-100 bg-gray-50 p-3 space-y-1">
												<p className="text-[11px] text-gray-500 uppercase tracking-wide">{slot.label}</p>
												<p className="text-sm font-semibold text-gray-900">{plan[slot.key].title}</p>
												<p className="text-xs text-gray-600">{plan[slot.key].detail}</p>
											</div>
										))}
									</div>
								</div>
							))}
						</div>

						<div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-2">
							<h3 className="text-base font-semibold text-gray-900">Notes</h3>
							<p className="text-sm text-gray-700">Please notify the school of any allergies. Menu rotates weekly; this is a sample week.</p>
						</div>
					</section>
				)}

				{active === "events" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-3">
						<h2 className="text-lg font-semibold text-gray-900">Events</h2>
						<p className="text-sm text-gray-600">Upcoming events from the school calendar.</p>

						{loadingEvents && <div className="text-sm text-gray-500">Loading events...</div>}
						{eventsError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{eventsError}</div>}
						{!loadingEvents && !eventsError && eventsData.length === 0 && <div className="text-sm text-gray-600">No events available.</div>}

						{eventsData.length > 0 && (
							<div className="grid gap-3 md:grid-cols-2">
								{eventsData
									.filter((event) => {
										if (!event.classLabel) return true; // Show to all if no class specified
										if (allowedClassLabels.size === 0) return true; // Show all if no children (or logic specific) - actually provided logic implies show based on children.
										// If we have allowedClassLabels, it MUST match one of the allowed labels.
										return allowedClassLabels.has(event.classLabel.toString().trim().toLowerCase());
									})
									.map((event) => {
										const parts = toEventDateParts(event.date);
										return (
											<div key={event.id} className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
												<div className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-b from-[#0094da] to-emerald-500 text-white px-4 py-3 min-w-[88px]">
													<span className="text-xs font-semibold tracking-widest">{parts.month}</span>
													<span className="text-3xl font-bold leading-none">{parts.day || "—"}</span>
												</div>
												<div className="flex-1 space-y-2">
													<div className="flex flex-wrap items-start justify-between gap-3">
														<p className="text-sm font-semibold text-gray-900 leading-tight min-w-[180px]">{event.title}</p>
														<div className="flex flex-wrap items-center gap-2">
															<span className="text-[11px] text-gray-600 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200">{event.date || "Date TBA"}</span>
															<span className="text-[11px] rounded-full bg-gray-100 text-gray-800 px-2 py-0.5 border border-gray-200">{event.classLabel ? `Class ${event.classLabel} ` : "All classes"}</span>
														</div>
													</div>
													<p className="text-xs text-gray-600">{event.venue || "Venue TBA"}</p>
													{event.description && <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>}
												</div>
											</div>
										);
									})}
							</div>
						)}
					</section>
				)}

				{active === "assignments" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
							<span className="text-xs rounded-full bg-blue-50 text-blue-700 px-2 py-1 border border-blue-100">All assignments for your child</span>
						</div>
						{loadingAssignments && <div className="text-sm text-gray-500">Loading assignments...</div>}
						{assignmentsError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{assignmentsError}</div>}
						{!loadingAssignments && !assignmentsError && assignments.length === 0 && <div className="text-sm text-gray-600">No assignments found.</div>}
						{assignments.length > 0 && (
							<ul className="divide-y divide-gray-100">
								{assignments
									.filter((a) => {
										if (!a.classGroup) return true;
										// If we have allowedClassLabels, it must match
										return allowedClassLabels.has(a.classGroup.toString().trim().toLowerCase());
									})
									.map((a, idx) => (
										<li key={a._id} className={`p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 ${idx % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}`}>
											<div>
												<p className="text-base font-semibold text-gray-900">{a.title || a.assignmentTitle || "Untitled Assignment"}</p>
												{a.classGroup && <span className="text-xs text-gray-500 mr-2">Class: {a.classGroup}</span>}
												{a.status && <span className="text-xs rounded-full bg-[#0094da] text-[#0094da] border border-[#0094da] px-2 py-0.5 ml-1">{a.status}</span>}
												{a.dueDate && <span className="text-xs text-amber-600 ml-2">Due: {a.dueDate?.slice(0, 10)}</span>}
												{a.description && <p className="text-sm text-gray-700 mt-1">{a.description}</p>}
											</div>
											{/* YouTube video */}
											{a.youtube && (
												<div className="mt-2">
													<iframe width="360" height="203" src={a.youtube.includes("youtube.com") || a.youtube.includes("youtu.be") ? a.youtube.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/") : a.youtube} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-lg w-full max-w-md"></iframe>
												</div>
											)}
											{/* Alternate YouTube URL field */}
											{a.youtubeUrl && !a.youtube && (
												<div className="mt-2">
													<iframe width="360" height="203" src={a.youtubeUrl.includes("youtube.com") || a.youtubeUrl.includes("youtu.be") ? a.youtubeUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/") : a.youtubeUrl} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-lg w-full max-w-md"></iframe>
												</div>
											)}
											{/* Attached resources */}
											{Array.isArray(a.resources) && a.resources.length > 0 && (
												<div className="mt-2">
													<div className="text-xs font-semibold text-gray-700 mb-1">Resources:</div>
													<ul className="list-disc list-inside space-y-1">
														{a.resources.map((r: any, idx: number) => (
															<li key={idx}>
																{r.url ? (
																	<a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 underline">
																		{formatResourceLabel(r)}
																	</a>
																) : (
																	formatResourceLabel(r)
																)}
															</li>
														))}
													</ul>
												</div>
											)}
											{/* Single resource link */}
											{a.resource && (
												<div className="mt-2">
													<a href={a.resource} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 underline">
														{formatResourceLabel({ label: a.resourceLabel, url: a.resource })}
													</a>
												</div>
											)}
											{/* Attachment */}
											{a.attachment && (
												<a href={a.attachment} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 underline">
													{formatResourceLabel(a.attachment)}
												</a>
											)}
										</li>
									))}
							</ul>
						)}
					</section>
				)}
				{active === "meetings" && (
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
						<div className="p-6 border-b border-gray-100 flex justify-between items-center">
							<h2 className="text-lg font-semibold text-gray-900">Appointments & Meetings</h2>
							<button onClick={() => setShowAppointmentModal(true)} className="text-sm bg-[#0094da] text-[#0094da] px-3 py-1.5 rounded-lg font-medium hover:bg-[#0094da] transition">
								+ New Request
							</button>
						</div>
						<div className="divide-y divide-gray-100">
							{loadingAppointments ? (
								<p className="p-6 text-gray-500 text-center">Loading appointments...</p>
							) : filteredAppointments.length === 0 ? (
								<div className="p-8 text-center">
									<p className="text-gray-500">No appointments found.</p>
								</div>
							) : (
								filteredAppointments.map((apt) => (
									<div key={apt._id} className="p-6 hover:bg-gray-50 transition">
										<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
											<div>
												<div className="flex items-center gap-2 mb-1">
													<span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${apt.status === "confirmed" || apt.status === "scheduled" ? "bg-[#0094da] text-[#0094da] border-[#0094da]" : apt.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" : apt.status === "proposed" || apt.status === "requested" || apt.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" : apt.status === "completed" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-700 border-gray-200"} `}>{apt.status === "requested" ? "Requested" : apt.status === "pending" ? "Pending Approval" : apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}</span>
													<span className="text-xs text-gray-500">
														{new Date(apt.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at {apt.time}
													</span>
												</div>
												<h3 className="text-base font-semibold text-gray-900 mb-1">{apt.topic || "Teacher Meeting"}</h3>
												<p className="text-sm text-gray-600">
													<span className="font-medium">Teacher:</span> {apt.teacherId?.firstName} {apt.teacherId?.lastName}
												</p>
												<p className="text-sm text-gray-600">
													<span className="font-medium">Child:</span> {apt.studentId?.firstName} {apt.studentId?.lastName}
												</p>
												{apt.reason && (
													<div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200 max-w-xl">
														<p className="text-xs font-medium text-gray-500 uppercase mb-1">{apt.status === "rejected" ? "Reason:" : "Note:"}</p>
														<p className="text-sm text-gray-700 leading-relaxed">{apt.reason}</p>
													</div>
												)}

												{appointmentAction.id === apt._id && appointmentAction.type === "reject" && (
													<div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200 max-w-xl">
														<textarea className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:ring-2 focus:ring-red-500" placeholder="Why are you rejecting this proposal?" rows={2} value={appointmentForm.reason} onChange={(e) => setAppointmentForm({ reason: e.target.value })} />
														<div className="flex gap-2">
															<button disabled={submittingAppointment} onClick={() => handleUpdateAppointment(apt._id, "rejected", { reason: appointmentForm.reason })} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
																{submittingAppointment ? "Sending..." : "Confirm Rejection"}
															</button>
															<button onClick={() => setAppointmentAction({ type: null, id: null })} className="text-xs bg-white text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-50">
																Cancel
															</button>
														</div>
													</div>
												)}
											</div>

											<div className="flex flex-col sm:items-end gap-2">
												{apt.status === "proposed" && !appointmentAction.id && (
													<div className="flex gap-2">
														<button disabled={submittingAppointment} onClick={() => handleUpdateAppointment(apt._id, "confirmed")} className="text-xs bg-[#0094da] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#0094da] disabled:opacity-50">
															Accept
														</button>
														<button onClick={() => setAppointmentAction({ type: "reject", id: apt._id })} className="text-xs bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-50">
															Reject
														</button>
													</div>
												)}
												{(apt.status === "confirmed" || apt.status === "scheduled") && (
													<button
														disabled={submittingAppointment}
														onClick={() => {
															if (confirm("Mark this meeting as completed?")) {
																handleUpdateAppointment(apt._id, "completed");
															}
														}}
														className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-100 disabled:opacity-50"
													>
														<UserCheck className="w-3.5 h-3.5" />
														Completed
													</button>
												)}
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				)}
			</main>

			<AppointmentModal
				isOpen={showAppointmentModal}
				onClose={(refresh?: boolean) => {
					setShowAppointmentModal(false);
					if (refresh) setActive("meetings"); // Switch to meetings tab to see the new request
				}}
				students={children}
				preSelectedStudentId={selectedStudent?._id || selectedStudent?.id}
			/>

			<Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} index={lightboxIndex} slides={galleryMedia.map((item) => ({ src: item.url, alt: item.alt }))} />
		</div>
	);
}

export default function ParentsDashboardPage() {
	return (
		<Suspense fallback={<div className="p-6">Loading...</div>}>
			<ParentsDashboardPageContent />
		</Suspense>
	);
}
