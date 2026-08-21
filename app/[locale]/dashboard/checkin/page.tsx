"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, AlertTriangle, XCircle, RotateCcw, ScanLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const READER_ELEMENT_ID = "checkin-qr-reader";

type ScanStatus = "success" | "already_checked_in" | "invalid" | "error";

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
		icon: <CheckCircle2 className="w-16 h-16 text-green-600" />,
		title: "Checked In",
	},
	already_checked_in: {
		bg: "bg-amber-50",
		border: "border-amber-500",
		text: "text-amber-800",
		icon: <AlertTriangle className="w-16 h-16 text-amber-600" />,
		title: "Already Registered",
	},
	invalid: {
		bg: "bg-red-50",
		border: "border-red-500",
		text: "text-red-800",
		icon: <XCircle className="w-16 h-16 text-red-600" />,
		title: "Invalid QR Code",
	},
	error: {
		bg: "bg-red-50",
		border: "border-red-500",
		text: "text-red-800",
		icon: <XCircle className="w-16 h-16 text-red-600" />,
		title: "Something Went Wrong",
	},
};

export default function CheckInPage() {
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const processingRef = useRef(false);

	const [cameraReady, setCameraReady] = useState(false);
	const [cameraError, setCameraError] = useState("");
	const [processing, setProcessing] = useState(false);
	const [result, setResult] = useState<ScanResult | null>(null);

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

	const handleDecoded = useCallback(async (decodedText: string) => {
		if (processingRef.current) return;
		processingRef.current = true;
		setProcessing(true);
		await stopCamera();

		try {
			const res = await fetch("/api/events/validate-qr", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ qrData: decodedText }),
			});
			const data = await res.json();
			setResult(res.ok ? data : { status: data.status || "invalid", error: data.error || "Could not validate this QR code" });
		} catch {
			setResult({ status: "error", error: "Network error while validating QR code" });
		} finally {
			setProcessing(false);
		}
	}, [stopCamera]);

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
				scanner.stop().then(() => scanner.clear()).catch(() => {});
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

	const theme = result ? THEME[result.status] : null;

	return (
		<div className="space-y-6 max-w-xl mx-auto">
			<div>
				<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
					<ScanLine className="w-7 h-7 text-brand" /> Event Check-in
				</h1>
				<p className="text-gray-600 mt-1">Scan an attendee&apos;s QR code from their confirmation email to mark them as checked in.</p>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden border">
				{/* Camera view — kept mounted so html5-qrcode can reuse it, hidden while a result is shown */}
				<div className={result ? "hidden" : ""}>
					<div id={READER_ELEMENT_ID} className="w-full [&_video]:rounded-t-lg" />
					{!cameraReady && !cameraError && (
						<div className="flex items-center justify-center gap-2 p-8 text-gray-500">
							<Loader2 className="w-5 h-5 animate-spin" /> Starting camera…
						</div>
					)}
					{cameraError && (
						<div className="p-6 text-center space-y-3">
							<XCircle className="w-10 h-10 text-red-500 mx-auto" />
							<p className="text-red-700 font-medium">{cameraError}</p>
							<Button onClick={startCamera} variant="outline">
								<RotateCcw className="w-4 h-4 mr-2" /> Retry Camera
							</Button>
						</div>
					)}
					{processing && (
						<div className="flex items-center justify-center gap-2 p-4 text-gray-500 border-t">
							<Loader2 className="w-4 h-4 animate-spin" /> Validating…
						</div>
					)}
				</div>

				{/* Result panel */}
				{result && theme && (
					<div className={`p-6 border-t-4 ${theme.bg} ${theme.border}`}>
						<div className="flex flex-col items-center text-center gap-2">
							{theme.icon}
							<h2 className={`text-2xl font-bold ${theme.text}`}>{theme.title}</h2>
							{(result.message || result.error) && <p className={`${theme.text}`}>{result.message || result.error}</p>}
						</div>

						{result.registration && (
							<div className="mt-6 bg-white/70 rounded-lg p-4 space-y-3">
								<div>
									<div className="text-lg font-semibold text-gray-900">
										{result.registration.firstName} {result.registration.lastName}
									</div>
									<div className="text-xs font-mono text-gray-500">{result.registration.registrationId}</div>
								</div>

								{result.event && (
									<div className="text-sm text-gray-700 border-t pt-3 space-y-1">
										<div className="font-semibold">{result.event.eventName}</div>
										<div>{result.event.eventDate} {result.event.eventTime ? `· ${result.event.eventTime}` : ""}</div>
										{result.event.eventVenue && <div>{result.event.eventVenue}</div>}
									</div>
								)}

								<div className="text-sm text-gray-700 border-t pt-3 grid grid-cols-2 gap-x-4 gap-y-1">
									<div>Adults: <span className="font-semibold">{result.registration.adults}</span></div>
									<div>Students: <span className="font-semibold">{result.registration.students}</span></div>
									<div>Children: <span className="font-semibold">{result.registration.children}</span></div>
									<div>Elders: <span className="font-semibold">{result.registration.elders}</span></div>
									<div className="col-span-2 pt-1 border-t mt-1">Total attendees: <span className="font-semibold">{result.registration.totalAttendees}</span></div>
								</div>

								{result.registration.checkedInAt && (
									<div className="text-xs text-gray-500 border-t pt-3">
										Checked in {new Date(result.registration.checkedInAt).toLocaleString()}
										{result.registration.checkedInBy ? ` by ${result.registration.checkedInBy}` : ""}
									</div>
								)}
							</div>
						)}

						<Button onClick={handleScanNext} className="w-full mt-6 bg-brand hover:bg-brand/90">
							<ScanLine className="w-4 h-4 mr-2" /> Scan Next
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
