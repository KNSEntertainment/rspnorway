"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Pencil, Plus, Trash2, X, UserCheck, GraduationCap, Calendar } from "lucide-react";
import EventForm from "@/components/EventForm";

const overviewStats = [
	{ label: "Classes today", value: "3", hint: "9:00 · 11:00 · 1:30" },
	{ label: "Assignments due", value: "2", hint: "Math · Science" },
	{ label: "Unread messages", value: "5", hint: "Parents & staff" },
	{ label: "Pending notices", value: "1", hint: "Draft" },
];

// Top-level constants

// Compute today's routines for the overview tab
const tabs = [
	{ key: "overview", label: "Overview" },
	{ key: "classes", label: "Classes" },
	{ key: "attendance", label: "Attendance" },
	{ key: "assignments", label: "Assignments" },
	{ key: "notices", label: "Notices" },
	{ key: "messages", label: "Messages" },
	{ key: "gallery", label: "Gallery" },
	{ key: "events", label: "Events" },
	{ key: "appointments", label: "Appointments" },
	{ key: "todo", label: "My To-Dos" },
	{ key: "profile", label: "My Profile" },
];
const today = new Date();
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const todayDay = dayNames[today.getDay()];

export default function TeacherDashboardPage() {
	// ...existing code...
	const [routines, setRoutines] = useState([]);
	const [routinesLoading, setRoutinesLoading] = useState(false);
	const [routinesError, setRoutinesError] = useState("");

	// Compute today's routines for the overview tab
	const todayRoutines = useMemo(() => {
		return (routines || []).filter((r) => (r.day || "") === todayDay).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
	}, [routines]);
	const router = useRouter();
	const [active, setActive] = useState("overview");
	const activeLabel = useMemo(() => tabs.find((t) => t.key === active)?.label || "Overview", [active]);
	const [assignedClasses, setAssignedClasses] = useState([]);
	const [teacherSubjects, setTeacherSubjects] = useState([]);
	const [loadingTeacher, setLoadingTeacher] = useState(false);
	const [teacherError, setTeacherError] = useState("");
	const [students, setStudents] = useState([]);
	const [loadingStudents, setLoadingStudents] = useState(false);
	const [studentsError, setStudentsError] = useState("");
	const [attendance, setAttendance] = useState({});
	const [emailStatus, setEmailStatus] = useState({ sending: false, sent: false, error: "", count: 0 });
	const [sendingAttendance, setSendingAttendance] = useState(false);
	const [savingAttendance, setSavingAttendance] = useState(false);
	const [saveStatus, setSaveStatus] = useState({ saved: false, error: "" });
	const [existingAttendance, setExistingAttendance] = useState({ taken: false, notifiedIds: new Set() });
	const [editAfterSaved, setEditAfterSaved] = useState(false);
	const [assignments, setAssignments] = useState([]);
	const [assignmentsLoading, setAssignmentsLoading] = useState(false);
	const [assignmentsError, setAssignmentsError] = useState("");
	const [creatingAssignment, setCreatingAssignment] = useState(false);
	const [createAssignmentError, setCreateAssignmentError] = useState("");
	const [assignmentFilterStatus, setAssignmentFilterStatus] = useState("All");
	const [editingAssignmentId, setEditingAssignmentId] = useState(null);
	const [deleteConfirmApt, setDeleteConfirmApt] = useState(null); // { id: string, title: string }
	const [newAssignment, setNewAssignment] = useState({
		title: "",
		classGroup: "",
		subject: "",
		dueDate: "",
		description: "",
		videoLink: "",
		scheduledPublishAt: "",
		status: "Draft",
		files: [],
	});
	const [schedulePublish, setSchedulePublish] = useState(false);
	const [fileInputKey, setFileInputKey] = useState(0);
	const [notices, setNotices] = useState([]);
	const [noticesLoading, setNoticesLoading] = useState(false);
	const [noticesError, setNoticesError] = useState("");
	const [creatingNotice, setCreatingNotice] = useState(false);
	const [createNoticeError, setCreateNoticeError] = useState("");
	const [newNotice, setNewNotice] = useState({ title: "", body: "", image: null });
	const [noticeFileInputKey, setNoticeFileInputKey] = useState(0);
	const [editingNoticeId, setEditingNoticeId] = useState(null);
	const [messages, setMessages] = useState([]);
	const [messagesLoading, setMessagesLoading] = useState(false);
	const [messagesError, setMessagesError] = useState("");
	const [messageFilterStatus, setMessageFilterStatus] = useState("open");
	const [messagePriorityFilter, setMessagePriorityFilter] = useState("all");
	const [messageSearch, setMessageSearch] = useState("");
	const [selectedMessageId, setSelectedMessageId] = useState(null);
	const [replyBody, setReplyBody] = useState("");
	const [sendingReply, setSendingReply] = useState(false);
	const [newParentMessage, setNewParentMessage] = useState({
		studentId: "",
		topic: "",
		priority: "normal",
		message: "",
	});
	const [creatingParentMessage, setCreatingParentMessage] = useState(false);
	const [galleryItems, setGalleryItems] = useState([]);
	const [galleryLoading, setGalleryLoading] = useState(false);
	const [galleryError, setGalleryError] = useState("");
	const [gallerySuccess, setGallerySuccess] = useState("");
	const [uploadingGallery, setUploadingGallery] = useState(false);
	const [galleryForm, setGalleryForm] = useState({ classId: "", category: "", files: [] });
	const [galleryFileInputKey, setGalleryFileInputKey] = useState(0);
	const [galleryDeletingId, setGalleryDeletingId] = useState(null);
	const [events, setEvents] = useState([]);
	const [eventsLoading, setEventsLoading] = useState(false);
	const [eventsError, setEventsError] = useState("");
	const [eventModalOpen, setEventModalOpen] = useState(false);
	const [eventToEdit, setEventToEdit] = useState(null);
	const [eventDeletingId, setEventDeletingId] = useState(null);
	const [teacherProfile, setTeacherProfile] = useState(null);
	const [profileForm, setProfileForm] = useState({
		phone: "",
		bio: "",
		address: "",
		qualifications: "",
		yearsOfExperience: "",
		emergencyContactName: "",
		emergencyContactPhone: "",
		avatarUrl: "",
	});
	const [savingProfile, setSavingProfile] = useState(false);
	const [profileSuccess, setProfileSuccess] = useState("");
	const [profileError, setProfileError] = useState("");
	const [todos, setTodos] = useState([]);
	const [todosLoading, setTodosLoading] = useState(false);
	const [todosError, setTodosError] = useState("");
	const [todoForm, setTodoForm] = useState({ title: "", description: "", dueDate: "", priority: "normal", classId: "", tags: "" });
	const [savingTodo, setSavingTodo] = useState(false);
	const [todoFilterStatus, setTodoFilterStatus] = useState("open");
	const [todoFilterPriority, setTodoFilterPriority] = useState("all");
	const [todoSearch, setTodoSearch] = useState("");

	// Appointments
	const [appointments, setAppointments] = useState([]);
	const [appointmentsLoading, setAppointmentsLoading] = useState(false);
	const [appointmentsError, setAppointmentsError] = useState("");
	const [appointmentAction, setAppointmentAction] = useState({ type: null, id: null }); // { type: 'reject' | 'propose', id: string }
	const [appointmentForm, setAppointmentForm] = useState({ reason: "", date: "", time: "" });
	const [submittingAppointment, setSubmittingAppointment] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line no-console
		console.log("[DEBUG] teacherProfile:", teacherProfile);
		// eslint-disable-next-line no-console
		console.log("[DEBUG] assignedClasses:", assignedClasses);
	}, [teacherProfile, assignedClasses]);

	// DEBUG: Log routines API response
	useEffect(() => {
		// eslint-disable-next-line no-console
		console.log("[DEBUG] routines fetched:", routines);
	}, [routines]);

	useEffect(() => {
		let ignore = false;
		const load = async () => {
			try {
				setLoadingTeacher(true);
				setTeacherError("");
				const meRes = await fetch("/api/auth/me");
				const meData = await meRes.json();
				if (meRes.status === 401) {
					setTeacherError("Session expired. Redirecting to login...");
					if (typeof window !== "undefined") {
						window.location.href = "/user";
					} else {
						router.replace("/user");
					}
					return;
				}
				if (!meRes.ok || !meData?.user?.email) {
					throw new Error(meData?.error || "Unable to load user");
				}
				const userEmail = String(meData.user.email).trim().toLowerCase();

				const teacherRes = await fetch("/api/teachers", { cache: "no-store" });
				const teacherData = await teacherRes.json();
				if (!teacherRes.ok || !teacherData?.success || !Array.isArray(teacherData.teachers)) {
					throw new Error(teacherData?.error || "Unable to load teachers");
				}
				const teacher = teacherData.teachers.find((t) => String(t.email).trim().toLowerCase() === userEmail);
				if (!teacher) {
					throw new Error("Teacher record not found for this account");
				}

				const classes = Array.isArray(teacher.classIds)
					? teacher.classIds.map((c) => ({
							id: c._id || c.id || c,
							name: c.name || "Class",
							room: c.room || "",
							students: c.studentsCount || c.students || "",
							homeroom: Boolean(c.homeroom),
					  }))
					: [];

				if (!ignore) {
					setAssignedClasses(classes);
					setTeacherSubjects(Array.isArray(teacher.subjects) ? teacher.subjects.filter(Boolean) : []);
					setTeacherProfile(teacher);
					setProfileForm({
						phone: teacher.phone || "",
						bio: teacher.bio || "",
						address: teacher.address || "",
						qualifications: teacher.qualifications || "",
						yearsOfExperience: teacher.yearsOfExperience ? String(teacher.yearsOfExperience) : "",
						emergencyContactName: teacher.emergencyContactName || "",
						emergencyContactPhone: teacher.emergencyContactPhone || "",
						avatarUrl: teacher.avatarUrl || "",
					});
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load teacher data";
				if (!ignore) setTeacherError(message);
			} finally {
				if (!ignore) setLoadingTeacher(false);
			}
		};
		load();
		return () => {
			ignore = true;
		};
	}, []);

	const fetchAssignments = useCallback(async () => {
		try {
			setAssignmentsLoading(true);
			setAssignmentsError("");
			const res = await fetch("/api/assignments");
			const data = await res.json();
			if (!res.ok || !data?.success || !Array.isArray(data.assignments)) {
				throw new Error(data?.error || "Unable to load assignments");
			}
			setAssignments(data.assignments);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to load assignments";
			setAssignmentsError(message);
		} finally {
			setAssignmentsLoading(false);
		}
	}, []);

	const fetchNotices = useCallback(async () => {
		try {
			setNoticesLoading(true);
			setNoticesError("");
			const res = await fetch("/api/notices");
			const data = await res.json();
			if (!res.ok || !data?.success || !Array.isArray(data.notices)) {
				throw new Error(data?.error || "Unable to load notices");
			}
			setNotices(data.notices);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to load notices";
			setNoticesError(message);
		} finally {
			setNoticesLoading(false);
		}
	}, []);

	const normalizeMessageThread = useCallback((msg) => {
		const parentName = `${msg.firstName || ""} ${msg.lastName || ""}`.trim() || "Parent";
		const baseThread = Array.isArray(msg.messages) ? [...msg.messages] : [];
		if (!baseThread.length && msg.message) {
			baseThread.push({ senderType: "parent", senderName: parentName, body: msg.message, createdAt: msg.createdAt || new Date(), via: "contact-form" });
		}
		const lastMessageAt = msg.lastMessageAt || (baseThread.length ? baseThread[baseThread.length - 1]?.createdAt : msg.createdAt) || new Date();
		return { ...msg, messages: baseThread, lastMessageAt };
	}, []);

	const fetchMessages = useCallback(async () => {
		try {
			setMessagesLoading(true);
			setMessagesError("");
			const res = await fetch("/api/messages");
			const data = await res.json();
			if (!res.ok || !data?.success || !Array.isArray(data.messages)) {
				throw new Error(data?.error || "Unable to load messages");
			}
			const normalized = data.messages.map((m) => normalizeMessageThread(m));
			setMessages(normalized);
			if (!selectedMessageId && normalized.length) {
				setSelectedMessageId(normalized[0]._id || normalized[0].id);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to load messages";
			setMessagesError(message);
		} finally {
			setMessagesLoading(false);
		}
	}, [normalizeMessageThread, selectedMessageId]);

	const fetchGallery = useCallback(async () => {
		try {
			setGalleryLoading(true);
			setGalleryError("");
			setGallerySuccess("");
			const res = await fetch("/api/gallery");
			const data = await res.json();
			if (!res.ok || !data?.success || !Array.isArray(data.gallery)) {
				throw new Error(data?.error || "Unable to load gallery");
			}
			const allowed = new Set(
				assignedClasses
					.map((c) =>
						String(c.name || "")
							.trim()
							.toLowerCase()
					)
					.filter(Boolean)
			);
			const filtered = allowed.size
				? data.gallery.filter((item) => {
						const label = String(item.classLabel || item.classId?.name || item.classId || "")
							.trim()
							.toLowerCase();
						return label && allowed.has(label);
				  })
				: data.gallery;
			setGalleryItems(filtered);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to load gallery";
			setGalleryError(message);
		} finally {
			setGalleryLoading(false);
		}
	}, [assignedClasses]);

	const fetchClassEvents = useCallback(async () => {
		try {
			setEventsLoading(true);
			setEventsError("");
			const res = await fetch("/api/events");
			const data = await res.json();
			if (!res.ok || !data?.success || !Array.isArray(data.events)) {
				throw new Error(data?.error || "Unable to load events");
			}
			const allowed = new Set(
				assignedClasses
					.map((c) =>
						String(c.name || "")
							.trim()
							.toLowerCase()
					)
					.filter(Boolean)
			);
			const scoped = data.events.filter((evt) => {
				const label = String(evt.classLabel || evt.classId?.name || "")
					.trim()
					.toLowerCase();
				if (!label) return true;
				if (!allowed.size) return false;
				return allowed.has(label);
			});
			setEvents(scoped);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to load events";
			setEventsError(message);
		} finally {
			setEventsLoading(false);
		}
	}, [assignedClasses]);

	const fetchTodos = useCallback(async () => {
		setTodosLoading(true);
		setTodosError("");
		try {
			const res = await fetch("/api/teachers/todos");
			const data = await res.json();
			if (!res.ok || !data?.success || !Array.isArray(data.todos)) {
				throw new Error(data?.error || "Unable to load to-dos");
			}
			setTodos(data.todos);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to load to-dos";
			setTodosError(message);
		} finally {
			setTodosLoading(false);
		}
	}, []);

	const fetchTeacherAppointments = useCallback(async () => {
		setAppointmentsLoading(true);
		setAppointmentsError("");
		try {
			const res = await fetch("/api/appointments");
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Unable to load appointments");
			}
			if (!Array.isArray(data.appointments)) {
				setAppointments([]);
			} else {
				setAppointments(data.appointments);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to load appointments";
			setAppointmentsError(message);
		} finally {
			setAppointmentsLoading(false);
		}
	}, []);

	const handleAppointmentStatus = async (id, status, extraData = {}) => {
		setSubmittingAppointment(true);
		try {
			const res = await fetch(`/api/appointments/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status, ...extraData }),
			});
			const data = await res.json();
			if (data.success) {
				setAppointments((prev) => prev.map((a) => (a._id === id || a.id === id ? data.appointment : a)));
				setAppointmentAction({ type: null, id: null });
				setAppointmentForm({ reason: "", date: "", time: "" });
			} else {
				alert(data.error || "Failed to update appointment");
			}
		} catch (error) {
			console.error("Error updating appointment:", error);
			alert("An error occurred");
		} finally {
			setSubmittingAppointment(false);
		}
	};

	const handleSyncCalendar = () => {
		if (!appointments || appointments.length === 0) {
			alert("No appointments to sync.");
			return;
		}

		// Filter for active/meaningful appointments
		const confirmed = appointments.filter((a) => ["confirmed", "scheduled", "completed"].includes(a.status));
		if (confirmed.length === 0) {
			alert("No confirmed or scheduled appointments found to sync.");
			return;
		}

		let icsLines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MagicChalk//Appointments//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];

		const formatICSDate = (date) => {
			return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
		};

		confirmed.forEach((apt) => {
			try {
				const aptDate = new Date(apt.date);
				const [hours, minutes] = (apt.time || "09:00").split(":").map(Number);

				const start = new Date(aptDate);
				start.setHours(hours, minutes, 0);

				const end = new Date(start);
				end.setMinutes(end.getMinutes() + 30); // Default 30 min duration

				const studentName = apt.studentId ? `${apt.studentId.firstName} ${apt.studentId.lastName}` : "Student";
				const parentName = apt.parentId?.fullName || "Parent";
				const summary = `Meeting: ${apt.topic || "Discussion"} (${studentName})`;
				const description = `Parent: ${parentName}\\nStudent: ${studentName}\\nStatus: ${apt.status}`;

				icsLines.push("BEGIN:VEVENT");
				icsLines.push(`UID:${apt._id || apt.id}@magicchalk.com`);
				icsLines.push(`DTSTAMP:${formatICSDate(new Date())}`);
				icsLines.push(`DTSTART:${formatICSDate(start)}`);
				icsLines.push(`DTEND:${formatICSDate(end)}`);
				icsLines.push(`SUMMARY:${summary}`);
				icsLines.push(`DESCRIPTION:${description}`);
				icsLines.push("END:VEVENT");
			} catch (err) {
				console.error("Error formatting appointment for ICS:", err);
			}
		});

		icsLines.push("END:VCALENDAR");

		const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", `MagicChalk_Appointments_${new Date().toISOString().split("T")[0]}.ics`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const fetchRoutines = useCallback(async () => {
		if (!teacherProfile?._id) return;
		setRoutinesLoading(true);
		setRoutinesError("");
		try {
			const res = await fetch(`/api/routines?teacherId=${teacherProfile._id}`);
			const data = await res.json();
			if (!res.ok || !data?.success || !Array.isArray(data.routines)) {
				throw new Error(data?.error || "Unable to load routines");
			}
			setRoutines(data.routines);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to load routines";
			setRoutinesError(message);
		} finally {
			setRoutinesLoading(false);
		}
	}, [teacherProfile?._id]);

	// Fetch routines when Classes tab is active
	useEffect(() => {
		if (active !== "classes") return;
		fetchRoutines();
	}, [active, fetchRoutines]);
	useEffect(() => {
		if (!assignedClasses.length) return;
		setNewAssignment((prev) => ({ ...prev, classGroup: prev.classGroup || assignedClasses[0].name || "" }));
	}, [assignedClasses]);

	useEffect(() => {
		let ignore = false;
		const loadStudentsAndTodayAttendance = async () => {
			if (!assignedClasses.length) {
				setStudents([]);
				setAttendance({});
				setExistingAttendance({ taken: false, notifiedIds: new Set() });
				setEditAfterSaved(false);
				return;
			}
			try {
				setLoadingStudents(true);
				setStudentsError("");
				const [studentsRes, attendanceRes] = await Promise.all([
					fetch("/api/students"),
					(() => {
						const today = new Date();
						const dayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
						const iso = dayOnly.toISOString();
						return fetch(`/api/attendance?start=${iso}&end=${iso}`);
					})(),
				]);
				const [studentsData, attendanceData] = await Promise.all([studentsRes.json(), attendanceRes.json()]);

				if (!studentsRes.ok || !studentsData?.success || !Array.isArray(studentsData.students)) {
					throw new Error(studentsData?.error || "Unable to load students");
				}
				if (!attendanceRes.ok || !attendanceData?.success) {
					throw new Error(attendanceData?.error || "Unable to load attendance");
				}

				const classNames = assignedClasses
					.map((c) =>
						String(c.name || "")
							.trim()
							.toLowerCase()
					)
					.filter(Boolean);
				const sorted = [...studentsData.students]
					.filter((s) =>
						classNames.includes(
							String(s.classGroup || "")
								.trim()
								.toLowerCase()
						)
					)
					.sort((a, b) => {
						const nameA = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase();
						const nameB = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase();
						return nameA.localeCompare(nameB);
					});

				const attendanceById = {};
				const notifiedIds = new Set();
				attendanceData.records
					.filter((rec) =>
						classNames.includes(
							String(rec.classGroup || "")
								.trim()
								.toLowerCase()
						)
					)
					.forEach((rec) => {
						const id = String(rec.studentId);
						attendanceById[id] = rec.status === "absent" ? false : true;
						if (rec.emailNotified) notifiedIds.add(id);
					});

				if (!ignore) {
					setStudents(sorted);
					const initial = Object.fromEntries(
						sorted.map((s) => {
							const id = String(s._id);
							return [id, attendanceById[id] ?? true];
						})
					);
					setAttendance(initial);
					setExistingAttendance({ taken: Object.keys(attendanceById).length > 0, notifiedIds });
					setEditAfterSaved(false);
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load students";
				if (!ignore) setStudentsError(message);
			} finally {
				if (!ignore) setLoadingStudents(false);
			}
		};
		loadStudentsAndTodayAttendance();
		return () => {
			ignore = true;
		};
	}, [assignedClasses]);

	useEffect(() => {
		if (active !== "assignments") return undefined;
		let cancelled = false;
		fetchAssignments();
		const interval = setInterval(() => {
			if (!cancelled) fetchAssignments();
		}, 30000);
		const onVisibility = () => {
			if (!cancelled && document.visibilityState === "visible") {
				fetchAssignments();
			}
		};
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			cancelled = true;
			clearInterval(interval);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [active, fetchAssignments]);

	useEffect(() => {
		if (active !== "assignments") return undefined;
		const now = Date.now();
		const upcoming = assignments
			.filter((a) => a.status === "Scheduled" && a.scheduledPublishAt)
			.map((a) => new Date(a.scheduledPublishAt).getTime())
			.filter((ts) => !Number.isNaN(ts));
		if (!upcoming.length) return undefined;
		const nextTime = Math.min(...upcoming);
		const delay = Math.max(0, nextTime - now + 500); // nudge refetch right after scheduled time
		const timeout = setTimeout(() => {
			fetchAssignments();
		}, delay);
		return () => clearTimeout(timeout);
	}, [active, assignments, fetchAssignments]);

	useEffect(() => {
		if (active !== "notices" && active !== "overview") return undefined;
		fetchNotices();
	}, [active, fetchNotices]);

	useEffect(() => {
		if (active !== "messages" && active !== "overview") return undefined;
		fetchMessages();
	}, [active, fetchMessages]);

	useEffect(() => {
		if (active !== "gallery") return undefined;
		fetchGallery();
	}, [active, fetchGallery]);

	useEffect(() => {
		if (active !== "todo" && active !== "overview") return undefined;
		fetchTodos();
	}, [active, fetchTodos]);

	useEffect(() => {
		if (active !== "events") return undefined;
		fetchClassEvents();
	}, [active, fetchClassEvents]);

	useEffect(() => {
		if (active !== "appointments") return undefined;
		fetchTeacherAppointments();
	}, [active, fetchTeacherAppointments]);

	useEffect(() => {
		if (galleryForm.classId || !assignedClasses.length) return;
		const first = assignedClasses[0];
		setGalleryForm((prev) => ({ ...prev, classId: String(first.id || first._id || ""), category: prev.category || first.name || "" }));
	}, [assignedClasses, galleryForm.classId]);

	useEffect(() => {
		if (!messages.length) {
			setSelectedMessageId(null);
			return;
		}
		const exists = messages.some((m) => (m._id || m.id) === selectedMessageId);
		if (!exists) {
			setSelectedMessageId(messages[0]._id || messages[0].id);
		}
	}, [messages, selectedMessageId]);

	const assignedClassNames = useMemo(() => new Set(assignedClasses.map((c) => c.name).filter(Boolean)), [assignedClasses]);
	const eventClassOptions = useMemo(() => assignedClasses.map((cls) => ({ id: String(cls.id || cls._id || ""), name: cls.name || "Class" })), [assignedClasses]);
	const studentOptions = useMemo(() => {
		if (!assignedClassNames.size) return students;
		return students.filter((s) => assignedClassNames.has(s.classGroup));
	}, [students, assignedClassNames]);

	const recentNoticesUi = useMemo(() => {
		return notices.slice(0, 4).map((n) => {
			const rawDate = n.noticedate || n.date || n.createdAt || "";
			const displayDate = rawDate ? formatDateTime(rawDate) : "";
			return {
				id: n._id || n.id || "",
				title: n.noticetitle || n.title || "Notice",
				audience: n.audience || n.classGroup || "All classes",
				date: displayDate,
			};
		});
	}, [notices]);

	const recentMessagesUi = useMemo(() => {
		return messages.slice(0, 4).map((m) => {
			const parentName = `${m.firstName || "Parent"} ${m.lastName || ""}`.trim() || "Parent";
			const lastEntry = (m.messages || [])[Math.max((m.messages || []).length - 1, 0)] || null;
			const senderLabel = lastEntry?.senderType === "teacher" ? "You" : lastEntry?.senderName || parentName;
			const body = lastEntry?.body || m.message || "New message";
			return {
				id: m._id || m.id || "",
				from: parentName,
				snippet: `${senderLabel}: ${body}`,
			};
		});
	}, [messages]);

	const quickTasks = useMemo(() => {
		const showStatuses = new Set(["open", "in-progress"]);
		const activeTasks = todos.filter((t) => showStatuses.has(t.status || "open"));
		const sorted = [...activeTasks].sort((a, b) => {
			const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
			const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
			return aDue - bDue;
		});
		return sorted.slice(0, 3).map((t) => ({
			id: t._id || t.id || t.title,
			title: t.title || "Untitled task",
			status: t.status || "open",
		}));
	}, [todos]);

	const filteredTodos = useMemo(() => {
		const search = todoSearch.trim().toLowerCase();
		return todos
			.filter((t) => {
				if (todoFilterStatus !== "all" && (t.status || "open") !== todoFilterStatus) return false;
				if (todoFilterPriority !== "all" && (t.priority || "normal") !== todoFilterPriority) return false;
				if (!search) return true;
				return (t.title || "").toLowerCase().includes(search) || (t.description || "").toLowerCase().includes(search) || (t.tags || []).some((tag) => String(tag).toLowerCase().includes(search));
			})
			.sort((a, b) => {
				const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
				const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
				return aDue - bDue;
			});
	}, [todos, todoFilterStatus, todoFilterPriority, todoSearch]);

	const selectedComposeStudent = useMemo(() => studentOptions.find((s) => String(s._id || s.id) === String(newParentMessage.studentId)) || null, [studentOptions, newParentMessage.studentId]);

	useEffect(() => {
		if (!newParentMessage.studentId && studentOptions.length) {
			setNewParentMessage((prev) => ({ ...prev, studentId: String(studentOptions[0]._id || studentOptions[0].id || "") }));
		}
	}, [studentOptions, newParentMessage.studentId]);

	const routinesByDay = useMemo(() => {
		const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
		const classLookup = new Map(assignedClasses.map((c) => [String(c.id || c._id || c.name), c.name]));
		return dayOrder.map((day) => {
			const items = (routines || [])
				.filter((r) => (r.day || "") === day)
				.map((item) => ({ ...item, className: classLookup.get(String(item.classId)) || item.classGroup || "Class" }))
				.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
			return { day, items };
		});
	}, [assignedClasses, routines]);

	const handleAttendanceChange = (studentId) => {
		if (existingAttendance.taken) {
			setEditAfterSaved(true);
			return;
		}
		const id = String(studentId);
		setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
		setSaveStatus({ saved: false, error: "" });
		setEditAfterSaved(false);
	};

	const absentStudents = useMemo(() => students.filter((s) => attendance[String(s._id)] === false), [students, attendance]);

	const presentCount = students.length - absentStudents.length;

	const availableSubjects = useMemo(() => Array.from(new Set(teacherSubjects.filter(Boolean))), [teacherSubjects]);

	const assignmentStatuses = ["All", "Draft", "Scheduled", "Published", "Done"];

	useEffect(() => {
		if (!availableSubjects.length) return;
		setNewAssignment((prev) => ({ ...prev, subject: prev.subject || availableSubjects[0] }));
	}, [availableSubjects]);

	const filteredAssignments = useMemo(() => {
		return assignments.filter((a) => {
			const matchStatus = assignmentFilterStatus === "All" || a.status === assignmentFilterStatus;
			return matchStatus;
		});
	}, [assignments, assignmentFilterStatus]);

	const filteredNotices = useMemo(() => {
		return notices
			.map((n) => ({ ...n, _displayDate: n.createdAt || n.noticedate }))
			.sort((a, b) => {
				const ta = new Date(a._displayDate || a.createdAt || a.noticedate || 0).getTime();
				const tb = new Date(b._displayDate || b.createdAt || b.noticedate || 0).getTime();
				return tb - ta;
			});
	}, [notices]);

	const filteredMessages = useMemo(() => {
		const search = messageSearch.trim().toLowerCase();
		return messages
			.filter((m) => {
				const statusMatch = messageFilterStatus === "all" ? true : (m.status || "open") === messageFilterStatus;
				const priorityMatch = messagePriorityFilter === "all" ? true : (m.priority || "normal") === messagePriorityFilter;
				const haystack = `${m.firstName || ""} ${m.lastName || ""} ${m.childName || ""} ${m.topic || ""}`.toLowerCase();
				const searchMatch = !search || haystack.includes(search);
				return statusMatch && priorityMatch && searchMatch;
			})
			.sort((a, b) => {
				const ta = new Date(a.lastMessageAt || a.createdAt || 0).getTime();
				const tb = new Date(b.lastMessageAt || b.createdAt || 0).getTime();
				return tb - ta;
			});
	}, [messages, messageFilterStatus, messagePriorityFilter, messageSearch]);

	const selectedMessage = useMemo(() => messages.find((m) => (m._id || m.id) === selectedMessageId) || null, [messages, selectedMessageId]);

	const publishAssignment = async (id) => {
		const assignmentId = id;
		let previousStatus = null;
		setAssignments((prev) =>
			prev.map((a) => {
				if ((a._id || a.id) === assignmentId) {
					previousStatus = a.status;
					return { ...a, status: "Published" };
				}
				return a;
			})
		);
		try {
			const res = await fetch("/api/assignments", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: assignmentId, status: "Published" }),
			});
			if (!res.ok) {
				throw new Error("Failed to publish assignment");
			}
			const data = await res.json();
			if (!data?.success) {
				throw new Error(data?.error || "Failed to publish assignment");
			}
			setAssignments((prev) => prev.map((a) => ((a._id || a.id) === assignmentId ? data.assignment : a)));
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to publish assignment";
			setAssignmentsError(message);
			// revert optimistic update
			setAssignments((prev) => prev.map((a) => ((a._id || a.id) === assignmentId ? { ...a, status: previousStatus || a.status } : a)));
		}
	};

	const markComplete = async (id) => {
		const assignmentId = id;
		let previousStatus = null;
		setAssignments((prev) =>
			prev.map((a) => {
				if ((a._id || a.id) === assignmentId) {
					previousStatus = a.status;
					return { ...a, status: "Done" };
				}
				return a;
			})
		);
		try {
			const res = await fetch("/api/assignments", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: assignmentId, status: "Done" }),
			});
			if (!res.ok) {
				throw new Error("Failed to update assignment");
			}
			const data = await res.json();
			if (!data?.success) {
				throw new Error(data?.error || "Failed to update assignment");
			}
			setAssignments((prev) => prev.map((a) => ((a._id || a.id) === assignmentId ? data.assignment : a)));
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update assignment";
			setAssignmentsError(message);
			// revert optimistic update
			setAssignments((prev) => prev.map((a) => ((a._id || a.id) === assignmentId ? { ...a, status: previousStatus || a.status } : a)));
		}
	};

	const saveAttendanceRecords = async () => {
		if (!students.length) return;
		setSavingAttendance(true);
		setSaveStatus({ saved: false, error: "" });
		try {
			const today = new Date();
			const dayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			const entries = students.map((student) => {
				const id = String(student._id);
				return {
					studentId: id,
					status: attendance[id] === false ? "absent" : "present",
					classGroup: student.classGroup || "",
					date: dayOnly.toISOString(),
				};
			});
			const res = await fetch("/api/attendance", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ entries }),
			});
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Failed to save attendance");
			}
			setSaveStatus({ saved: true, error: "" });
			setExistingAttendance((prev) => ({ ...prev, taken: true }));
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to save attendance";
			setSaveStatus({ saved: false, error: message });
		} finally {
			setSavingAttendance(false);
		}
	};

	const sendAbsenceEmails = async () => {
		if (!absentStudents.length) return;
		setSendingAttendance(true);
		setEmailStatus({ sending: true, sent: false, error: "", count: 0 });
		try {
			const res = await fetch("/api/attendance/notify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					absentStudentIds: absentStudents.map((s) => s._id),
				}),
			});
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Failed to send emails");
			}
			const notifiedIds = new Set(existingAttendance.notifiedIds);
			absentStudents.forEach((s) => notifiedIds.add(s._id));
			setExistingAttendance((prev) => ({ ...prev, notifiedIds }));
			setEmailStatus({ sending: false, sent: true, error: "", count: data.sent ?? absentStudents.length });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to send emails";
			setEmailStatus({ sending: false, sent: false, error: message, count: 0 });
		} finally {
			setSendingAttendance(false);
		}
	};

	const handleNoticeFileChange = (e) => {
		const files = Array.from(e.target.files || []);
		setNewNotice((prev) => ({ ...prev, image: files[0] || null }));
	};

	const handleSendReply = async () => {
		if (!selectedMessageId || !replyBody.trim()) return;
		setSendingReply(true);
		try {
			const res = await fetch(`/api/messages/${selectedMessageId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ body: replyBody, status: selectedMessage?.status || "open" }),
			});
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
		} finally {
			setSendingReply(false);
		}
	};

	const handleUpdateMessageStatus = async (nextStatus) => {
		if (!selectedMessageId) return;
		setSendingReply(true);
		try {
			const res = await fetch(`/api/messages/${selectedMessageId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: nextStatus }),
			});
			const data = await res.json();
			if (!res.ok || !data?.success || !data?.message) {
				throw new Error(data?.error || "Failed to update status");
			}
			const updated = normalizeMessageThread(data.message);
			setMessages((prev) => prev.map((m) => ((m._id || m.id) === (updated._id || updated.id) ? updated : m)));
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update status";
			setMessagesError(message);
		} finally {
			setSendingReply(false);
		}
	};

	const handleCreateParentMessage = async (e) => {
		e.preventDefault();
		if (!newParentMessage.studentId || !newParentMessage.message.trim()) {
			setMessagesError("Please pick a recipient and write a message.");
			return;
		}
		setCreatingParentMessage(true);
		setMessagesError("");
		try {
			const res = await fetch("/api/messages", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					studentId: newParentMessage.studentId,
					topic: newParentMessage.topic,
					priority: newParentMessage.priority,
					message: newParentMessage.message,
				}),
			});
			const data = await res.json();
			if (!res.ok || !data?.success || !data?.message) {
				throw new Error(data?.error || "Failed to send message");
			}
			const normalized = normalizeMessageThread(data.message);
			setMessages((prev) => [normalized, ...prev]);
			setSelectedMessageId(normalized._id || normalized.id);
			setNewParentMessage((prev) => ({ studentId: prev.studentId, topic: "", priority: "normal", message: "" }));
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to send message";
			setMessagesError(message);
		} finally {
			setCreatingParentMessage(false);
		}
	};

	const handleSubmitNotice = async (e) => {
		e.preventDefault();
		if (!newNotice.title || !newNotice.body) {
			setCreateNoticeError("Please fill title and message.");
			return;
		}
		setCreatingNotice(true);
		setCreateNoticeError("");
		try {
			const formData = new FormData();
			formData.append("noticetitle", newNotice.title);
			formData.append("notice", newNotice.body);
			if (newNotice.image) {
				formData.append("noticeimage", newNotice.image);
			}

			const isEditing = Boolean(editingNoticeId);
			const endpoint = isEditing ? `/api/notices/${editingNoticeId}` : "/api/notices/create";
			const method = isEditing ? "PUT" : "POST";
			const res = await fetch(endpoint, {
				method,
				body: formData,
			});
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Failed to save notice");
			}
			const savedNotice = data.notice || data.Notice;
			if (isEditing) {
				setNotices((prev) => prev.map((n) => ((n._id || n.id) === (savedNotice?._id || savedNotice?.id) ? savedNotice : n)));
			} else {
				setNotices((prev) => [savedNotice, ...prev]);
			}
			setNewNotice({ title: "", body: "", image: null });
			setNoticeFileInputKey((k) => k + 1);
			setEditingNoticeId(null);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to save notice";
			setCreateNoticeError(message);
		} finally {
			setCreatingNotice(false);
		}
	};

	const startEditNotice = (notice) => {
		setEditingNoticeId(notice._id || notice.id || null);
		setNewNotice({
			title: notice.noticetitle || "",
			body: notice.notice || "",
			image: null,
		});
		setCreateNoticeError("");
		setNoticeFileInputKey((k) => k + 1);
	};

	const resetNoticeForm = () => {
		setEditingNoticeId(null);
		setNewNotice({ title: "", body: "", image: null });
		setCreateNoticeError("");
		setNoticeFileInputKey((k) => k + 1);
	};

	const handleGalleryFileChange = (e) => {
		const files = Array.from(e.target.files || []);
		setGalleryForm((prev) => ({ ...prev, files }));
	};

	const handleSubmitGallery = async (e) => {
		e.preventDefault();
		setGalleryError("");
		setGallerySuccess("");
		if (!galleryForm.files.length) {
			setGalleryError("Add at least one photo.");
			return;
		}
		const selectedClass = assignedClasses.find((cls) => String(cls.id) === String(galleryForm.classId));
		const resolvedCategory = (galleryForm.category || selectedClass?.name || "").trim();
		if (!resolvedCategory) {
			setGalleryError("Enter a tag or pick a class.");
			return;
		}
		setUploadingGallery(true);
		try {
			const formData = new FormData();
			formData.append("category", resolvedCategory);
			formData.append("alt", resolvedCategory);
			if (galleryForm.classId) {
				formData.append("classId", galleryForm.classId);
			}
			galleryForm.files.forEach((file) => formData.append("media", file));
			const res = await fetch("/api/gallery/create", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Failed to upload photos");
			}
			setGallerySuccess("Photos uploaded. Families can view them now.");
			setGalleryForm({
				classId: selectedClass ? String(selectedClass.id || selectedClass._id || "") : "",
				category: "",
				files: [],
			});
			setGalleryFileInputKey((k) => k + 1);
			await fetchGallery();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to upload photos";
			setGalleryError(message);
		} finally {
			setUploadingGallery(false);
		}
	};

	const handleDeleteGallery = async (id) => {
		if (!id) return;
		setGalleryError("");
		setGallerySuccess("");
		setGalleryDeletingId(id);
		try {
			const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Failed to delete gallery item");
			}
			setGalleryItems((prev) => prev.filter((item) => (item._id || item.id) !== id));
			setGallerySuccess("Gallery item deleted.");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete gallery item";
			setGalleryError(message);
		} finally {
			setGalleryDeletingId(null);
		}
	};

	const handleOpenEventModal = () => {
		if (!eventClassOptions.length) {
			setEventsError("You need an assigned class to create a classroom event.");
			return;
		}
		setEventToEdit(null);
		setEventModalOpen(true);
	};

	const handleEditEvent = (evt) => {
		setEventToEdit(evt);
		setEventModalOpen(true);
	};

	const handleCloseEventModal = () => {
		setEventModalOpen(false);
		setEventToEdit(null);
		fetchClassEvents();
	};

	const handleDeleteEvent = async (id) => {
		if (!id) return;
		const confirmed = typeof window !== "undefined" ? window.confirm("Delete this event?") : true;
		if (!confirmed) return;
		setEventsError("");
		setEventDeletingId(id);
		try {
			const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Failed to delete event");
			}
			await fetchClassEvents();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete event";
			setEventsError(message);
		} finally {
			setEventDeletingId(null);
		}
	};

	const handleCreateTodo = async (e) => {
		e.preventDefault();
		if (!todoForm.title.trim()) {
			setTodosError("Please add a title for the task.");
			return;
		}
		setSavingTodo(true);
		setTodosError("");
		try {
			const payload = {
				...todoForm,
				tags: todoForm.tags
					? todoForm.tags
							.split(",")
							.map((t) => t.trim())
							.filter(Boolean)
					: [],
			};
			const res = await fetch("/api/teachers/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!res.ok || !data?.success || !data?.todo) {
				throw new Error(data?.error || "Failed to create task");
			}
			setTodos((prev) => [data.todo, ...prev]);
			setTodoForm({ title: "", description: "", dueDate: "", priority: "normal", classId: "", tags: "" });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create task";
			setTodosError(message);
		} finally {
			setSavingTodo(false);
		}
	};

	const handleToggleTodo = async (todoId, nextStatus) => {
		if (!todoId) return;
		try {
			const res = await fetch(`/api/teachers/todos/${todoId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: nextStatus }),
			});
			const data = await res.json();
			if (!res.ok || !data?.success || !data?.todo) {
				throw new Error(data?.error || "Failed to update task");
			}
			setTodos((prev) => prev.map((t) => (String(t._id || t.id) === String(todoId) ? data.todo : t)));
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update task";
			setTodosError(message);
		}
	};

	const handleDeleteTodo = async (todoId) => {
		if (!todoId) return;
		const confirmed = typeof window !== "undefined" ? window.confirm("Delete this task?") : true;
		if (!confirmed) return;
		try {
			const res = await fetch(`/api/teachers/todos/${todoId}`, { method: "DELETE" });
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Failed to delete task");
			}
			setTodos((prev) => prev.filter((t) => String(t._id || t.id) !== String(todoId)));
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete task";
			setTodosError(message);
		}
	};

	const handleProfileFieldChange = (field, value) => {
		setProfileError("");
		setProfileSuccess("");
		setProfileForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSaveProfile = async (e) => {
		e?.preventDefault?.();
		if (!teacherProfile) return;
		setSavingProfile(true);
		setProfileError("");
		setProfileSuccess("");
		try {
			const years = profileForm.yearsOfExperience === "" ? "" : Number(profileForm.yearsOfExperience);
			const payload = {
				...profileForm,
				yearsOfExperience: Number.isFinite(years) && years >= 0 ? years : 0,
			};
			const res = await fetch("/api/teachers/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!res.ok || !data?.success || !data?.teacher) {
				throw new Error(data?.error || "Failed to update profile");
			}
			const updated = data.teacher;
			const classes = Array.isArray(updated.classIds) ? updated.classIds.map((c) => ({ id: c._id || c.id || c, name: c.name || "Class", room: c.room || "", students: c.studentsCount || c.students || "", homeroom: Boolean(c.homeroom) })) : [];
			setTeacherProfile(updated);
			setAssignedClasses(classes);
			setTeacherSubjects(Array.isArray(updated.subjects) ? updated.subjects.filter(Boolean) : []);
			setProfileSuccess("Profile updated successfully.");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update profile";
			setProfileError(message);
		} finally {
			setSavingProfile(false);
		}
	};

	const handleDeleteNotice = async (id) => {
		const noticeId = id;
		if (!noticeId) return;
		const confirmed = typeof window !== "undefined" ? window.confirm("Delete this notice?") : true;
		if (!confirmed) return;
		try {
			const res = await fetch(`/api/notices/${noticeId}`, { method: "DELETE" });
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Failed to delete notice");
			}
			setNotices((prev) => prev.filter((n) => (n._id || n.id) !== noticeId));
			if (editingNoticeId === noticeId) {
				resetNoticeForm();
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete notice";
			setNoticesError(message);
		}
	};

	const handleAssignmentFileChange = (e) => {
		const files = Array.from(e.target.files || []);
		setNewAssignment((prev) => ({ ...prev, files }));
	};

	const handleCreateAssignment = async (e) => {
		e.preventDefault();
		if (!newAssignment.title || !newAssignment.classGroup || !newAssignment.subject || !newAssignment.dueDate) {
			setCreateAssignmentError("Please fill title, class, subject, and due date.");
			return;
		}
		const scheduledIso = schedulePublish && newAssignment.scheduledPublishAt ? toIsoFromLocalDateTime(newAssignment.scheduledPublishAt) : "";
		if (schedulePublish) {
			if (!scheduledIso) {
				setCreateAssignmentError("Please pick a valid publish date/time or turn off scheduling.");
				return;
			}
			const scheduledDate = new Date(scheduledIso);
			if (scheduledDate.getTime() <= Date.now()) {
				setCreateAssignmentError("Pick a time in the future (even a few minutes ahead).");
				return;
			}
		}
		setCreatingAssignment(true);
		setCreateAssignmentError("");
		try {
			const statusToUse = schedulePublish && newAssignment.scheduledPublishAt ? "Scheduled" : newAssignment.status || "Draft";
			const scheduledIso = schedulePublish ? toIsoFromLocalDateTime(newAssignment.scheduledPublishAt) : "";

			const formData = new FormData();
			formData.append("title", newAssignment.title);
			formData.append("classGroup", newAssignment.classGroup);
			formData.append("subject", newAssignment.subject);
			formData.append("dueDate", newAssignment.dueDate);
			formData.append("description", newAssignment.description);
			formData.append("videoLink", newAssignment.videoLink || "");
			formData.append("status", statusToUse);
			if (schedulePublish && scheduledIso) {
				formData.append("scheduledPublishAt", scheduledIso);
			}
			(newAssignment.files || []).forEach((file) => formData.append("files", file));

			const url = editingAssignmentId ? `/api/assignments/${editingAssignmentId}` : "/api/assignments";
			const method = editingAssignmentId ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				body: formData,
			});
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || `Failed to ${editingAssignmentId ? "update" : "create"} assignment`);
			}

			const targetId = String(editingAssignmentId);
			if (editingAssignmentId) {
				setAssignments((prev) => prev.map((a) => (String(a._id || a.id) === targetId ? data.assignment : a)));
			} else {
				setAssignments((prev) => [data.assignment, ...prev]);
			}

			setNewAssignment({ title: "", classGroup: newAssignment.classGroup, subject: availableSubjects[0] || "", dueDate: "", description: "", videoLink: "", scheduledPublishAt: "", status: "Draft", files: [] });
			setEditingAssignmentId(null);
			setSchedulePublish(false);
			setFileInputKey((k) => k + 1);
		} catch (error) {
			const message = error instanceof Error ? error.message : `Failed to ${editingAssignmentId ? "update" : "create"} assignment`;
			setCreateAssignmentError(message);
		} finally {
			setCreatingAssignment(false);
		}
	};

	const handleEditAssignment = (a) => {
		const aid = String(a._id || a.id);
		setEditingAssignmentId(aid);

		let formattedDate = "";
		if (a.dueDate) {
			const d = new Date(a.dueDate);
			if (!Number.isNaN(d.getTime())) {
				formattedDate = d.toISOString().split("T")[0];
			}
		}

		let formattedPublish = "";
		if (a.scheduledPublishAt) {
			const d = new Date(a.scheduledPublishAt);
			if (!Number.isNaN(d.getTime())) {
				formattedPublish = d.toISOString().slice(0, 16);
			}
		}

		setNewAssignment({
			title: a.title || "",
			classGroup: a.classGroup || "",
			subject: a.subject || "",
			dueDate: formattedDate,
			description: a.description || "",
			videoLink: a.videoLink || "",
			scheduledPublishAt: formattedPublish,
			status: a.status || "Draft",
			files: [],
		});
		setSchedulePublish(!!a.scheduledPublishAt);
		setCreateAssignmentError("");
	};

	const handleDeleteAssignment = async (id) => {
		const sid = String(id);
		try {
			const res = await fetch(`/api/assignments/${sid}`, { method: "DELETE" });
			const data = await res.json();
			if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to delete");
			setAssignments((prev) => prev.filter((a) => String(a._id || a.id) !== sid));
			setDeleteConfirmApt(null);
		} catch (error) {
			console.error("Delete error:", error);
			alert(error.message);
		}
	};

	function formatDate(value) {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? "No date" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
	}

	function formatDateTime(value) {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? "Invalid date" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short", hour12: false });
	}

	const toIsoFromLocalDateTime = (value) => {
		if (!value || typeof value !== "string") return "";
		const [datePart, timePart] = value.split("T");
		if (!datePart || !timePart) return "";
		const [year, month, day] = datePart.split("-").map(Number);
		const [hour, minute] = timePart.split(":").map(Number);
		const localDate = new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0);
		return Number.isNaN(localDate.getTime()) ? "" : localDate.toISOString();
	};

	const minPublishDateTime = () => {
		const pad = (num) => String(num).padStart(2, "0");
		const now = new Date();
		now.setSeconds(0, 0);
		return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
	};

	return (
		<div className="min-h-screen bg-gray-50 pt-24">
			<header className="bg-white border-b border-gray-100 shadow-sm">
				<div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm text-gray-500">Teacher</p>
						<h1 className="text-2xl font-semibold text-gray-900">{activeLabel}</h1>
						<p className="text-sm text-gray-600">Stay current on your classes, parents, and school updates.</p>
					</div>
				</div>
			</header>

			<nav className="bg-white border-b border-gray-100">
				<div className="mx-auto max-w-6xl px-4 overflow-auto">
					<div className="flex gap-2 py-3 min-w-max">
						{tabs.map((tab) => {
							const isActive = tab.key === active;
							return (
								<button key={tab.key} onClick={() => setActive(tab.key)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-[#0094da] text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>
			</nav>

			<main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
				{active === "overview" && (
					<section className="space-y-5">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							{overviewStats.map((stat) => (
								<div key={stat.label} className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
									<p className="text-sm text-gray-500">{stat.label}</p>
									<div className="mt-2 flex items-end gap-2">
										<span className="text-2xl font-semibold text-gray-900">{stat.value}</span>
										<span className="text-xs text-[#0094da]">{stat.hint}</span>
									</div>
								</div>
							))}
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
							<div className="lg:col-span-2 space-y-4">
								<div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
									<div className="flex items-center justify-between mb-3">
										<h2 className="text-base font-semibold text-gray-900">Today&apos;s schedule</h2>
										<span className="text-xs text-gray-500">Local time</span>
									</div>
									<ul className="divide-y divide-gray-100">
										{todayRoutines.length === 0 && <li className="py-3 text-sm text-gray-600">No routines scheduled for today.</li>}
										{todayRoutines.map((item) => (
											<li key={item._id || item.id || item.startTime} className="py-3 flex items-start justify-between gap-3">
												<div>
													<p className="text-sm font-semibold text-gray-900">{item.className || item.classGroup || "Class"}</p>
													<p className="text-xs text-gray-500">
														{item.subject}
														{item.room ? ` · Room ${item.room}` : ""}
													</p>
												</div>
												<div className="text-right">
													<p className="text-sm font-semibold text-gray-900">
														{item.startTime} – {item.endTime}
													</p>
												</div>
											</li>
										))}
									</ul>
								</div>

								<div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
									<h2 className="text-base font-semibold text-gray-900 mb-3">Recent notices</h2>
									<ul className="space-y-2">
										{recentNoticesUi.length === 0 && <li className="text-sm text-gray-600">No notices yet.</li>}
										{recentNoticesUi.map((notice) => (
											<li
												key={notice.id || `${notice.title}-${notice.date}`}
												className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 cursor-pointer hover:border-blue-200 hover:bg-blue-50 transition"
												onClick={() => {
													setActive("notices");
												}}
											>
												<p className="text-sm font-semibold text-gray-900">{notice.title}</p>
												<p className="text-xs text-gray-600">
													{notice.audience} {notice.date ? `· ${notice.date}` : ""}
												</p>
											</li>
										))}
									</ul>
								</div>
							</div>

							<div className="space-y-4">
								<div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
									<h2 className="text-base font-semibold text-gray-900 mb-3">Messages</h2>
									<ul className="space-y-2">
										{recentMessagesUi.length === 0 && <li className="text-sm text-gray-600">No messages yet.</li>}
										{recentMessagesUi.map((msg, idx) => (
											<li
												key={`${msg.from}-${idx}`}
												className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 cursor-pointer hover:border-blue-200 hover:bg-blue-50 transition"
												onClick={() => {
													setActive("messages");
													if (msg.id) setSelectedMessageId(msg.id);
												}}
											>
												<p className="text-sm font-semibold text-gray-900">{msg.from}</p>
												<p className="text-xs text-gray-600 line-clamp-2">{msg.snippet}</p>
											</li>
										))}
									</ul>
								</div>

								<div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
									<h2 className="text-base font-semibold text-gray-900 mb-3">Quick tasks</h2>
									<ul className="space-y-2 text-sm text-gray-700">
										{quickTasks.length === 0 && <li className="text-gray-600">No open tasks.</li>}
										{quickTasks.map((task) => (
											<li key={task.id} className="flex items-start justify-between gap-3 rounded-lg px-2 py-1 hover:bg-blue-50 cursor-pointer transition" onClick={() => setActive("todo")}>
												<div className="flex items-start gap-2">
													<span className="mt-1 h-2 w-2 rounded-full bg-[#0094da]" />
													<span>{task.title}</span>
												</div>
												<span className="text-xs font-medium text-gray-700 bg-[#0094da] px-2 py-0.5 rounded-full">{task.status === "in-progress" ? "Running" : "Open"}</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					</section>
				)}

				{active === "classes" && (
					<section className="space-y-6">
						{teacherError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{teacherError}</div>}
						{loadingTeacher && <div className="text-sm text-gray-600">Loading classes...</div>}

						<div className="flex flex-col lg:flex-row gap-6">
							{/* Main Routine Area - Priority */}
							<div className="flex-1 space-y-5">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="text-xl font-bold text-gray-900">Weekly Schedule</h2>
										<p className="text-sm text-gray-500">Your planned teaching routines for the week</p>
									</div>
									{routinesLoading && (
										<div className="flex items-center gap-2 text-sm text-blue-600">
											<div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
											Refreshing...
										</div>
									)}
								</div>

								{routinesError && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">{routinesError}</div>}

								<div className="grid gap-4 md:grid-cols-2">
									{!routinesLoading && routinesByDay.every((d) => d.items.length === 0) && (
										<div className="md:col-span-2 bg-white rounded-xl border-2 border-dashed border-gray-100 p-12 text-center text-gray-500">
											<CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
											<p>No routines found in the official timetable.</p>
										</div>
									)}
									{routinesByDay.map((day) => (
										<div key={day.day} className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
											<div className="bg-gray-50/50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
												<p className="text-sm font-bold text-gray-900 uppercase tracking-widest">{day.day}</p>
												<span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded font-medium text-gray-400">{day.items.length} sessions</span>
											</div>
											<div className="p-3 space-y-2 flex-1">
												{day.items.length === 0 && <p className="text-xs text-center py-6 text-gray-400 italic">No classes today</p>}
												{day.items.map((item) => (
													<div key={item._id || item.id} className="group relative flex items-center justify-between gap-3 rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-200 px-4 py-3 border border-transparent hover:border-[#0094da]">
														<div className="absolute left-0 top-3 bottom-3 w-1 bg-[#0094da] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
														<div className="flex-1">
															<p className="text-sm font-bold text-gray-900">{item.className}</p>
															<div className="flex items-center gap-2 mt-0.5">
																<span className="text-[11px] font-medium text-[#0094da] bg-[#0094da] px-1.5 py-0.5 rounded">{item.subject}</span>
																{item.room && <span className="text-[11px] text-gray-400">· Room {item.room}</span>}
															</div>
														</div>
														<div className="text-right">
															<p className="text-xs font-bold text-gray-900 bg-white border border-gray-100 px-2 py-1 rounded-md shadow-sm">{item.startTime}</p>
															<p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">to {item.endTime}</p>
														</div>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Sidebar Details - Corner Items */}
							<div className="lg:w-72 space-y-6">
								{/* Assigned Classes Corner Card */}
								<div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">My Clusters</h3>
										<UserCheck className="w-4 h-4 text-emerald-500" />
									</div>
									<div className="space-y-3">
										{assignedClasses.length === 0 && !loadingTeacher && <p className="text-xs text-gray-500 italic">Finding your classes...</p>}
										{assignedClasses.map((cls) => (
											<div key={cls.name} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-gray-50 hover:bg-emerald-50 transition border border-transparent hover:border-emerald-100 group">
												<div className="flex-1 min-w-0">
													<p className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-700">{cls.name}</p>
													<p className="text-[10px] text-gray-400">{cls.students} students</p>
												</div>
												{cls.homeroom && <span className="shrink-0 text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">HR</span>}
											</div>
										))}
									</div>
								</div>

								{/* Subjects Corner Card */}
								<div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 text-center">
									<div className="flex items-center justify-center gap-2 mb-3">
										<GraduationCap className="w-4 h-4 text-blue-500" />
										<h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Expertise</h3>
									</div>
									<div className="flex flex-wrap justify-center gap-1.5">
										{teacherSubjects.length === 0 && !loadingTeacher && <p className="text-xs text-gray-500">Profiling...</p>}
										{teacherSubjects.map((subj) => (
											<span key={subj} className="text-[10px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 hover:bg-blue-600 hover:text-white transition duration-300">
												{subj}
											</span>
										))}
									</div>
								</div>
							</div>
						</div>
					</section>
				)}

				{active === "attendance" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
								<p className="text-sm text-gray-700">Mark today, save records, and notify guardians of absences.</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<button onClick={saveAttendanceRecords} disabled={savingAttendance || students.length === 0 || existingAttendance.taken} className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${savingAttendance || students.length === 0 || existingAttendance.taken ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
									{existingAttendance.taken ? "Already saved" : savingAttendance ? "Saving..." : "Save attendance"}
								</button>
								<button onClick={sendAbsenceEmails} disabled={sendingAttendance || absentStudents.length === 0} className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${sendingAttendance || absentStudents.length === 0 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-[#0094da] text-white hover:bg-[#0094da]"}`}>
									{sendingAttendance ? "Sending..." : `Email parents (${absentStudents.length})`}
								</button>
							</div>
						</div>

						{studentsError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{studentsError}</div>}
						{saveStatus.error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveStatus.error}</div>}
						{existingAttendance.taken && !saveStatus.error && <div className={`rounded-md px-4 py-3 text-sm ${editAfterSaved ? "border border-red-300 bg-red-50 text-red-800" : "border border-blue-200 bg-blue-50 text-blue-800"}`}>Attendance already saved for today.</div>}
						{saveStatus.saved && !saveStatus.error && <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Attendance saved for today.</div>}
						{emailStatus.error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{emailStatus.error}</div>}
						{emailStatus.sent && !emailStatus.error && (
							<div className="rounded-md border border-[#0094da] bg-[#0094da] px-4 py-3 text-sm text-[#0094da]">
								Sent {emailStatus.count || absentStudents.length} absence {emailStatus.count === 1 ? "email" : "emails"}.
							</div>
						)}
						{loadingStudents && <p className="text-sm text-gray-600">Loading students...</p>}
						{!loadingStudents && students.length === 0 && <p className="text-sm text-gray-600">No students available yet.</p>}

						{students.length > 0 && (
							<>
								<div className="grid gap-3 sm:grid-cols-3">
									<div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
										<p className="text-xs text-gray-500">Total</p>
										<p className="text-xl font-semibold text-gray-900">{students.length}</p>
									</div>
									<div className="rounded-lg border border-gray-100 bg-[#0094da] px-4 py-3">
										<p className="text-xs text-[#0094da]">Present</p>
										<p className="text-xl font-semibold text-[#0094da]">{presentCount}</p>
									</div>
									<div className="rounded-lg border border-gray-100 bg-amber-50 px-4 py-3">
										<p className="text-xs text-amber-700">Absent</p>
										<p className="text-xl font-semibold text-amber-800">{absentStudents.length}</p>
									</div>
								</div>

								<div className="rounded-lg border border-gray-100 bg-white shadow-sm">
									<div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
										<h3 className="text-sm font-semibold text-gray-900">Student list</h3>
										<span className="text-xs text-gray-500">Check = present</span>
									</div>
									<ul className="divide-y divide-gray-100">
										{students.map((student) => {
											const id = String(student._id);
											const present = attendance[id] !== false;
											const notified = existingAttendance.notifiedIds.has(id);
											return (
												<li key={student._id} className="px-4 py-3">
													<label className="flex items-start gap-3">
														<input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0094da] focus:ring-[#0094da]" checked={present} onChange={() => handleAttendanceChange(student._id)} />
														<div className="flex-1">
															<p className="text-sm font-semibold text-gray-900">{`${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unnamed"}</p>
															<p className="text-xs text-gray-600">Class {student.classGroup || "-"}</p>
															<p className="text-xs text-gray-500">
																Guardian: {student.guardianName || "-"} {student.guardianEmail ? `· ${student.guardianEmail}` : ""}
															</p>
														</div>
														<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${present ? "bg-[#0094da] text-[#0094da] border border-[#0094da]" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>{present ? "Present" : "Absent"}</span>
														{!present && notified && <span className="text-[11px] ml-2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5">Email sent</span>}
													</label>
												</li>
											);
										})}
									</ul>
								</div>
							</>
						)}
					</section>
				)}

				{active === "assignments" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
								<p className="text-sm text-gray-700">Publish homework and track what&apos;s due by class.</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<select className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700" value={assignmentFilterStatus} onChange={(e) => setAssignmentFilterStatus(e.target.value)}>
									{assignmentStatuses.map((status) => (
										<option key={status} value={status}>
											{status}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="grid gap-4 lg:grid-cols-2">
							<div className="space-y-3">
								<form onSubmit={handleCreateAssignment} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
									<h3 className="text-sm font-semibold text-gray-900">{editingAssignmentId ? "Edit Assignment" : "Add Assignment"}</h3>
									<div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4">
										<label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-3">
											<span className="font-semibold text-gray-900">Assignment Title</span>
											<input value={newAssignment.title} onChange={(e) => setNewAssignment((prev) => ({ ...prev, title: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="Assignment title" />
										</label>

										<label className="flex flex-col gap-1 text-sm text-gray-700">
											<span className="font-semibold text-gray-900">Class</span>
											<select value={newAssignment.classGroup} onChange={(e) => setNewAssignment((prev) => ({ ...prev, classGroup: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
												{(assignedClasses.length ? assignedClasses.map((c) => c.name) : ["General"]).map((cls) => (
													<option key={cls} value={cls}>
														{cls}
													</option>
												))}
											</select>
										</label>
										<label className="flex flex-col gap-1 text-sm text-gray-700">
											<span className="font-semibold text-gray-900">Subject</span>
											{availableSubjects.length ? (
												<select value={newAssignment.subject} onChange={(e) => setNewAssignment((prev) => ({ ...prev, subject: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
													{availableSubjects.map((subj) => (
														<option key={subj} value={subj}>
															{subj}
														</option>
													))}
												</select>
											) : (
												<input value={newAssignment.subject} disabled className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="Add subjects in your teacher profile" />
											)}
										</label>
										<label className="flex flex-col gap-1 text-sm text-gray-700">
											<span className="font-semibold text-gray-900">Due date</span>
											<input type="date" value={newAssignment.dueDate} onChange={(e) => setNewAssignment((prev) => ({ ...prev, dueDate: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" />
										</label>
									</div>
									<label className="flex flex-col gap-1 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Description (optional)</span>
										<textarea value={newAssignment.description} onChange={(e) => setNewAssignment((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="Instructions for students or parents" />
									</label>
									<label className="flex flex-col gap-1 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">YouTube link (optional)</span>
										<input value={newAssignment.videoLink} onChange={(e) => setNewAssignment((prev) => ({ ...prev, videoLink: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="https://youtube.com/watch?v=..." />
									</label>
									<label className="flex flex-col gap-1 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Attach files (PDF, DOC, images)</span>
										<input key={fileInputKey} type="file" multiple onChange={handleAssignmentFileChange} className="text-sm" />
										{newAssignment.files?.length > 0 && <p className="text-xs text-gray-600">{newAssignment.files.length} file(s) selected</p>}
									</label>
									<label className="flex items-center gap-2 text-sm text-gray-700">
										<input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#0094da] focus:ring-[#0094da]" checked={newAssignment.status === "Draft"} disabled={schedulePublish} onChange={(e) => setNewAssignment((prev) => ({ ...prev, status: e.target.checked ? "Draft" : "Published" }))} />
										<span>{schedulePublish ? "Draft disabled when scheduling" : "Save as draft (not visible until published)"}</span>
									</label>
									<label className="flex flex-col gap-1 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Schedule publish (optional)</span>
										<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
											<label className="inline-flex items-center gap-2 text-sm text-gray-700">
												<input
													type="checkbox"
													className="h-4 w-4 rounded border-gray-300 text-[#0094da] focus:ring-[#0094da]"
													checked={schedulePublish}
													onChange={(e) => {
														const enabled = e.target.checked;
														setSchedulePublish(enabled);
														setNewAssignment((prev) => ({
															...prev,
															scheduledPublishAt: enabled ? prev.scheduledPublishAt : "",
															status: enabled ? "Published" : prev.status,
														}));
													}}
												/>
												<span>Publish automatically later</span>
											</label>
											<input
												type="datetime-local"
												value={newAssignment.scheduledPublishAt}
												min={minPublishDateTime()}
												onFocus={() => {
													if (!schedulePublish) setSchedulePublish(true);
												}}
												onChange={(e) => {
													const value = e.target.value;
													if (!schedulePublish) setSchedulePublish(true);
													setNewAssignment((prev) => ({ ...prev, scheduledPublishAt: value }));
												}}
												className={`rounded-md border border-gray-200 px-3 py-2 text-sm transition ${schedulePublish ? "bg-white text-gray-800" : "bg-gray-50 text-gray-600"}`}
											/>
										</div>
										<span className="text-xs text-gray-500">Leave off to publish now or save as draft. Time uses your local timezone.</span>
									</label>
									<div className="flex items-center justify-between gap-3 flex-wrap">
										{createAssignmentError && <span className="text-sm text-red-700">{createAssignmentError}</span>}
										<div className="flex items-center gap-2">
											{editingAssignmentId && (
												<button
													type="button"
													onClick={() => {
														setEditingAssignmentId(null);
														setNewAssignment({ title: "", classGroup: "", subject: availableSubjects[0] || "", dueDate: "", description: "", videoLink: "", scheduledPublishAt: "", status: "Draft", files: [] });
														setSchedulePublish(false);
													}}
													className="rounded-full px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
												>
													Cancel
												</button>
											)}
											<button type="submit" disabled={creatingAssignment} className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${creatingAssignment ? "bg-gray-200 text-gray-500" : "bg-[#0094da] text-white hover:bg-[#0094da]"}`}>
												{creatingAssignment ? "Saving..." : editingAssignmentId ? "Update assignment" : "Create assignment"}
											</button>
										</div>
									</div>
								</form>
								<div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
									<p className="text-sm text-gray-700">Quick note: Draft assignments are visible only to you until you publish.</p>
								</div>
							</div>

							<div className=" space-y-3">
								{assignmentsError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{assignmentsError}</div>}
								{assignmentsLoading && <p className="text-sm text-gray-600">Loading assignments...</p>}
								{filteredAssignments.length === 0 && !assignmentsLoading && <p className="text-sm text-gray-600">No assignments match these filters.</p>}
								{filteredAssignments.length > 0 && (
									<div className="grid gap-3">
										{filteredAssignments.map((assignment) => {
											const assignmentId = assignment._id || assignment.id;
											return (
												<div key={assignmentId} className="rounded-lg border border-gray-100 bg-white shadow-sm p-4 space-y-3">
													<div className="flex items-start justify-between gap-3">
														<div className="flex flex-col">
															<div className="flex items-center justify-between gap-3">
																<p className="text-sm font-semibold text-gray-900">{assignment.title}</p>
																<div className="flex items-center gap-2">
																	<button onClick={() => handleEditAssignment(assignment)} className="p-1 text-gray-500 hover:text-blue-600 transition" title="Edit">
																		<Pencil className="w-3.5 h-3.5" />
																	</button>
																	<button onClick={() => setDeleteConfirmApt({ id: assignmentId, title: assignment.title })} className="p-1 text-gray-500 hover:text-red-600 transition" title="Delete">
																		<Trash2 className="w-3.5 h-3.5" />
																	</button>
																</div>
															</div>
															<p className="text-xs text-gray-600">
																Class {assignment.classGroup} · {assignment.subject}
															</p>
														</div>
														<span className={`text-[11px] px-2 py-0.5 rounded-full border ${assignment.status === "Published" ? "bg-[#0094da] text-[#0094da] border-[#0094da]" : assignment.status === "Done" ? "bg-gray-50 text-gray-700 border-gray-200" : assignment.status === "Scheduled" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>{assignment.status}</span>
													</div>
													<div className="flex items-center justify-between text-xs text-gray-600">
														<span>Due {formatDate(assignment.dueDate)}</span>
														<div className="flex gap-2">
															{assignment.status === "Draft" && (
																<button onClick={() => publishAssignment(assignmentId)} className="text-blue-700 font-semibold">
																	Publish
																</button>
															)}
															{assignment.status !== "Done" && (
																<button onClick={() => markComplete(assignmentId)} className="text-[#0094da] font-semibold">
																	Mark done
																</button>
															)}
														</div>
													</div>
													{assignment.scheduledPublishAt && assignment.status === "Scheduled" && <p className="text-[11px] text-blue-700">Publishes {formatDateTime(assignment.scheduledPublishAt)}</p>}
													{assignment.resources?.length > 0 && (
														<div className="text-xs text-gray-700">
															<p className="font-semibold text-gray-800">Resources</p>
															<ul className="list-disc ml-4 space-y-1">
																{assignment.resources.map((res) => {
																	const label = res.name || res.url || res;
																	const href = res.url || (typeof res === "string" ? res : "");
																	return (
																		<li key={href || label}>
																			{href ? (
																				<a className="text-blue-700 hover:underline" href={href} target="_blank" rel="noreferrer">
																					{label}
																				</a>
																			) : (
																				<span>{label}</span>
																			)}
																		</li>
																	);
																})}
															</ul>
														</div>
													)}
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</section>
				)}

				{active === "notices" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">Notices</h2>
								<p className="text-sm text-gray-700">Send updates to your class only—no school-wide blasts.</p>
							</div>
							<div className="flex flex-wrap gap-2" />
						</div>

						<div className="grid gap-4 lg:grid-cols-2">
							<form onSubmit={handleSubmitNotice} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
								<div className="flex flex-col gap-3">
									<label className="flex flex-col gap-1 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Notice title</span>
										<input value={newNotice.title} onChange={(e) => setNewNotice((prev) => ({ ...prev, title: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="e.g., Field trip reminder" />
									</label>
									<label className="flex flex-col gap-1 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Message</span>
										<textarea value={newNotice.body} onChange={(e) => setNewNotice((prev) => ({ ...prev, body: e.target.value }))} rows={4} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="Share details, links, or instructions for guardians" />
									</label>
									<label className="flex flex-col gap-1 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Attach image (optional)</span>
										<input key={noticeFileInputKey} type="file" accept="image/*" onChange={handleNoticeFileChange} className="text-sm" />
										{newNotice.image && <span className="text-xs text-gray-600">{newNotice.image.name}</span>}
									</label>
								</div>
								<div className="flex items-center justify-between gap-3 flex-wrap">
									{createNoticeError && <span className="text-sm text-red-700">{createNoticeError}</span>}
									<div className="flex items-center gap-2">
										{editingNoticeId && (
											<button type="button" onClick={resetNoticeForm} className="rounded-full px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300">
												Cancel
											</button>
										)}
										<button type="submit" disabled={creatingNotice} className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${creatingNotice ? "bg-gray-200 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
											{creatingNotice ? "Saving..." : editingNoticeId ? "Update notice" : "Send notice"}
										</button>
									</div>
								</div>
							</form>

							<div className="space-y-3">
								{noticesError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{noticesError}</div>}
								{noticesLoading && <p className="text-sm text-gray-600">Loading notices...</p>}
								{filteredNotices.length === 0 && !noticesLoading && <p className="text-sm text-gray-600">No notices yet.</p>}
								{filteredNotices.length > 0 && (
									<div className="grid gap-3">
										{filteredNotices.map((notice) => {
											const hasImage = Boolean(notice.noticeimage);
											const noticeId = notice._id || notice.id;
											return (
												<div key={noticeId} className="rounded-lg border border-gray-100 bg-white shadow-sm p-4">
													<div className="flex items-start gap-3">
														{hasImage && (
															<div className="w-28 h-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
																<img src={notice.noticeimage} alt={notice.noticetitle || "Notice attachment"} className="w-full h-full object-cover" />
															</div>
														)}
														<div className="flex-1 space-y-2">
															<div className="flex items-start justify-between gap-3">
																<div>
																	<p className="text-sm font-semibold text-gray-900">{notice.noticetitle}</p>
																</div>
																<div className="flex items-center gap-2">
																	<span className="text-[11px] px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">{formatDate(notice.createdAt || notice.noticedate)}</span>
																	<button type="button" onClick={() => startEditNotice(notice)} className="text-xs font-semibold text-blue-700 hover:text-blue-900">
																		Edit
																	</button>
																	<button type="button" onClick={() => handleDeleteNotice(noticeId)} className="text-xs font-semibold text-red-700 hover:text-red-900">
																		Delete
																	</button>
																</div>
															</div>
															<p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{notice.notice}</p>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</section>
				)}

				{active === "messages" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-3">
						<h2 className="text-lg font-semibold text-gray-900">Messages</h2>
						<p className="text-sm text-gray-700">Inbox for parent questions and quick classroom updates.</p>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex flex-wrap gap-2 items-center">
								<select value={messageFilterStatus} onChange={(e) => setMessageFilterStatus(e.target.value)} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
									<option value="open">Open</option>
									<option value="closed">Resolved</option>
									<option value="all">All</option>
								</select>
								<select value={messagePriorityFilter} onChange={(e) => setMessagePriorityFilter(e.target.value)} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
									<option value="all">All priorities</option>
									<option value="normal">Normal</option>
									<option value="urgent">Urgent</option>
								</select>
								<input value={messageSearch} onChange={(e) => setMessageSearch(e.target.value)} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700" placeholder="Search parent, child, topic" />
							</div>
							<div className="flex flex-wrap gap-2">
								<button type="button" onClick={fetchMessages} className="rounded-full px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">
									Refresh inbox
								</button>
							</div>
						</div>

						{messagesError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{messagesError}</div>}
						<div className="grid gap-4 lg:grid-cols-3">
							<div className="space-y-3 lg:col-span-1">
								<div className="rounded-lg border border-gray-100 bg-gray-50 p-3 shadow-sm h-full">
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-sm font-semibold text-gray-900">Conversations</h3>
										<span className="text-xs text-gray-500">{filteredMessages.length} shown</span>
									</div>
									<div className="space-y-2 max-h-[520px] overflow-y-auto">
										{messagesLoading && <p className="text-sm text-gray-600">Loading messages...</p>}
										{!messagesLoading && filteredMessages.length === 0 && <p className="text-sm text-gray-600">No messages yet.</p>}
										{filteredMessages.map((msg) => {
											const msgId = msg._id || msg.id;
											const lastEntry = (msg.messages || []).slice(-1)[0];
											const snippet = lastEntry?.body?.slice(0, 80) || msg.message || "";
											const lastAt = formatDateTime(msg.lastMessageAt || lastEntry?.createdAt || msg.createdAt);
											const isSelected = msgId === selectedMessageId;
											return (
												<button key={msgId} type="button" onClick={() => setSelectedMessageId(msgId)} className={`w-full text-left rounded-lg border px-3 py-2 transition ${isSelected ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-100"}`}>
													<div className="flex items-start justify-between gap-2">
														<div className="space-y-1">
															<p className="text-sm font-semibold text-gray-900">{`${msg.firstName || "Parent"} ${msg.lastName || ""}`.trim()}</p>
															<p className="text-xs text-gray-600">{msg.childName ? `Child: ${msg.childName}` : "Child info pending"}</p>
															<p className="text-xs text-gray-600 line-clamp-2">{snippet}</p>
														</div>
														<div className="flex flex-col items-end gap-1 text-right">
															<span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${msg.status === "closed" ? "bg-gray-100 text-gray-700 border-gray-200" : "bg-[#0094da] text-[#0094da] border-[#0094da]"}`}>{msg.status === "closed" ? "Resolved" : "Open"}</span>
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
								<div className="rounded-lg border border-gray-100 bg-white shadow-sm p-4 min-h-[360px]">
									{selectedMessage ? (
										<div className="space-y-3">
											<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
												<div>
													<p className="text-base font-semibold text-gray-900">{`${selectedMessage.firstName || "Parent"} ${selectedMessage.lastName || ""}`.trim()}</p>
													<p className="text-xs text-gray-600">
														{selectedMessage.email} · {selectedMessage.phone}
													</p>
													<p className="text-xs text-gray-600">
														{selectedMessage.childName ? `Child: ${selectedMessage.childName}` : "Child info pending"} {selectedMessage.classGroup ? `· Class ${selectedMessage.classGroup}` : ""}
													</p>
												</div>
												<div className="flex flex-wrap gap-2 items-center">
													<span className={`text-[11px] px-2 py-0.5 rounded-full border ${selectedMessage.status === "closed" ? "bg-gray-100 text-gray-700 border-gray-200" : "bg-[#0094da] text-[#0094da] border-[#0094da]"}`}>{selectedMessage.status === "closed" ? "Resolved" : "Open"}</span>
													<span className={`text-[11px] px-2 py-0.5 rounded-full border ${selectedMessage.priority === "urgent" ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>{selectedMessage.priority === "urgent" ? "Urgent" : "Normal"}</span>
													<span className="text-[11px] px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">{selectedMessage.topic || "General"}</span>
													<a href={`mailto:${selectedMessage.email}`} className="text-xs font-semibold text-blue-700 hover:text-blue-900">
														Email
													</a>
													<a href={`tel:${selectedMessage.phone}`} className="text-xs font-semibold text-blue-700 hover:text-blue-900">
														Call
													</a>
												</div>
											</div>

											<div className="space-y-2 max-h-[360px] overflow-y-auto rounded-md border border-gray-100 bg-gray-50 p-3">
												{(selectedMessage.messages || []).map((msg, idx) => {
													const fromTeacher = msg.senderType === "teacher";
													return (
														<div key={`${msg.createdAt || idx}-${idx}`} className={`flex ${fromTeacher ? "justify-end" : "justify-start"}`}>
															<div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${fromTeacher ? "bg-blue-600 text-white" : "bg-white border border-gray-100 text-gray-900"}`}>
																<div className={`text-[11px] mb-1 ${fromTeacher ? "text-blue-100" : "text-gray-500"}`}>
																	{fromTeacher ? "You" : msg.senderName || "Parent"} · {formatDateTime(msg.createdAt || selectedMessage.createdAt)}
																</div>
																<p className="whitespace-pre-line leading-relaxed">{msg.body}</p>
															</div>
														</div>
													);
												})}
											</div>

											<div className="space-y-2">
												<label className="text-sm text-gray-700 font-semibold">Reply to parent</label>
												<textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={3} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Type a gentle update or answer" />
												<div className="flex flex-wrap gap-2 items-center">
													<button type="button" onClick={handleSendReply} disabled={sendingReply || !replyBody.trim()} className={`rounded-full px-4 py-2 text-sm font-semibold ${sendingReply || !replyBody.trim() ? "bg-gray-200 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
														{sendingReply ? "Sending..." : "Send reply"}
													</button>
													<button type="button" onClick={() => handleUpdateMessageStatus(selectedMessage.status === "closed" ? "open" : "closed")} disabled={sendingReply} className="rounded-full px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200">
														{selectedMessage.status === "closed" ? "Reopen" : "Mark resolved"}
													</button>
												</div>
											</div>
										</div>
									) : (
										<p className="text-sm text-gray-600">Select a conversation to read and reply.</p>
									)}
								</div>

								<div className="rounded-lg border border-gray-100 bg-white shadow-sm p-4">
									<h3 className="text-sm font-semibold text-gray-900 mb-2">Start a new parent message</h3>
									<form onSubmit={handleCreateParentMessage} className="space-y-3">
										<div className="grid gap-3 md:grid-cols-3">
											<label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
												<span className="font-semibold text-gray-900">Recipient (Parent of...)</span>
												<select value={newParentMessage.studentId} onChange={(e) => setNewParentMessage((prev) => ({ ...prev, studentId: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
													{studentOptions.length === 0 && <option value="">No students available</option>}
													{studentOptions.map((s) => {
														const name = `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Student";
														const guardian = s.guardianName || "Guardian";
														return (
															<option key={s._id || s.id} value={s._id || s.id}>
																{`${name} · Class ${s.classGroup || ""} · ${guardian}`}
															</option>
														);
													})}
												</select>
											</label>
											<label className="flex flex-col gap-1 text-sm text-gray-700">
												<span className="font-semibold text-gray-900">Priority</span>
												<select value={newParentMessage.priority} onChange={(e) => setNewParentMessage((prev) => ({ ...prev, priority: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
													<option value="normal">Normal</option>
													<option value="urgent">Urgent</option>
												</select>
											</label>
										</div>
										{selectedComposeStudent && (
											<p className="text-xs text-gray-600">
												Guardian: {selectedComposeStudent.guardianName || "Parent"} · Email {selectedComposeStudent.guardianEmail || "—"} · Phone {selectedComposeStudent.guardianPhone || "—"}
											</p>
										)}
										<label className="flex flex-col gap-1 text-sm text-gray-700">
											<span className="font-semibold text-gray-900">Topic (optional)</span>
											<input value={newParentMessage.topic} onChange={(e) => setNewParentMessage((prev) => ({ ...prev, topic: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="Arrival reminder, field trip note..." />
										</label>
										<label className="flex flex-col gap-1 text-sm text-gray-700">
											<span className="font-semibold text-gray-900">Message</span>
											<textarea value={newParentMessage.message} onChange={(e) => setNewParentMessage((prev) => ({ ...prev, message: e.target.value }))} rows={4} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="Friendly tone works best for RSP Norway families" />
										</label>
										<div className="flex items-center justify-between gap-3 flex-wrap">
											{messagesError && <span className="text-sm text-red-700">{messagesError}</span>}
											<button type="submit" disabled={creatingParentMessage} className={`rounded-full px-4 py-2 text-sm font-semibold ${creatingParentMessage ? "bg-gray-200 text-gray-500" : "bg-[#0094da] text-white hover:bg-[#0094da]"}`}>
												{creatingParentMessage ? "Sending..." : "Send to parent"}
											</button>
										</div>
									</form>
								</div>
							</div>
						</div>
					</section>
				)}

				{active === "gallery" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">Gallery</h2>
								<p className="text-sm text-gray-700">Upload classroom photos; parents only see the class they belong to.</p>
							</div>
							<span className="text-xs text-gray-600">Tag a class or add a category so photos show up in parent dashboards.</span>
						</div>

						{galleryError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{galleryError}</div>}
						{gallerySuccess && <div className="rounded-md border border-[#0094da] bg-[#0094da] px-4 py-3 text-sm text-[#0094da]">{gallerySuccess}</div>}

						<div className="grid gap-4 lg:grid-cols-3">
							<form onSubmit={handleSubmitGallery} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
								<label className="flex flex-col gap-1 text-sm text-gray-700">
									<span className="font-semibold text-gray-900">Class (required for class albums)</span>
									<select value={galleryForm.classId} onChange={(e) => setGalleryForm((prev) => ({ ...prev, classId: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
										{assignedClasses.length === 0 && <option value="">No classes assigned</option>}
										{assignedClasses.map((cls) => {
											const value = String(cls.id || cls._id || "");
											return (
												<option key={value || cls.name} value={value}>
													{cls.name}
												</option>
											);
										})}
									</select>
								</label>
								<label className="flex flex-col gap-1 text-sm text-gray-700">
									<span className="font-semibold text-gray-900">Category / Tag (optional if class picked)</span>
									<input value={galleryForm.category} onChange={(e) => setGalleryForm((prev) => ({ ...prev, category: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="e.g., Field trip, Art class" />
								</label>
								<label className="flex flex-col gap-1 text-sm text-gray-700">
									<span className="font-semibold text-gray-900">Photos</span>
									<input key={galleryFileInputKey} type="file" multiple accept="image/*" onChange={handleGalleryFileChange} className="text-sm" />
									{galleryForm.files.length > 0 && <span className="text-xs text-gray-600">{galleryForm.files.length} file(s) selected</span>}
								</label>
								<div className="flex items-center justify-between gap-3 flex-wrap">
									<span className="text-xs text-gray-600">Uploads save to Gallery collection.</span>
									<button type="submit" disabled={uploadingGallery || assignedClasses.length === 0} className={`rounded-full px-4 py-2 text-sm font-semibold ${uploadingGallery || assignedClasses.length === 0 ? "bg-gray-200 text-gray-500" : "bg-[#0094da] text-white hover:bg-[#0094da]"}`}>
										{uploadingGallery ? "Uploading..." : "Upload photos"}
									</button>
								</div>
							</form>

							<div className="lg:col-span-2 rounded-lg border border-gray-100 bg-white shadow-sm p-4 space-y-3">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-semibold text-gray-900">Recent uploads</h3>
									<span className="text-xs text-gray-500">{galleryItems.length} items</span>
								</div>
								{galleryLoading && <p className="text-sm text-gray-600">Loading gallery...</p>}
								{!galleryLoading && galleryItems.length === 0 && <p className="text-sm text-gray-600">No uploads yet for your classes.</p>}
								{!galleryLoading && galleryItems.length > 0 && (
									<div className="grid gap-3 sm:grid-cols-2">
										{galleryItems.map((item) => {
											const firstImage = Array.isArray(item.media) ? item.media[0] : item.media;
											const count = Array.isArray(item.media) ? item.media.length : item.media ? 1 : 0;
											const id = item._id || item.id;
											return (
												<div key={id} className="rounded-lg border border-gray-100 bg-gray-50 overflow-hidden relative">
													<button type="button" onClick={() => handleDeleteGallery(id)} disabled={galleryDeletingId === id} className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1 text-gray-700 shadow hover:bg-white" title="Delete this album">
														<X className="h-4 w-4" />
													</button>
													<div className="relative h-40 w-full bg-gray-200">{firstImage ? <img src={firstImage} alt={item.alt || item.category || "Gallery photo"} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-xs text-gray-600">No image</div>}</div>
													<div className="px-3 py-2 space-y-1">
														<div className="flex items-center justify-between text-sm text-gray-900 font-semibold">
															<span>{item.category}</span>
															<span className="text-xs text-gray-600">
																{count} photo{count === 1 ? "" : "s"}
															</span>
														</div>
														<p className="text-xs text-gray-600">Class {item.classLabel || "All"}</p>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</section>
				)}

				{active === "events" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">Events</h2>
								<p className="text-sm text-gray-700">Create class-specific events so only the right parents see them. General events stay visible to everyone.</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<button type="button" onClick={fetchClassEvents} className="rounded-full px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">
									Refresh
								</button>
								<button type="button" onClick={handleOpenEventModal} disabled={!eventClassOptions.length} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${!eventClassOptions.length ? "bg-gray-200 text-gray-500" : "bg-[#0094da] text-white hover:bg-[#0094da]"}`}>
									<Plus className="h-4 w-4" />
									Add class event
								</button>
							</div>
						</div>

						{eventsError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{eventsError}</div>}
						{!eventClassOptions.length && <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">No classes assigned yet. Class events require at least one assigned class.</div>}

						{eventsLoading && <p className="text-sm text-gray-600">Loading events...</p>}
						{!eventsLoading && events.length === 0 && <p className="text-sm text-gray-600">No events yet. Create a class event so parents can see it.</p>}

						{!eventsLoading && events.length > 0 && (
							<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
								{[...events]
									.sort((a, b) => new Date(b.eventdate || 0).getTime() - new Date(a.eventdate || 0).getTime())
									.map((evt) => {
										const eventId = evt._id || evt.id;
										const dateLabel = evt.eventdate || "Date TBA";
										// const timeLabel = evt.eventtime || "Time TBA";
										const venueLabel = evt.eventvenue || "Venue TBA";
										// const classLabel = evt.classLabel || evt.classId?.name || "General";
										return (
											<div key={eventId} className="rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm flex flex-col gap-3">
												<div className="flex items-start justify-between gap-3">
													<div className="flex flex-col items-center gap-2 text-xs text-gray-600">
														{/* <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-800">
															<MapPin className="h-3 w-3" /> Class {classLabel}
														</span> */}
														<span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2 py-1 border border-blue-100">
															<CalendarDays className="h-3 w-3" /> {dateLabel}
														</span>
														{/* <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-1 border border-amber-100">
															<Clock className="h-3 w-3" /> {timeLabel}
														</span> */}
													</div>
													<div className="flex items-center gap-2">
														<button type="button" onClick={() => handleEditEvent(evt)} disabled={!eventClassOptions.length} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-800 hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed">
															<Pencil className="h-3 w-3" />
														</button>
														<button type="button" onClick={() => handleDeleteEvent(eventId)} disabled={eventDeletingId === eventId} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60">
															<Trash2 className="h-3 w-3" />
														</button>
													</div>
												</div>
												<div className="space-y-1">
													<p className="text-base font-semibold text-gray-900 leading-tight">{evt.eventname}</p>
													<p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{evt.eventdescription || "No description provided."}</p>
													<p className="text-xs text-gray-600">{venueLabel}</p>
												</div>
											</div>
										);
									})}
							</div>
						)}
					</section>
				)}

				{eventModalOpen && (
					<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
						<div className="w-full max-w-5xl rounded-xl bg-white shadow-xl p-6 space-y-4">
							<div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
								<div>
									<h3 className="text-lg font-semibold text-gray-900">{eventToEdit ? "Edit class event" : "Create class event"}</h3>
									<p className="text-sm text-gray-600">Events save to the shared collection and are visible to the assigned class in parent dashboards.</p>
								</div>
								<button type="button" onClick={handleCloseEventModal} className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
									<X className="h-5 w-5" />
								</button>
							</div>
							<EventForm handleCloseEventModal={handleCloseEventModal} eventToEdit={eventToEdit} classOptions={eventClassOptions} defaultClassId={eventClassOptions[0]?.id || ""} requireClass />
						</div>
					</div>
				)}

				{active === "todo" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">To-Do list</h2>
								<p className="text-sm text-gray-700">Plan lessons, reminders, and quick actions. Filter by status, priority, or class.</p>
							</div>
							<div className="flex flex-wrap gap-2 text-xs">
								<span className="rounded-full bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1">Open: {todos.filter((t) => (t.status || "open") === "open").length}</span>
								<span className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1">In progress: {todos.filter((t) => (t.status || "open") === "in-progress").length}</span>
								<span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1">Done: {todos.filter((t) => (t.status || "open") === "done").length}</span>
							</div>
						</div>

						{todosError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{todosError}</div>}
						{todosLoading && <div className="text-sm text-gray-600">Loading tasks...</div>}

						<div className="grid gap-4 lg:grid-cols-3">
							<div className="lg:col-span-1 rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
								<h3 className="text-sm font-semibold text-gray-900">Add task</h3>
								<form onSubmit={handleCreateTodo} className="space-y-3">
									<label className="flex flex-col gap-1 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Title</span>
										<input value={todoForm.title} onChange={(e) => setTodoForm((prev) => ({ ...prev, title: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="e.g. Prep Friday art class" />
									</label>
									<label className="flex flex-col gap-1 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Description</span>
										<textarea value={todoForm.description} onChange={(e) => setTodoForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="Add context, links, or materials" />
									</label>
									<div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
										<label className="flex flex-col gap-1">
											<span className="font-semibold text-gray-900">Due date</span>
											<input type="date" value={todoForm.dueDate} onChange={(e) => setTodoForm((prev) => ({ ...prev, dueDate: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" />
										</label>
										<label className="flex flex-col gap-1">
											<span className="font-semibold text-gray-900">Priority</span>
											<select value={todoForm.priority} onChange={(e) => setTodoForm((prev) => ({ ...prev, priority: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
												<option value="low">Low</option>
												<option value="normal">Normal</option>
												<option value="high">High</option>
											</select>
										</label>
									</div>
									<label className="flex flex-col gap-1 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Class (optional)</span>
										<select value={todoForm.classId} onChange={(e) => setTodoForm((prev) => ({ ...prev, classId: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
											<option value="">All classes</option>
											{assignedClasses.map((cls) => (
												<option key={cls.id} value={cls.id}>
													{cls.name}
												</option>
											))}
										</select>
									</label>
									<label className="flex flex-col gap-1 text-sm text-gray-700">
										<span className="font-semibold text-gray-900">Tags (comma separated)</span>
										<input value={todoForm.tags} onChange={(e) => setTodoForm((prev) => ({ ...prev, tags: e.target.value }))} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="materials, parents, follow-up" />
									</label>
									<button type="submit" disabled={savingTodo} className={`w-full rounded-full px-4 py-2 text-sm font-semibold ${savingTodo ? "bg-gray-200 text-gray-500" : "bg-[#0094da] text-white hover:bg-[#0094da]"}`}>
										{savingTodo ? "Saving..." : "Add task"}
									</button>
								</form>
							</div>

							<div className="lg:col-span-2 rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-4">
								<div className="flex flex-wrap items-center gap-2">
									<select value={todoFilterStatus} onChange={(e) => setTodoFilterStatus(e.target.value)} className="rounded-full border border-gray-200 px-3 py-1 text-xs">
										<option value="all">All</option>
										<option value="open">Open</option>
										<option value="in-progress">In progress</option>
										<option value="done">Done</option>
									</select>
									<select value={todoFilterPriority} onChange={(e) => setTodoFilterPriority(e.target.value)} className="rounded-full border border-gray-200 px-3 py-1 text-xs">
										<option value="all">Any priority</option>
										<option value="high">High</option>
										<option value="normal">Normal</option>
										<option value="low">Low</option>
									</select>
									<input value={todoSearch} onChange={(e) => setTodoSearch(e.target.value)} className="rounded-full border border-gray-200 px-3 py-1 text-xs flex-1 min-w-[180px]" placeholder="Search title, notes, tags" />
								</div>

								{filteredTodos.length === 0 && <div className="text-sm text-gray-600">No tasks yet. Add your first to-do.</div>}

								<div className="grid gap-3 md:grid-cols-2">
									{filteredTodos.map((todo) => {
										const status = todo.status || "open";
										const priority = todo.priority || "normal";
										const dueLabel = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : "No due date";
										const overdue = todo.dueDate ? new Date(todo.dueDate).getTime() < Date.now() && status !== "done" : false;
										return (
											<div key={todo._id || todo.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm space-y-3">
												{/* Row 1: Title and Status Dropdown */}
												<div className="flex items-center justify-between gap-4">
													<p className="text-sm font-semibold text-gray-900 truncate flex-1">{todo.title}</p>
													<div className="flex items-center gap-2">
														<select value={status} onChange={(e) => handleToggleTodo(todo._id || todo.id, e.target.value)} className="rounded-full border border-gray-200 px-3 py-1 text-xs bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0094da]">
															<option value="open">Open</option>
															<option value="in-progress">In progress</option>
															<option value="done">Done</option>
														</select>
													</div>
												</div>

												{/* Row 2: Content (Full Width) */}
												<div className="space-y-2 w-full">
													{todo.description && <p className="text-xs text-gray-700 leading-relaxed">{todo.description}</p>}

													<div className="flex flex-col gap-1.5 text-[11px] text-gray-600">
														<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
															<span className={`flex items-center gap-1 ${overdue ? "text-red-600 font-semibold" : ""}`}>
																<Clock className="h-3 w-3" /> {dueLabel}
															</span>
															<span className={`inline-flex items-center gap-1 capitalize ${priority === "high" ? "text-red-600 font-semibold" : "text-gray-500"}`}>Priority: {priority}</span>
															{todo.classId && <span className="text-[#0094da] font-semibold">Assigned: {assignedClasses.find((c) => c.id === todo.classId || c._id === todo.classId)?.name || "Class"}</span>}
														</div>

														{Array.isArray(todo.tags) && todo.tags.length > 0 && (
															<p className="text-gray-600 italic">
																<span className="font-semibold not-italic">Keywords:</span> {todo.tags.join(", ")}
															</p>
														)}
													</div>
												</div>

												{/* Actions */}
												<div className="flex items-center justify-end pt-2 border-t border-gray-100/50">
													<button type="button" onClick={() => handleDeleteTodo(todo._id || todo.id)} className="text-[11px] font-medium text-red-600 hover:text-red-700 transition">
														Delete Task
													</button>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</section>
				)}

				{active === "profile" && (
					<section className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-3">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">Profile</h2>
								<p className="text-sm text-gray-700">View and update your teacher details.</p>
							</div>
							<div className="flex items-center gap-2 text-xs">
								{teacherProfile?.status && <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1">Status: {teacherProfile.status}</span>}
								{teacherProfile?.employeeId && <span className="rounded-full bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1">ID: {teacherProfile.employeeId}</span>}
							</div>
						</div>

						{teacherError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{teacherError}</div>}
						{profileError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{profileError}</div>}
						{profileSuccess && <div className="rounded-md border border-[#0094da] bg-[#0094da] px-3 py-2 text-sm text-[#0094da]">{profileSuccess}</div>}
						{loadingTeacher && <div className="text-sm text-gray-600">Loading profile...</div>}

						{teacherProfile && (
							<div className="space-y-4">
								<div className="rounded-lg border border-gray-100 bg-gray-50 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div className="flex items-center gap-3">
										<div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#0094da] to-emerald-400 text-white flex items-center justify-center text-lg font-bold overflow-hidden">{teacherProfile.avatarUrl ? <img src={teacherProfile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : (teacherProfile.firstName || "").charAt(0).toUpperCase()}</div>
										<div>
											<p className="text-base font-semibold text-gray-900">{`${teacherProfile.firstName || ""} ${teacherProfile.lastName || ""}`.trim()}</p>
											<p className="text-sm text-gray-700">{teacherProfile.designation || "Teacher"}</p>
											<p className="text-xs text-gray-500">{teacherProfile.email}</p>
										</div>
									</div>
									<div className="flex flex-wrap gap-2 text-xs text-gray-700">
										<span className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1">Experience: {teacherProfile.yearsOfExperience ?? 0} yrs</span>
										{teacherProfile.hireDate && <span className="rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1">Hired: {new Date(teacherProfile.hireDate).toLocaleDateString()}</span>}
										{teacherProfile.dateOfBirth && <span className="rounded-full bg-amber-50 border border-amber-100 text-amber-800 px-3 py-1">DOB: {new Date(teacherProfile.dateOfBirth).toLocaleDateString()}</span>}
									</div>
								</div>

								<div className="grid gap-4 lg:grid-cols-2">
									<div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-3">
										<h3 className="text-sm font-semibold text-gray-900">Contact & About</h3>
										<div className="space-y-2 text-sm text-gray-700">
											<p>
												<span className="font-semibold">Phone:</span> {teacherProfile.phone || "Not set"}
											</p>
											<p>
												<span className="font-semibold">Address:</span> {teacherProfile.address || "Not set"}
											</p>
											<p>
												<span className="font-semibold">Qualifications:</span> {teacherProfile.qualifications || "Not set"}
											</p>
											<p className="leading-relaxed">
												<span className="font-semibold">Bio:</span> {teacherProfile.bio || "No bio added yet."}
											</p>
										</div>
									</div>

									<div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-3">
										<h3 className="text-sm font-semibold text-gray-900">Classes & Subjects</h3>
										<div className="space-y-2 text-sm text-gray-700">
											<div>
												<p className="font-semibold text-xs text-gray-600 uppercase tracking-wide mb-1">Classes</p>
												<div className="flex flex-wrap gap-2">
													{assignedClasses.length === 0 && <span className="text-xs text-gray-500">No classes assigned</span>}
													{assignedClasses.map((cls) => (
														<span key={cls.id} className="rounded-full bg-[#0094da] text-[#0094da] border border-[#0094da] px-3 py-1 text-xs">
															{cls.name} {cls.room ? `(${cls.room})` : ""}
														</span>
													))}
												</div>
											</div>
											<div>
												<p className="font-semibold text-xs text-gray-600 uppercase tracking-wide mb-1">Subjects</p>
												<div className="flex flex-wrap gap-2">
													{teacherSubjects.length === 0 && <span className="text-xs text-gray-500">No subjects listed</span>}
													{teacherSubjects.map((subj) => (
														<span key={subj} className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 text-xs">
															{subj}
														</span>
													))}
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-3">
									<h3 className="text-sm font-semibold text-gray-900">Edit profile</h3>
									<form onSubmit={handleSaveProfile} className="grid gap-3 md:grid-cols-2">
										<label className="flex flex-col gap-1 text-sm text-gray-700">
											<span className="font-semibold text-gray-900">Phone</span>
											<input value={profileForm.phone} onChange={(e) => handleProfileFieldChange("phone", e.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" />
										</label>
										<label className="flex flex-col gap-1 text-sm text-gray-700">
											<span className="font-semibold text-gray-900">Years of experience</span>
											<input type="number" min="0" value={profileForm.yearsOfExperience} onChange={(e) => handleProfileFieldChange("yearsOfExperience", e.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" />
										</label>
										<label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
											<span className="font-semibold text-gray-900">Qualifications</span>
											<input value={profileForm.qualifications} onChange={(e) => handleProfileFieldChange("qualifications", e.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="e.g. B.Ed, M.Ed" />
										</label>
										<label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
											<span className="font-semibold text-gray-900">Bio</span>
											<textarea value={profileForm.bio} onChange={(e) => handleProfileFieldChange("bio", e.target.value)} rows={3} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="Tell parents about your teaching approach" />
										</label>
										<label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
											<span className="font-semibold text-gray-900">Address</span>
											<input value={profileForm.address} onChange={(e) => handleProfileFieldChange("address", e.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" />
										</label>
										<label className="flex flex-col gap-1 text-sm text-gray-700">
											<span className="font-semibold text-gray-900">Emergency contact name</span>
											<input value={profileForm.emergencyContactName} onChange={(e) => handleProfileFieldChange("emergencyContactName", e.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" />
										</label>
										<label className="flex flex-col gap-1 text-sm text-gray-700">
											<span className="font-semibold text-gray-900">Emergency contact phone</span>
											<input value={profileForm.emergencyContactPhone} onChange={(e) => handleProfileFieldChange("emergencyContactPhone", e.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" />
										</label>
										<label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
											<span className="font-semibold text-gray-900">Avatar image URL</span>
											<input value={profileForm.avatarUrl} onChange={(e) => handleProfileFieldChange("avatarUrl", e.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" placeholder="https://..." />
										</label>
										<div className="md:col-span-2 flex items-center justify-end gap-3">
											<button type="submit" disabled={savingProfile} className={`rounded-full px-4 py-2 text-sm font-semibold ${savingProfile ? "bg-gray-200 text-gray-500" : "bg-[#0094da] text-white hover:bg-[#0094da]"}`}>
												{savingProfile ? "Saving..." : "Save profile"}
											</button>
										</div>
									</form>
								</div>
							</div>
						)}
					</section>
				)}
				{active === "appointments" && (
					<section className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-bold text-gray-900">Appointments</h2>
							<div className="flex gap-2">
								<button onClick={handleSyncCalendar} className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition shadow-sm">
									<Calendar className="w-4 h-4 text-gray-500" />
									Save to my Calendar
								</button>
							</div>
						</div>

						{appointmentsError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{appointmentsError}</div>}

						{appointmentsLoading && <div className="text-center py-8 text-gray-500">Loading appointments...</div>}
						{!appointmentsLoading && appointments.length === 0 && (
							<div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
								<div className="w-12 h-12 bg-[#0094da] rounded-full flex items-center justify-center mx-auto mb-3">
									<Clock className="w-6 h-6 text-[#0094da]" />
								</div>
								<h3 className="text-lg font-medium text-gray-900 mb-1">No appointments yet</h3>
								<p className="text-gray-500">You don&apos;t have any pending or upcoming appointments.</p>
							</div>
						)}

						{["pending", "proposed", "scheduled", "confirmed"].map((statusGroup) => {
							const groupApps = appointments.filter((a) => (statusGroup === "scheduled" ? a.status === "scheduled" || a.status === "confirmed" : statusGroup === "pending" ? a.status === "pending" || a.status === "requested" : a.status === statusGroup));
							if (statusGroup === "confirmed") return null; // already handled with scheduled

							if (groupApps.length === 0) return null;

							return (
								<div key={statusGroup} className="space-y-3">
									<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{statusGroup === "pending" ? "Needs Action" : statusGroup === "proposed" ? "Awaiting Acceptance" : "Upcoming"}</h3>
									<div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
										{groupApps.map((apt) => (
											<div key={apt._id || apt.id} className="p-5 hover:bg-gray-50 transition">
												<div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-2">
															<span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${apt.status === "pending" || apt.status === "requested" ? "bg-amber-100 text-amber-700" : apt.status === "confirmed" || apt.status === "scheduled" ? "bg-[#0094da] text-[#0094da]" : apt.status === "proposed" ? "bg-blue-100 text-blue-700" : apt.status === "completed" ? "bg-gray-100 text-gray-500" : "bg-gray-100 text-gray-700"}`}>{apt.status}</span>
															<span className="text-sm font-medium text-gray-900">
																{new Date(apt.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at {apt.time}
															</span>
														</div>
														<h4 className="text-base font-medium text-gray-900 mb-1">{apt.topic || "Teacher Meeting"}</h4>
														<div className="flex flex-wrap gap-4 text-sm text-gray-600">
															<div className="flex items-center gap-1.5">
																<UserCheck className="w-4 h-4 text-gray-400" />
																<span>
																	Parent: {apt.name || (apt.parentId && apt.parentId.fullName) || "Parent"} ({apt.phone || (apt.parentId && apt.parentId.phone) || "No phone"})
																</span>
															</div>
															<div className="flex items-center gap-1.5">
																<GraduationCap className="w-4 h-4 text-gray-400" />
																<span>
																	Student: {apt.studentId?.firstName} {apt.studentId?.lastName} ({apt.studentId?.classGroup})
																</span>
															</div>
														</div>
														{apt.reason && (
															<div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600 border border-gray-100">
																<span className="font-medium mr-1">{apt.status === "rejected" ? "Reason:" : "Note:"}</span> {apt.reason}
															</div>
														)}
													</div>

													<div className="flex items-center gap-2">
														{(apt.status === "pending" || apt.status === "requested") && (
															<>
																<button onClick={() => handleAppointmentStatus(apt._id || apt.id, "confirmed")} disabled={submittingAppointment} className="px-3 py-1.5 bg-[#0094da] text-white text-sm font-semibold rounded-lg hover:bg-[#0094da] transition disabled:opacity-50">
																	Accept
																</button>
																<button onClick={() => setAppointmentAction({ type: "propose", id: apt._id || apt.id })} className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition">
																	Reschedule
																</button>
																<button onClick={() => setAppointmentAction({ type: "reject", id: apt._id || apt.id })} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition">
																	Reject
																</button>
															</>
														)}

														{(apt.status === "confirmed" || apt.status === "scheduled") && (
															<button
																onClick={() => {
																	if (confirm("Mark this appointment as completed?")) {
																		handleAppointmentStatus(apt._id || apt.id, "completed");
																	}
																}}
																disabled={submittingAppointment}
																className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
															>
																<UserCheck className="w-4 h-4" />
																Mark Completed
															</button>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							);
						})}
					</section>
				)}

				{/* Status Modals */}
				{appointmentAction.type && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
						<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
							<h3 className="text-lg font-bold text-gray-900 mb-4">{appointmentAction.type === "reject" ? "Reject Appointment" : "Propose New Time"}</h3>

							<div className="space-y-4">
								{appointmentAction.type === "propose" && (
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-1">
											<label className="text-sm font-medium text-gray-700">New Date</label>
											<input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]" value={appointmentForm.date} onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })} />
										</div>
										<div className="space-y-1">
											<label className="text-sm font-medium text-gray-700">New Time</label>
											<input type="time" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]" value={appointmentForm.time} onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })} />
										</div>
									</div>
								)}
								<div className="space-y-1">
									<label className="text-sm font-medium text-gray-700">{appointmentAction.type === "reject" ? "Reason for Rejection" : "Reason / Note"}</label>
									<textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]" rows={3} placeholder="Add a note..." value={appointmentForm.reason} onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}></textarea>
								</div>
							</div>

							<div className="mt-6 flex justify-end gap-3">
								<button
									onClick={() => {
										setAppointmentAction({ type: null, id: null });
										setAppointmentForm({ reason: "", date: "", time: "" });
									}}
									className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
									disabled={submittingAppointment}
								>
									Cancel
								</button>
								<button
									onClick={() => {
										if (appointmentAction.type === "propose") {
											handleAppointmentStatus(appointmentAction.id, "proposed", {
												reason: appointmentForm.reason,
												date: appointmentForm.date,
												time: appointmentForm.time,
											});
										} else {
											handleAppointmentStatus(appointmentAction.id, "rejected", {
												reason: appointmentForm.reason,
											});
										}
									}}
									disabled={submittingAppointment || (appointmentAction.type === "propose" && (!appointmentForm.date || !appointmentForm.time))}
									className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition ${appointmentAction.type === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-[#0094da] hover:bg-[#0094da]"}`}
								>
									{submittingAppointment ? "Processing..." : appointmentAction.type === "reject" ? "Reject Request" : "Send Proposal"}
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Delete Assignment Confirmation Modal */}
				{deleteConfirmApt && (
					<div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
						<div className="w-full max-w-md rounded-xl bg-white shadow-xl p-6 text-center space-y-4">
							<div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
								<Trash2 className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">Delete Assignment?</h3>
								<p className="text-sm text-gray-600 mt-1">
									Are you sure you want to delete <span className="font-bold">&quot;{deleteConfirmApt.title}&quot;</span>? This action cannot be undone.
								</p>
							</div>
							<div className="flex gap-3 justify-center pt-2">
								<button onClick={() => setDeleteConfirmApt(null)} className="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition">
									No, keep it
								</button>
								<button onClick={() => handleDeleteAssignment(deleteConfirmApt.id)} className="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition">
									Yes, delete
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
