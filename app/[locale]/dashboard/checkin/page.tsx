"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
	CheckCircle2,
	AlertTriangle,
	XCircle,
	RotateCcw,
	ScanLine,
	Loader2,
	Download,
	Search,
	Users,
	UserCheck,
	Clock,
	Calendar,
	ArrowRight,
	Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const READER_ELEMENT_ID = "checkin-qr-reader";

type ScanStatus = "success" | "already_checked_in" | "invalid" | "error";

interface EventItem {
	_id: string;
	eventname: string;
	eventdate: string;
	eventtime?: string;
	eventvenue?: string;
}

interface RegistrationItem {
	_id: string;
	registrationId: string;
	eventId?: EventItem | string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	adults: number;
	students?: number;
	children?: number;
	elders?: number;
	totalAmount?: number;
	status: string;
	checkedIn: boolean;
	checkedInAt?: string;
	checkedInBy?: string;
	createdAt?: string;
}

interface RegistrationSummary {
	registrationId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	adults: number;
	students: number;
	children: number;
	elders: number;
	totalAttendees: number;
	status: string;
	checkedIn: boolean;
	checkedInAt?: string;
	checkedInBy?: string;
}

interface EventSummary {
	eventName: string;
	eventDate: string;
	eventTime: string;
	eventVenue: string;
}

interface ScanResult {
	status: ScanStatus;
	message?: string;
	error?: string;
	registration?: RegistrationSummary;
	event?: EventSummary;
}

const THEME: Record<ScanStatus, { bg: string; border: string; text: string; icon: JSX.Element; title: string }> = {
	success: {
		bg: "bg-green-50",
		border: "border-green-500",
		text: "text-green-800",
		icon: <CheckCircle2 className="w-14 h-14 text-green-600" />,
		title: "Checked In Successfully",
	},
	already_checked_in: {
		bg: "bg-amber-50",
		border: "border-amber-500",
		text: "text-amber-800",
		icon: <AlertTriangle className="w-14 h-14 text-amber-600" />,
		title: "Already Checked In",
	},
	invalid: {
		bg: "bg-red-50",
		border: "border-red-500",
		text: "text-red-800",
		icon: <XCircle className="w-14 h-14 text-red-600" />,
		title: "Invalid QR Code",
	},
	error: {
		bg: "bg-red-50",
		border: "border-red-500",
		text: "text-red-800",
		icon: <XCircle className="w-14 h-14 text-red-600" />,
		title: "Scan Error",
	},
};

