"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Clock, MapPin, Loader2, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventItem {
	_id: string;
	eventname: string;
	eventdate: string;
	eventtime?: string;
	eventvenue?: string;
}

interface RegistrationItem {
	eventId: string;
	checkedIn: boolean;
	checkedInAt?: string;
}

interface MemberAttendanceCardProps {
	memberId: string;
	memberEmail: string;
	memberName: string;
	events: EventItem[];
	initialRegistrations: RegistrationItem[];
	isAdmin: boolean;
}

export default function MemberAttendanceCard({
	memberId,
	memberName,
	events,
	initialRegistrations,
	isAdmin,
}: MemberAttendanceCardProps) {
	const [registrations, setRegistrations] = useState<Record<string, { checkedIn: boolean; checkedInAt?: string }>>(() => {
		const map: Record<string, { checkedIn: boolean; checkedInAt?: string }> = {};
		for (const reg of initialRegistrations) {
			map[reg.eventId] = { checkedIn: reg.checkedIn, checkedInAt: reg.checkedInAt };
		}
		return map;
	});

	const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<{ eventId: string; type: "success" | "error"; message: string } | null>(null);

	const handleCheckIn = async (eventId: string) => {
		setLoadingEventId(eventId);
		setFeedback(null);
		try {
			const res = await fetch("/api/events/validate-qr", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ qrData: memberId, eventId }),
			});
			const data = await res.json();

			if (res.ok && (data.status === "success" || data.status === "already_checked_in")) {
				setRegistrations((prev) => ({
					...prev,
					[eventId]: { checkedIn: true, checkedInAt: new Date().toISOString() },
				}));
				setFeedback({
					eventId,
					type: "success",
					message: data.message || `Checked in ${memberName} successfully!`,
				});
			} else {
				setFeedback({
					eventId,
					type: "error",
					message: data.error || data.message || "Failed to complete check-in.",
				});
			}
		} catch {
			setFeedback({
				eventId,
				type: "error",
				message: "Network error occurred while recording attendance.",
			});
		} finally {
			setLoadingEventId(null);
		}
	};

	if (events.length === 0) {
		return (
			<div className="text-center py-6 text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200/60 p-4">
				<Calendar className="w-5 h-5 mx-auto text-slate-400 mb-1.5" />
				<p>No active public events scheduled for attendance tracking.</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{events.map((event) => {
				const reg = registrations[event._id];
				const isCheckedIn = Boolean(reg?.checkedIn);
				const isLoading = loadingEventId === event._id;
				const eventFeedback = feedback?.eventId === event._id ? feedback : null;

				return (
					<div
						key={event._id}
						className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3"
					>
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div className="space-y-1">
								<h4 className="text-sm font-bold text-slate-900">{event.eventname}</h4>
								<div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
									<span className="flex items-center gap-1">
										<Calendar className="w-3.5 h-3.5 text-slate-400" />
										{event.eventdate}
									</span>
									{event.eventtime && (
										<span className="flex items-center gap-1">
											<Clock className="w-3.5 h-3.5 text-slate-400" />
											{event.eventtime}
										</span>
									)}
									{event.eventvenue && (
										<span className="flex items-center gap-1">
											<MapPin className="w-3.5 h-3.5 text-slate-400" />
											{event.eventvenue}
										</span>
									)}
								</div>
							</div>

							<div className="flex items-center gap-2 self-start sm:self-center">
								{isCheckedIn ? (
									<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
										<span>Attended / Checked In</span>
									</span>
								) : isAdmin ? (
									<Button
										size="sm"
										onClick={() => handleCheckIn(event._id)}
										disabled={isLoading}
										className="h-8 text-xs bg-brand hover:bg-brand/90 text-white font-medium"
									>
										{isLoading ? (
											<Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
										) : (
											<UserCheck className="w-3.5 h-3.5 mr-1.5" />
										)}
										{isLoading ? "Recording..." : "Check In / Mark Present"}
									</Button>
								) : (
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
										Scan at Check-in Desk
									</span>
								)}
							</div>
						</div>

						{eventFeedback && (
							<div
								className={`px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
									eventFeedback.type === "success"
										? "bg-emerald-50 text-emerald-800 border border-emerald-200"
										: "bg-rose-50 text-rose-800 border border-rose-200"
								}`}
							>
								{eventFeedback.type === "success" ? (
									<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
								) : (
									<AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
								)}
								<span>{eventFeedback.message}</span>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}