export default function CheckInPage() {
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const processingRef = useRef(false);

	const [cameraReady, setCameraReady] = useState(false);
	const [cameraError, setCameraError] = useState("");
	const [processing, setProcessing] = useState(false);
	const [result, setResult] = useState<ScanResult | null>(null);

	// Event & Attendees state
	const [events, setEvents] = useState<EventItem[]>([]);
	const [selectedEventId, setSelectedEventId] = useState<string>("");
	const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
	const [loadingRegistrations, setLoadingRegistrations] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [attendanceFilter, setAttendanceFilter] = useState<"all" | "checked_in" | "not_checked_in">("all");
	const [lastScannedId, setLastScannedId] = useState<string | null>(null);

	// Manual check-in state
	const [manualId, setManualId] = useState("");
	const [manualLoading, setManualLoading] = useState(false);
	const [manualMessage, setManualMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	// Fetch events
	const fetchEvents = useCallback(async () => {
		try {
			const res = await fetch("/api/events");
			if (res.ok) {
				const data = await res.json();
				const eventList = Array.isArray(data) ? data : Array.isArray(data?.events) ? data.events : [];
				setEvents(eventList);
			}
		} catch (err) {
			console.error("Failed to fetch events:", err);
			setEvents([]);
		}
	}, []);

	// Fetch registrations
	const fetchRegistrations = useCallback(async (eventId?: string) => {
		setLoadingRegistrations(true);
		try {
			const query = eventId ? `?eventId=${eventId}` : "";
			const res = await fetch(`/api/events/registrations${query}`);
			if (res.ok) {
				const data = await res.json();
				const regList = Array.isArray(data) ? data : Array.isArray(data?.registrations) ? data.registrations : [];
				setRegistrations(regList);
			}
		} catch (err) {
			console.error("Failed to fetch registrations:", err);
			setRegistrations([]);
		} finally {
			setLoadingRegistrations(false);
		}
	}, []);

	useEffect(() => {
		fetchEvents();
		fetchRegistrations();
	}, [fetchEvents, fetchRegistrations]);

	const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newId = e.target.value;
		setSelectedEventId(newId);
		fetchRegistrations(newId);
	};

	const stopCamera = useCallback(async () => {
		const scanner = scannerRef.current;
		if (scanner && scanner.isScanning) {
			try {
				await scanner.stop();
			} catch {
				// ignore stop races
			}
		}
	}, []);

	const handleValidateQr = useCallback(async (qrString: string) => {
		const res = await fetch("/api/events/validate-qr", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ qrData: qrString }),
		});
		const data = await res.json();
		return { ok: res.ok, data };
	}, []);

	const handleDecoded = useCallback(
		async (decodedText: string) => {
			if (processingRef.current) return;
			processingRef.current = true;
			setProcessing(true);
			await stopCamera();

			try {
				const { ok, data } = await handleValidateQr(decodedText);
				setResult(ok ? data : { status: data.status || "invalid", error: data.error || "Could not validate this QR code" });
				if (ok && (data.status === "success" || data.status === "already_checked_in")) {
					const regId = data.registration?.registrationId;
					if (regId) setLastScannedId(regId);
					fetchRegistrations(selectedEventId);
				}
			} catch {
				setResult({ status: "error", error: "Network error while validating QR code" });
			} finally {
				setProcessing(false);
			}
		},
		[stopCamera, handleValidateQr, fetchRegistrations, selectedEventId]
	);

	const startCamera = useCallback(async () => {
		setCameraError("");
		try {
			if (!scannerRef.current) {
				scannerRef.current = new Html5Qrcode(READER_ELEMENT_ID);
			}
			await scannerRef.current.start(
				{ facingMode: "environment" },
				{ fps: 10, qrbox: { width: 260, height: 260 } },
				(decodedText) => handleDecoded(decodedText),
				() => {}
			);
			setCameraReady(true);
		} catch (err: unknown) {
			setCameraReady(false);
			setCameraError(err instanceof Error ? err.message : "Could not access the camera. Check browser permissions.");
		}
	}, [handleDecoded]);

	const handleScanNext = useCallback(() => {
		setResult(null);
		processingRef.current = false;
		startCamera();
	}, [startCamera]);

	useEffect(() => {
		startCamera();
		return () => {
			const scanner = scannerRef.current;
			if (scanner?.isScanning) {
				scanner
					.stop()
					.then(() => scanner.clear())
					.catch(() => {});
			} else if (scanner) {
				try {
					scanner.clear();
				} catch {
					// ignore
				}
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Manual check-in submission
	const handleManualCheckIn = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		const regId = manualId.trim();
		if (!regId) return;

		setManualLoading(true);
		setManualMessage(null);

		try {
			const { ok, data } = await handleValidateQr(regId);
			if (ok && data.status === "success") {
				setManualMessage({ type: "success", text: `✓ ${data.registration?.firstName} ${data.registration?.lastName} checked in!` });
				setLastScannedId(regId);
				setManualId("");
				fetchRegistrations(selectedEventId);
			} else {
				setManualMessage({ type: "error", text: data.message || data.error || "Could not check in registration ID." });
			}
		} catch {
			setManualMessage({ type: "error", text: "Network error occurred." });
		} finally {
			setManualLoading(false);
		}
	};

	// Quick check-in from table row
	const handleRowCheckIn = async (regId: string) => {
		try {
			const { ok, data } = await handleValidateQr(regId);
			if (ok && data.status === "success") {
				setLastScannedId(regId);
				fetchRegistrations(selectedEventId);
			} else {
				alert(data.message || data.error || "Could not check in this attendee.");
			}
		} catch {
			alert("Network error occurred.");
		}
	};

	// Filtered registrations
	const filteredRegistrations = useMemo(() => {
		const list = Array.isArray(registrations) ? registrations : [];
		return list.filter((reg) => {
			// Attendance filter
			if (attendanceFilter === "checked_in" && !reg.checkedIn) return false;
			if (attendanceFilter === "not_checked_in" && reg.checkedIn) return false;

			// Search filter
			if (searchTerm.trim()) {
				const term = searchTerm.toLowerCase();
				const fullName = `${reg.firstName} ${reg.lastName}`.toLowerCase();
				const email = (reg.email || "").toLowerCase();
				const phone = (reg.phone || "").toLowerCase();
				const regId = (reg.registrationId || "").toLowerCase();
				if (!fullName.includes(term) && !email.includes(term) && !phone.includes(term) && !regId.includes(term)) {
					return false;
				}
			}

			return true;
		});
	}, [registrations, attendanceFilter, searchTerm]);

	// Stats
	const stats = useMemo(() => {
		const list = Array.isArray(registrations) ? registrations : [];
		const totalRegs = list.length;
		const totalAttendees = list.reduce((sum, r) => sum + (r.adults || 0) + (r.students || 0) + (r.children || 0) + (r.elders || 0), 0);
		const checkedInRegs = list.filter((r) => r.checkedIn).length;
		const checkedInAttendees = list
			.filter((r) => r.checkedIn)
			.reduce((sum, r) => sum + (r.adults || 0) + (r.students || 0) + (r.children || 0) + (r.elders || 0), 0);

		return {
			totalRegs,
			totalAttendees,
			checkedInRegs,
			checkedInAttendees,
			remainingRegs: Math.max(0, totalRegs - checkedInRegs),
			remainingAttendees: Math.max(0, totalAttendees - checkedInAttendees),
		};
	}, [registrations]);

	// CSV Export
	const handleExportCSV = () => {
		if (filteredRegistrations.length === 0) {
			alert("No attendees to export.");
			return;
		}

		const headers = [
			"Registration ID",
			"Event Name",
			"First Name",
			"Last Name",
			"Email",
			"Phone",
			"Adults",
			"Students",
			"Children",
			"Elders",
			"Total Attendees",
			"Status",
			"Checked In",
			"Checked In At",
			"Checked In By",
		];

		const rows = filteredRegistrations.map((reg) => {
			const eventName = typeof reg.eventId === "object" ? reg.eventId?.eventname || "" : "";
			const totalPeople = (reg.adults || 0) + (reg.students || 0) + (reg.children || 0) + (reg.elders || 0);
			const checkedInAt = reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleString() : "";
			return [
				reg.registrationId || "",
				eventName,
				reg.firstName || "",
				reg.lastName || "",
				reg.email || "",
				reg.phone || "",
				reg.adults || 0,
				reg.students || 0,
				reg.children || 0,
				reg.elders || 0,
				totalPeople,
				reg.status || "",
				reg.checkedIn ? "Yes" : "No",
				checkedInAt,
				reg.checkedInBy || "",
			];
		});

		const csvContent = [headers, ...rows]
			.map((row) =>
				row
					.map((field) => {
						const str = String(field ?? "");
						if (str.includes(",") || str.includes('"') || str.includes("\n")) {
							return `"${str.replace(/"/g, '""')}"`;
						}
						return str;
					})
					.join(",")
			)
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		const eventList = Array.isArray(events) ? events : [];
		const eventName = eventList.find((e) => e._id === selectedEventId)?.eventname;
		const eventSlug = eventName ? eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "all-events";
		const dateStr = new Date().toISOString().split("T")[0];
		a.download = `attendees-${eventSlug}-${dateStr}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	};

	const theme = result ? THEME[result.status] : null;

	return (
		<div className="space-y-6 max-w-7xl mx-auto">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
						<ScanLine className="w-8 h-8 text-brand" /> Event Check-in & Attendees
					</h1>
					<p className="text-gray-600 mt-1">Scan entry QR codes, track attendance live, and export attendee lists.</p>
				</div>

				{/* Event Selector & CSV Button */}
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-sm">
						<Calendar className="w-4 h-4 text-gray-500" />
						<select value={selectedEventId} onChange={handleEventChange} className="bg-transparent text-sm font-medium text-gray-800 outline-none">
							<option value="">All Events</option>
							{(Array.isArray(events) ? events : []).map((ev) => (
								<option key={ev._id} value={ev._id}>
									{ev.eventname}
								</option>
							))}
						</select>
					</div>

					<Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2 shadow-sm bg-white">
						<Download className="w-4 h-4 text-brand" />
						Export CSV
					</Button>
				</div>
			</div>

			{/* Real-time Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-4">
					<div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
						<Users className="w-6 h-6" />
					</div>
					<div>
						<div className="text-xs uppercase font-bold text-gray-500 tracking-wider">Registered</div>
						<div className="text-2xl font-bold text-gray-900">
							{stats.totalAttendees} <span className="text-xs font-normal text-gray-500">({stats.totalRegs} bookings)</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-4">
					<div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
						<UserCheck className="w-6 h-6" />
					</div>
					<div>
						<div className="text-xs uppercase font-bold text-gray-500 tracking-wider">Checked In</div>
						<div className="text-2xl font-bold text-emerald-700">
							{stats.checkedInAttendees} <span className="text-xs font-normal text-emerald-600">({stats.checkedInRegs} bookings)</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-4">
					<div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
						<Clock className="w-6 h-6" />
					</div>
					<div>
						<div className="text-xs uppercase font-bold text-gray-500 tracking-wider">Remaining</div>
						<div className="text-2xl font-bold text-amber-700">
							{stats.remainingAttendees} <span className="text-xs font-normal text-amber-600">({stats.remainingRegs} bookings)</span>
						</div>
					</div>
				</div>
			</div>

			{/* Main Grid: Scanner Left, Attendees List Right */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				{/* ── Left Column: Scanner & Manual Lookup (4 cols) ── */}
				<div className="lg:col-span-5 space-y-6">
					<div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
						<div className="p-4 border-b bg-gray-50 flex items-center justify-between">
							<h2 className="font-semibold text-gray-900 flex items-center gap-2">
								<ScanLine className="w-4 h-4 text-brand" /> QR Scanner
							</h2>
							{cameraReady && <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">Camera Active</Badge>}
						</div>

						{/* Camera view */}
						<div className={result ? "hidden" : "p-4"}>
							<div id={READER_ELEMENT_ID} className="w-full rounded-lg overflow-hidden [&_video]:rounded-lg shadow-inner bg-black" />
							{!cameraReady && !cameraError && (
								<div className="flex items-center justify-center gap-2 p-8 text-gray-500">
									<Loader2 className="w-5 h-5 animate-spin" /> Starting camera…
								</div>
							)}
							{cameraError && (
								<div className="p-6 text-center space-y-3">
									<XCircle className="w-10 h-10 text-red-500 mx-auto" />
									<p className="text-red-700 text-sm font-medium">{cameraError}</p>
									<Button onClick={startCamera} variant="outline" size="sm">
										<RotateCcw className="w-4 h-4 mr-2" /> Retry Camera
									</Button>
								</div>
							)}
							{processing && (
								<div className="flex items-center justify-center gap-2 p-3 text-brand text-sm font-medium border-t mt-3">
									<Loader2 className="w-4 h-4 animate-spin" /> Verifying QR code…
								</div>
							)}
						</div>

						{/* Scan Result */}
						{result && theme && (
							<div className={`p-6 border-t-4 ${theme.bg} ${theme.border}`}>
								<div className="flex flex-col items-center text-center gap-2">
									{theme.icon}
									<h3 className={`text-xl font-bold ${theme.text}`}>{theme.title}</h3>
									{(result.message || result.error) && <p className={`text-sm ${theme.text}`}>{result.message || result.error}</p>}
								</div>

								{result.registration && (
									<div className="mt-5 bg-white rounded-lg p-4 shadow-sm border space-y-3">
										<div className="flex justify-between items-start">
											<div>
												<div className="text-base font-bold text-gray-900">
													{result.registration.firstName} {result.registration.lastName}
												</div>
												<div className="text-xs font-mono text-gray-500">{result.registration.registrationId}</div>
											</div>
											<Badge className="bg-emerald-600 text-white">Verified</Badge>
										</div>

										{result.event && (
											<div className="text-xs text-gray-600 border-t pt-2 space-y-0.5">
												<div className="font-semibold text-gray-800">{result.event.eventName}</div>
												<div>{result.event.eventDate} {result.event.eventTime ? `· ${result.event.eventTime}` : ""}</div>
											</div>
										)}

										<div className="text-xs text-gray-700 border-t pt-2 grid grid-cols-2 gap-x-2 gap-y-1">
											<div>Adults: <span className="font-semibold">{result.registration.adults}</span></div>
											<div>Students: <span className="font-semibold">{result.registration.students}</span></div>
											<div>Children: <span className="font-semibold">{result.registration.children}</span></div>
											<div>Elders: <span className="font-semibold">{result.registration.elders}</span></div>
											<div className="col-span-2 pt-1 border-t mt-1 font-semibold text-gray-900">
												Total Attendees: {result.registration.totalAttendees}
											</div>
										</div>

										{result.registration.checkedInAt && (
											<div className="text-[11px] text-gray-500 border-t pt-2">
												Checked in {new Date(result.registration.checkedInAt).toLocaleTimeString()}
												{result.registration.checkedInBy ? ` by ${result.registration.checkedInBy}` : ""}
											</div>
										)}
									</div>
								)}

								<Button onClick={handleScanNext} className="w-full mt-5 bg-brand hover:bg-brand/90">
									<ScanLine className="w-4 h-4 mr-2" /> Scan Next Attendee
								</Button>
							</div>
						)}
					</div>

					{/* Manual Check-in Fallback */}
					<div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-3">
						<h3 className="text-sm font-semibold text-gray-800">Manual Check-In</h3>
						<p className="text-xs text-gray-500">If QR cannot be scanned, enter the Registration ID directly (e.g. REG-XXXXX):</p>
						<form onSubmit={handleManualCheckIn} className="flex gap-2">
							<input
								type="text"
								placeholder="Registration ID"
								value={manualId}
								onChange={(e) => setManualId(e.target.value)}
								className="flex-1 border rounded-lg px-3 py-2 text-sm uppercase font-mono"
							/>
							<Button type="submit" disabled={manualLoading || !manualId.trim()} size="sm" className="bg-brand hover:bg-brand/90">
								{manualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check In"}
							</Button>
						</form>
						{manualMessage && (
							<div className={`text-xs p-2.5 rounded-lg ${manualMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
								{manualMessage.text}
							</div>
						)}
					</div>
				</div>

				{/* ── Right Column: Live Attendees List (7 cols) ── */}
				<div className="lg:col-span-7 space-y-4">
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
						{/* Table Controls */}
						<div className="p-4 border-b space-y-3">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
									<Users className="w-5 h-5 text-brand" /> Attendees List
									<span className="text-xs font-normal text-gray-500">({filteredRegistrations.length})</span>
								</h2>

								{/* Status Tabs */}
								<div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs">
									<button
										onClick={() => setAttendanceFilter("all")}
										className={`px-3 py-1.5 rounded-md font-medium transition-colors ${attendanceFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
									>
										All
									</button>
									<button
										onClick={() => setAttendanceFilter("checked_in")}
										className={`px-3 py-1.5 rounded-md font-medium transition-colors ${attendanceFilter === "checked_in" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
									>
										Checked In
									</button>
									<button
										onClick={() => setAttendanceFilter("not_checked_in")}
										className={`px-3 py-1.5 rounded-md font-medium transition-colors ${attendanceFilter === "not_checked_in" ? "bg-white text-amber-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
									>
										Pending
									</button>
								</div>
							</div>

							{/* Search input */}
							<div className="relative">
								<Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
								<input
									type="text"
									placeholder="Search attendee by name, email, phone, or REG ID..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-brand"
								/>
							</div>
						</div>

						{/* Attendees Table */}
						<div className="overflow-x-auto max-h-[600px] overflow-y-auto">
							<Table>
								<TableHeader className="bg-gray-50 sticky top-0 z-10 shadow-sm">
									<TableRow>
										<TableHead className="w-24">Reg ID</TableHead>
										<TableHead>Attendee</TableHead>
										<TableHead>Tickets</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{loadingRegistrations ? (
										<TableRow>
											<TableCell colSpan={5} className="text-center py-8 text-gray-500">
												<Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand" />
												Loading attendees...
											</TableCell>
										</TableRow>
									) : filteredRegistrations.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="text-center py-8 text-gray-500">
												No attendees found matching current filters.
											</TableCell>
										</TableRow>
									) : (
										filteredRegistrations.map((reg) => {
											const isHighlighted = lastScannedId === reg.registrationId;
											const totalTickets = (reg.adults || 0) + (reg.students || 0) + (reg.children || 0) + (reg.elders || 0);
											const eventName = typeof reg.eventId === "object" ? reg.eventId?.eventname : "";

											return (
												<TableRow
													key={reg._id}
													className={`transition-colors ${isHighlighted ? "bg-emerald-50 border-emerald-300" : ""}`}
												>
													<TableCell className="font-mono text-xs font-semibold text-gray-700">
														{reg.registrationId}
													</TableCell>
													<TableCell>
														<div className="font-medium text-gray-900">
															{reg.firstName} {reg.lastName}
														</div>
														<div className="text-xs text-gray-500">{reg.email}</div>
														{eventName && selectedEventId === "" && (
															<div className="text-[11px] text-brand font-medium line-clamp-1">{eventName}</div>
														)}
													</TableCell>
													<TableCell className="text-xs text-gray-700">
														<div className="font-semibold text-gray-900">{totalTickets} seat{totalTickets > 1 ? "s" : ""}</div>
														<div className="text-gray-500 text-[11px]">
															{reg.adults > 0 ? `${reg.adults} Ad` : ""}
															{reg.students ? ` · ${reg.students} St` : ""}
															{reg.children ? ` · ${reg.children} Ch` : ""}
															{reg.elders ? ` · ${reg.elders} El` : ""}
														</div>
													</TableCell>
													<TableCell>
														{reg.checkedIn ? (
															<div>
																<Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 gap-1 text-[11px]">
																	<Check className="w-3 h-3" /> Checked In
																</Badge>
																{reg.checkedInAt && (
																	<div className="text-[10px] text-gray-500 mt-0.5">
																		{new Date(reg.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
																	</div>
																)}
															</div>
														) : (
															<Badge variant="outline" className="text-gray-600 bg-gray-50 text-[11px]">
																Not Checked In
															</Badge>
														)}
													</TableCell>
													<TableCell className="text-right">
														{!reg.checkedIn ? (
															<Button
																onClick={() => handleRowCheckIn(reg.registrationId)}
																size="sm"
																variant="outline"
																className="text-xs border-emerald-500 text-emerald-700 hover:bg-emerald-50 h-7 px-2.5"
															>
																Check In
															</Button>
														) : (
															<span className="text-xs text-emerald-600 font-medium">✓ Attended</span>
														)}
													</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
