"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, Mail, Phone, User, Baby, School, MessageSquare, AlertCircle, Trash2, CheckCircle, Search, Info, X } from "lucide-react";
import { addAvailableDate } from "@/lib/actions-mongoose";

interface AdminDashboardProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	appointments: any[];
	onRefresh?: () => void;
}

export default function AdminDashboard({ appointments = [], onRefresh }: AdminDashboardProps) {
	const { toast } = useToast();
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [timeSlots, setTimeSlots] = useState<string[]>(["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"]);
	const [newTimeSlot, setNewTimeSlot] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [timeError, setTimeError] = useState("");
	const [existingSlots, setExistingSlots] = useState<string[]>([]);
	const [availabilityList, setAvailabilityList] = useState<any[]>([]);
	const [confirmedBookings, setConfirmedBookings] = useState<any[]>([]);
	const [showRescheduleModal, setShowRescheduleModal] = useState(false);
	const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
	const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
	const [rescheduleTime, setRescheduleTime] = useState<string>("");

	// Modal states
	const [showDateSelectionModal, setShowDateSelectionModal] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [showInfoModal, setShowInfoModal] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [selectedBooking, setSelectedBooking] = useState<any>(null);
	const [selectedDateOption, setSelectedDateOption] = useState<"preferred" | "alternate">("preferred");

	// Filter states
	const [filterPeriod] = useState<"all" | "week" | "month" | "year" | "custom">("all");
	const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
	const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
	const [searchQuery, setSearchQuery] = useState("");
	const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

	// Filter and search appointments
	const filteredAppointments = useMemo(() => {
		let filtered = [...appointments];

		if (filterPeriod !== "all") {
			const now = new Date();
			let start: Date | undefined;
			let end: Date | undefined;

			switch (filterPeriod) {
				case "week":
					start = startOfWeek(now);
					end = endOfWeek(now);
					break;
				case "month":
					start = startOfMonth(now);
					end = endOfMonth(now);
					break;
				case "year":
					start = startOfYear(now);
					end = endOfYear(now);
					break;
				case "custom":
					if (customStartDate && customEndDate) {
						start = customStartDate;
						end = customEndDate;
					}
					break;
				default:
					break;
			}

			if (start && end) {
				filtered = filtered.filter((appointment: any) => {
					const dateValue = appointment.confirmedDate || appointment.preferredDate;
					const dateObj = dateValue ? new Date(dateValue) : null;
					return dateObj ? isWithinInterval(dateObj, { start, end }) : false;
				});
			}
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((appointment: any) => {
				const searchable = [appointment.parentFirstName, appointment.parentLastName, appointment.childFirstName, appointment.childLastName, appointment.email, appointment.phone, appointment.status].filter(Boolean).map((value: string) => value.toLowerCase());

				return searchable.some((value: string) => value.includes(query));
			});
		}

		return filtered;
	}, [appointments, filterPeriod, customStartDate, customEndDate, searchQuery]);

	const toDateOnly = (date: Date | string | undefined) => {
		if (!date) return "";
		const parsed = new Date(date);
		if (Number.isNaN(parsed.getTime())) return "";
		return parsed.toISOString().split("T")[0];
	};

	const refreshAvailabilityData = useCallback(async () => {
		try {
			const response = await fetch("/api/availability");
			if (!response.ok) {
				throw new Error("Failed to load availability overview");
			}

			const data = await response.json();
			setAvailabilityList(Array.isArray(data) ? data : []);
			setConfirmedBookings(appointments.filter((a: any) => a.status === "confirmed"));
		} catch (err) {
			console.error("Failed to load availability overview", err);
		}
	}, [appointments]);

	useEffect(() => {
		setShowCustomDatePicker(filterPeriod === "custom");
	}, [filterPeriod]);

	// Load availability and confirmed bookings for overview list
	useEffect(() => {
		refreshAvailabilityData();
	}, [refreshAvailabilityData]);

	// Export to PDF
	// const exportToPDF = () => {
	// 	const printWindow = window.open("", "_blank");
	// 	if (!printWindow) return;

	// 	const html = `
	// 		<!DOCTYPE html>
	// 		<html>
	// 		<head>
	// 			<title>Tour Bookings Report - ${format(new Date(), "MMMM d, yyyy")}</title>
	// 			<style>
	// 				body { font-family: Arial, sans-serif; margin: 20px; }
	// 				h1 { color: #16a34a; text-align: center; margin-bottom: 10px; }
	// 				.subtitle { text-align: center; color: #666; margin-bottom: 30px; }
	// 				table { width: 100%; border-collapse: collapse; margin-top: 20px; }
	// 				th { background-color: #16a34a; color: white; padding: 12px; text-align: left; font-weight: bold; }
	// 				td { padding: 10px; border-bottom: 1px solid #ddd; }
	// 				tr:hover { background-color: #f5f5f5; }
	// 				.status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
	// 				.status-pending { background-color: #fef3c7; color: #92400e; }
	// 				.status-confirmed { background-color: #d1fae5; color: #065f46; }
	// 				.status-completed { background-color: #dbeafe; color: #1e40af; }
	// 				.status-cancelled { background-color: #fee2e2; color: #991b1b; }
	// 				@media print {
	// 					body { margin: 0; }
	// 					button { display: none; }
	// 				}
	// 			</style>
	// 		</head>
	// 		<body>
	// 			<h1>RSP Norway School - Tour Bookings Report</h1>
	// 			<div class="subtitle">Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</div>
	// 			<div class="subtitle">Total Bookings: ${filteredAppointments.length}</div>
	// 			<table>
	// 				<thead>
	// 					<tr>
	// 						<th>Parent Name</th>
	// 						<th>Child Name</th>
	// 						<th>Contact</th>
	// 						<th>Tour Date</th>
	// 						<th>Tour Time</th>
	// 						<th>Status</th>
	// 					</tr>
	// 				</thead>
	// 				<tbody>
	// 					${filteredAppointments
	// 			.map(
	// 				// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 				(booking: any) => `
	// 						<tr>
	// 							<td>${booking.parentFirstName} ${booking.parentLastName}</td>
	// 							<td>${booking.childFirstName} ${booking.childLastName}</td>
	// 							<td>${booking.email}<br/>${booking.phone}</td>
	// 							<td>${booking.confirmedDate ? formatAppointmentDate(booking.confirmedDate) + " ✓" : formatAppointmentDate(booking.preferredDate)}</td>
	// 							<td>${booking.confirmedTime || booking.preferredTime}</td>
	// 							<td><span class="status status-${booking.status}">${booking.status}</span></td>
	// 						</tr>
	// 					`
	// 			)
	// 			.join("")}
	// 				</tbody>
	// 			</table>
	// 		</body>
	// 		</html>
	// 	`;

	// 	printWindow.document.write(html);
	// 	printWindow.document.close();
	// 	setTimeout(() => {
	// 		printWindow.print();
	// 	}, 250);
	// };

	// Load existing time slots when date is selected
	const loadExistingTimeSlots = async (selectedDate: Date) => {
		try {
			const dateStr = toDateOnly(selectedDate);
			const response = await fetch("/api/availability");
			const availabilities = await response.json();

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const existing = availabilities.find((avail: any) => {
				return toDateOnly(avail.date) === dateStr;
			});

			if (existing && existing.timeSlots) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const existingTimes = existing.timeSlots.map((slot: any) => slot.time);
				setExistingSlots(existingTimes);
				// Merge existing slots with current selection
				const mergedSlots = [...new Set([...existingTimes, ...timeSlots])];
				setTimeSlots(mergedSlots.sort());
			} else {
				setExistingSlots([]);
			}
		} catch {
			console.error("Error loading existing time slots:");
		}
	};

	// Handle date selection
	const handleDateSelect = (selectedDate: Date | undefined) => {
		setDate(selectedDate);
		if (selectedDate) {
			loadExistingTimeSlots(selectedDate);
		} else {
			setExistingSlots([]);
		}
	};

	// Validate time format and range
	const validateTimeSlot = (time: string): boolean => {
		// Check format: HH:MM AM/PM
		const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
		if (!timeRegex.test(time)) {
			setTimeError("Invalid format. Use HH:MM AM/PM (e.g., 09:00 AM or 02:30 PM)");
			return false;
		}

		// Parse time to check if it's within allowed range (7:00 AM to 7:00 PM)
		const match = time.match(timeRegex);
		if (!match) return false;

		let hours = parseInt(match[1]);
		const minutes = parseInt(match[2]);
		const period = match[3].toUpperCase();

		// Convert to 24-hour format
		if (period === "PM" && hours !== 12) hours += 12;
		if (period === "AM" && hours === 12) hours = 0;

		const totalMinutes = hours * 60 + minutes;
		const minTime = 7 * 60; // 7:00 AM
		const maxTime = 19 * 60; // 7:00 PM

		if (totalMinutes < minTime || totalMinutes > maxTime) {
			setTimeError("Time must be between 07:00 AM and 07:00 PM");
			return false;
		}

		setTimeError("");
		return true;
	};

	// Add time slot with validation
	const handleAddTimeSlot = () => {
		if (!newTimeSlot.trim()) {
			setTimeError("Please enter a time");
			return;
		}

		// Normalize the time format (ensure proper spacing and capitalization)
		const normalizedTime = newTimeSlot.trim().replace(/\s+/g, " ").toUpperCase();

		if (!validateTimeSlot(normalizedTime)) {
			return;
		}

		if (timeSlots.includes(normalizedTime)) {
			setTimeError("This time slot already exists");
			return;
		}

		setTimeSlots([...timeSlots, normalizedTime]);
		setNewTimeSlot("");
		setTimeError("");
	};

	// Handle Enter key in time input
	const handleTimeInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddTimeSlot();
		}
	};

	// Remove time slot
	const handleRemoveTimeSlot = (slot: string) => {
		setTimeSlots(timeSlots.filter((s) => s !== slot));
	};

	// Submit available date - Updated to save to MongoDB
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!date) {
			alert("Please select a date");
			return;
		}

		if (timeSlots.length === 0) {
			alert("Please add at least one time slot");
			return;
		}

		setIsSubmitting(true);

		try {
			// Save to MongoDB using the server action
			await addAvailableDate(date, timeSlots);
			await refreshAvailabilityData();

			const message = existingSlots.length > 0 ? "Time slots updated successfully! New slots have been added to the existing date." : "Available date added successfully!";
			alert(message);

			setDate(undefined);
			setTimeSlots(["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"]);
			setExistingSlots([]);
		} catch (error) {
			console.error("Error adding available date:", error);
			alert("Failed to add available date");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Format date for display
	const formatAppointmentDate = (date: Date) => {
		try {
			return format(new Date(date), "MMM d, yyyy");
		} catch {
			return "Invalid date";
		}
	};

	const formatAvailabilityDate = (date: Date) => {
		try {
			return format(new Date(date), "EEE, MMM d, yyyy");
		} catch {
			return "Invalid date";
		}
	};

	const toDateTime = (dateValue: Date | string | undefined, timeValue: string | undefined) => {
		if (!dateValue || !timeValue) return null;
		const base = new Date(dateValue);
		if (Number.isNaN(base.getTime())) return null;
		const match = timeValue.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
		if (!match) return null;
		let hours = parseInt(match[1], 10);
		const minutes = parseInt(match[2], 10);
		const period = match[3].toUpperCase();
		if (period === "PM" && hours !== 12) hours += 12;
		if (period === "AM" && hours === 12) hours = 0;
		return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes, 0, 0);
	};

	const getRescheduleOpenSlots = (targetDate?: Date | string | null) => {
		if (!targetDate || !rescheduleBooking) return [] as string[];
		const dateKey = toDateOnly(targetDate as Date | string);
		if (!dateKey) return [] as string[];

		const avail = availabilityList.find((a) => toDateOnly(a.date) === dateKey);
		if (!avail) return [] as string[];

		const bookingTimes = confirmedBookings.filter((b: any) => toDateOnly(b.confirmedDate || b.preferredDate) === dateKey).map((b: any) => b.confirmedTime || b.preferredTime);
		const bookedSet = new Set([...(avail.timeSlots || []).filter((s: any) => s.isBooked).map((s: any) => s.time), ...bookingTimes]);

		const currentBookingTime = rescheduleBooking.confirmedTime || rescheduleBooking.preferredTime;
		const currentBookingDate = rescheduleBooking.confirmedDate || rescheduleBooking.preferredDate;
		if (currentBookingTime && toDateOnly(currentBookingDate) === dateKey) {
			bookedSet.delete(currentBookingTime);
		}

		const slots = (avail.timeSlots || []).filter((slot: any) => !bookedSet.has(slot.time)).map((slot: any) => slot.time);

		const todayKey = toDateOnly(new Date());
		if (dateKey === todayKey) {
			const now = new Date();
			return slots.filter((time: string) => {
				const dt = toDateTime(targetDate as Date | string, time);
				return dt ? dt.getTime() >= now.getTime() : false;
			});
		}

		return slots;
	};

	const getRescheduleSelectableSlots = (targetDate?: Date | string | null) => {
		const slots = getRescheduleOpenSlots(targetDate);
		if (!rescheduleBooking || !targetDate) return slots;

		const originalDateKey = toDateOnly(rescheduleBooking.confirmedDate || rescheduleBooking.preferredDate);
		const dateKey = toDateOnly(targetDate as Date | string);
		if (!originalDateKey || !dateKey || originalDateKey !== dateKey) return slots;

		const originalTime = rescheduleBooking.confirmedTime || rescheduleBooking.preferredTime || "";
		return slots.filter((time: string) => time !== originalTime);
	};

	const isEligibleRescheduleDate = (value: Date | string) => {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return false;
		const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
		const today = new Date();
		const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

		// If the date is today, only allow if there are remaining future time slots
		if (dayStart.getTime() === todayStart.getTime()) {
			return getRescheduleOpenSlots(value).length > 0;
		}

		// Future days remain eligible
		return dayStart > todayStart;
	};

	const getRescheduleEligibleDates = (bookingOverride?: any) => {
		const booking = bookingOverride ?? rescheduleBooking;
		const originalDateKey = booking ? toDateOnly(booking.confirmedDate || booking.preferredDate) : "";
		return availabilityList.filter((avail) => {
			const dateKey = toDateOnly(avail.date);
			if (!dateKey) return false;
			const slotCount = getRescheduleSelectableSlots(avail.date).length;
			if (originalDateKey && dateKey === originalDateKey) {
				// Allow same-day reschedule only if there is an alternate open slot
				return slotCount > 0;
			}
			return isEligibleRescheduleDate(avail.date) && slotCount >= 0;
		});
	};

	const hasRescheduleAvailability = getRescheduleEligibleDates().length > 0;
	const hasRescheduleActions = getRescheduleEligibleDates().some((avail) => getRescheduleSelectableSlots(avail.date).length > 0);

	// Determine if a booking's scheduled tour time is in the past (for no-show handling)
	const isTourInPast = (booking: any) => {
		const dt = toDateTime(booking.confirmedDate || booking.preferredDate, booking.confirmedTime || booking.preferredTime);
		if (!dt) return false;
		return dt.getTime() < Date.now();
	};

	// Remove a single time slot from availability, then refresh overview
	const handleRemoveAvailabilitySlot = useCallback(
		async (dateValue: Date | string, time: string) => {
			try {
				const parsedDate = new Date(dateValue);
				if (Number.isNaN(parsedDate.getTime())) {
					toast({ variant: "destructive", title: "Invalid date", description: "Could not determine the date for this slot." });
					return;
				}

				const dateParam = toDateOnly(parsedDate);
				const res = await fetch(`/api/availability?date=${dateParam}&time=${encodeURIComponent(time)}`, { method: "DELETE" });
				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					throw new Error(data.message || "Failed to remove time slot");
				}

				await refreshAvailabilityData();
				toast({ title: "Time slot removed", description: `${formatAvailabilityDate(parsedDate)} • ${time}` });
			} catch (err) {
				console.error("Failed to remove time slot", err);
				toast({ variant: "destructive", title: "Unable to remove slot", description: err instanceof Error ? err.message : "Unexpected error" });
			}
		},
		[refreshAvailabilityData, toast]
	);

	// Calculate child age from DOB
	const calculateAge = (dob: Date) => {
		try {
			const today = new Date();
			const birthDate = new Date(dob);
			let age = today.getFullYear() - birthDate.getFullYear();
			const m = today.getMonth() - birthDate.getMonth();
			if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
				age--;
			}
			return age;
		} catch {
			return "N/A";
		}
	};

	// Get status color
	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed":
				return "bg-[#0094da] text-[#0094da]";
			case "pending":
			case "requested":
				return "bg-yellow-100 text-yellow-800";
			case "no-show":
				return "bg-orange-100 text-orange-800";
			case "completed":
				return "bg-blue-100 text-blue-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// Determine if a booking has been rescheduled (persisted flag only to avoid false positives on first confirmation)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const isBookingRescheduled = (booking: any) => Boolean(booking?.rescheduled);

	// Confirm booking
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleConfirm = async (bookingId: string, booking: any) => {
		setSelectedBooking(booking);

		if (booking.alternateDate) {
			// Show date selection modal if alternate date exists
			setSelectedDateOption("preferred");
			setShowDateSelectionModal(true);
		} else {
			// Go directly to confirmation if only preferred date
			setShowConfirmationModal(true);
		}
	};

	// Handle date selection confirmation
	const handleDateSelectionConfirm = () => {
		setShowDateSelectionModal(false);
		setShowConfirmationModal(true);
	};

	// Handle final confirmation and send email
	const handleFinalConfirmation = async () => {
		const booking = selectedBooking;
		const selectedDate = selectedDateOption === "preferred" ? booking.preferredDate : booking.alternateDate;
		const selectedTime = selectedDateOption === "preferred" ? booking.preferredTime : booking.alternateTime;

		setShowConfirmationModal(false);
		setProcessingId(booking._id);

		try {
			const response = await fetch("/api/tour-bookings", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: booking._id,
					status: "confirmed",
					confirmedDate: selectedDate,
					confirmedTime: selectedTime,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to confirm booking");
			}

			// Show success toast notification
			toast({
				title: "✅ Booking Confirmed!",
				description: `Tour scheduled for ${formatAppointmentDate(selectedDate)} at ${selectedTime}. Confirmation email sent to parent.`,
				variant: "success",
				duration: 5000,
			});
			onRefresh?.(); // Refresh the data
		} catch (error) {
			console.error("Error confirming booking:", error);
			toast({
				title: "❌ Confirmation Failed",
				description: "Failed to confirm booking. Please try again.",
				variant: "destructive",
				duration: 5000,
			});
		} finally {
			setProcessingId(null);
			setSelectedBooking(null);
		}
	};

	// Mark as completed
	const handleComplete = async (bookingId: string) => {
		if (!confirm("Mark this tour as completed?")) {
			return;
		}

		setProcessingId(bookingId);
		try {
			const response = await fetch("/api/tour-bookings", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: bookingId, status: "completed" }),
			});

			if (!response.ok) {
				throw new Error("Failed to mark as completed");
			}

			alert("Tour marked as completed!");
			onRefresh?.(); // Refresh the data
		} catch (error) {
			console.error("Error marking tour as completed:", error);
			alert("Failed to update status. Please try again.");
		} finally {
			setProcessingId(null);
		}
	};

	// Open reschedule modal
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleOpenReschedule = (booking: any) => {
		setRescheduleBooking(booking);
		const initialDateRaw = booking.confirmedDate ? new Date(booking.confirmedDate) : booking.preferredDate ? new Date(booking.preferredDate) : undefined;
		const originalDateKey = initialDateRaw ? toDateOnly(initialDateRaw) : "";
		const eligibleDates = getRescheduleEligibleDates(booking);
		const firstWithSlots = eligibleDates.find((avail) => getRescheduleSelectableSlots(avail.date).length > 0);
		let initialDate = firstWithSlots?.date ?? eligibleDates[0]?.date;
		// Prefer staying on the same date if it has an alternate slot
		if (!initialDate && originalDateKey) {
			const sameDate = eligibleDates.find((avail) => toDateOnly(avail.date) === originalDateKey);
			if (sameDate) initialDate = sameDate.date;
		}
		if (initialDate) {
			setRescheduleDate(new Date(initialDate));
			const slots = getRescheduleSelectableSlots(initialDate);
			setRescheduleTime(slots[0] || "");
		} else {
			setRescheduleDate(undefined);
			setRescheduleTime("");
		}

		setShowRescheduleModal(true);
	};

	// Submit reschedule
	const handleSubmitReschedule = async () => {
		if (!rescheduleBooking) return;
		if (!rescheduleDate) {
			toast({ variant: "destructive", title: "Select a date", description: "Please choose a new tour date." });
			return;
		}
		if (!rescheduleTime.trim()) {
			toast({ variant: "destructive", title: "Enter a time", description: "Please provide a new tour time." });
			return;
		}

		const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
		if (!timeRegex.test(rescheduleTime.trim())) {
			toast({ variant: "destructive", title: "Invalid time", description: "Use HH:MM AM/PM (e.g., 09:30 AM)." });
			return;
		}

		const originalDateKey = toDateOnly(rescheduleBooking.confirmedDate || rescheduleBooking.preferredDate);
		const originalTime = rescheduleBooking.confirmedTime || rescheduleBooking.preferredTime || "";
		const newDateKey = toDateOnly(rescheduleDate);
		const newTime = rescheduleTime.trim();

		if (originalDateKey && newDateKey && originalDateKey === newDateKey && originalTime === newTime) {
			toast({ variant: "destructive", title: "Pick a different slot", description: "The new schedule must differ from the current date and time." });
			return;
		}

		setProcessingId(rescheduleBooking._id);
		try {
			const response = await fetch("/api/tour-bookings", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: rescheduleBooking._id, status: "confirmed", confirmedDate: rescheduleDate, confirmedTime: rescheduleTime.trim() }),
			});

			if (!response.ok) {
				throw new Error("Failed to reschedule");
			}

			toast({ title: "Booking rescheduled", description: `${rescheduleBooking.parentFirstName} ${rescheduleBooking.parentLastName} moved to ${formatAppointmentDate(rescheduleDate)} at ${rescheduleTime.trim()}` });
			onRefresh?.();
			setShowRescheduleModal(false);
			setRescheduleBooking(null);
			setRescheduleDate(undefined);
			setRescheduleTime("");
		} catch (error) {
			console.error("Error rescheduling booking:", error);
			toast({ variant: "destructive", title: "Failed to reschedule", description: "Please try again." });
		} finally {
			setProcessingId(null);
		}
	};

	// Mark as no-show
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleNoShow = async (booking: any) => {
		setProcessingId(booking._id);
		try {
			const response = await fetch("/api/tour-bookings", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: booking._id, status: "no-show", noShowAt: new Date().toISOString() }),
			});

			if (!response.ok) {
				throw new Error("Failed to mark as no-show");
			}

			toast({ title: "Marked as no-show", description: `${booking.parentFirstName} ${booking.parentLastName} did not attend.` });
			onRefresh?.();
		} catch (error) {
			console.error("Error marking no-show:", error);
			toast({ variant: "destructive", title: "Failed to mark no-show", description: "Please try again." });
		} finally {
			setProcessingId(null);
		}
	};

	// Cancel a confirmed booking
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleCancel = async (booking: any) => {
		if (!confirm("Cancel this tour booking?")) return;
		setProcessingId(booking._id);
		try {
			const response = await fetch("/api/tour-bookings", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: booking._id, status: "cancelled" }),
			});

			if (!response.ok) {
				throw new Error("Failed to cancel booking");
			}

			toast({ title: "Booking cancelled", description: `${booking.parentFirstName} ${booking.parentLastName}'s tour has been cancelled.` });
			onRefresh?.();
		} catch (error) {
			console.error("Error cancelling booking:", error);
			toast({ variant: "destructive", title: "Failed to cancel", description: "Please try again." });
		} finally {
			setProcessingId(null);
		}
	};

	// Delete booking
	const handleDelete = async (bookingId: string, parentName: string) => {
		if (!confirm(`Are you sure you want to delete the booking for ${parentName}? This action cannot be undone.`)) {
			return;
		}

		setProcessingId(bookingId);
		try {
			const response = await fetch(`/api/tour-bookings?id=${bookingId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete booking");
			}

			alert("Booking deleted successfully!");
			onRefresh?.(); // Refresh the data
		} catch (error) {
			console.error("Error deleting booking:", error);
			alert("Failed to delete booking. Please try again.");
		} finally {
			setProcessingId(null);
		}
	};

	return (
		<>
			<Tabs defaultValue="appointments">
				<TabsList className="mb-8">
					<TabsTrigger value="appointments">View School Tour Bookings</TabsTrigger>
					<TabsTrigger value="availability">Manage Availability</TabsTrigger>
				</TabsList>
				<TabsContent value="appointments">
					<div className="space-y-6">
						{/* Custom Date Range Picker */}
						{showCustomDatePicker && filterPeriod === "custom" && (
							<Card>
								<CardContent className="pt-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label className="mb-2 block">Start Date</Label>
											<Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} className="border rounded-md" />
										</div>
										<div>
											<Label className="mb-2 block">End Date</Label>
											<Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} className="border rounded-md" disabled={(date) => !customStartDate || date < customStartDate} />
										</div>
									</div>
									{customStartDate && customEndDate && (
										<div className="mt-4 text-sm text-gray-600">
											Filtering from {format(customStartDate, "MMM d, yyyy")} to {format(customEndDate, "MMM d, yyyy")}
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{/* Search Bar */}
						<div className="relative mb-4 lg:mb-8">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							<Input type="text" placeholder="Search by parent name, child name, email, phone, or status..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2" />
							{searchQuery && (
								<button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
									×
								</button>
							)}
						</div>
					</div>

					{filteredAppointments.length > 0 ? (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
							{filteredAppointments.map((booking: any) => {
								const canMarkNoShow = booking.status === "confirmed" && isTourInPast(booking);
								const rescheduled = isBookingRescheduled(booking);
								const canCancel = booking.status === "confirmed";
								return (
									<Card key={booking._id} className="hover:shadow-lg transition-shadow">
										{/* Status Bar at Top */}
										<div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Badge className={getStatusColor(booking.status || "pending")}>{booking.status || "pending"}</Badge>
												{rescheduled && <Badge className="bg-purple-100 text-purple-800 border border-purple-200">Rescheduled</Badge>}
											</div>
											<Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(booking._id, `${booking.parentFirstName} ${booking.parentLastName}`)} disabled={processingId === booking._id} title="Delete booking">
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>

										<CardHeader className="pb-3">
											<CardTitle className="text-lg flex items-center gap-2">
												<User className="w-5 h-5 text-[#0094da]" />
												{booking.parentFirstName} {booking.parentLastName}
											</CardTitle>
											<CardDescription className="mt-1">Parent/Guardian</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											{/* Child Information */}
											<div className="bg-[#0094da] p-3 rounded-lg space-y-2">
												<div className="flex items-center gap-2 font-semibold text-[#0094da]">
													<Baby className="w-4 h-4" />
													Child Information
												</div>
												<div className="ml-6 space-y-1 text-sm">
													<p className="font-medium">
														{booking.childFirstName} {booking.childLastName}
													</p>
													{booking.childDob && (
														<p className="text-gray-600">
															Age: {calculateAge(booking.childDob)} years
															<span className="text-xs ml-1">({formatAppointmentDate(booking.childDob)})</span>
														</p>
													)}
													{booking.currentSchool && (
														<div className="flex items-center gap-1 text-gray-600">
															<School className="w-3 h-3" />
															<span>{booking.currentSchool}</span>
														</div>
													)}
												</div>
											</div>

											{/* Tour Schedule */}
											<div className="space-y-2">
												{booking.confirmedDate ? (
													<>
														<div className="flex items-center gap-2 text-sm font-semibold text-[#0094da]">
															<CalendarIcon className="w-4 h-4 text-[#0094da]" />
															Confirmed Schedule
														</div>
														<div className="ml-6 bg-[#0094da] p-2 rounded">
															<p className="text-sm font-bold text-[#0094da]">{formatAppointmentDate(booking.confirmedDate)}</p>
															<p className="text-sm flex items-center gap-1 text-[#0094da]">
																<Clock className="w-3 h-3" />
																{booking.confirmedTime}
															</p>
														</div>
													</>
												) : (
													<>
														<div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
															<CalendarIcon className="w-4 h-4 text-blue-600" />
															Preferred Schedule
														</div>
														<div className="ml-6 space-y-1">
															<p className="text-sm">
																<span className="font-medium">Date:</span> {formatAppointmentDate(booking.preferredDate)}
															</p>
															<p className="text-sm flex items-center gap-1">
																<Clock className="w-3 h-3" />
																<span className="font-medium">Time:</span> {booking.preferredTime}
															</p>
															{booking.alternateDate && (
																<div className="mt-2 pt-2 border-t border-gray-200">
																	<p className="text-xs text-gray-600">
																		Alternate: {formatAppointmentDate(booking.alternateDate)} at {booking.alternateTime}
																	</p>
																</div>
															)}
														</div>
													</>
												)}
											</div>

											{/* Contact Information */}
											<div className="space-y-2 pt-2 border-t">
												<div className="flex items-center gap-2 text-sm">
													<Mail className="w-4 h-4 text-gray-400" />
													<a href={`mailto:${booking.email}`} className="text-blue-600 hover:underline text-sm">
														{booking.email}
													</a>
												</div>
												<div className="flex items-center gap-2 text-sm">
													<Phone className="w-4 h-4 text-gray-400" />
													<a href={`tel:${booking.phone}`} className="text-blue-600 hover:underline">
														{booking.phone}
													</a>
												</div>
											</div>

											{/* Questions/Comments */}
											{booking.questions && (
												<div className="bg-gray-50 p-3 rounded-lg">
													<div className="flex items-start gap-2">
														<MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
														<div className="flex-1">
															<p className="text-xs font-semibold text-gray-700 mb-1">Questions/Comments:</p>
															<p className="text-xs text-gray-600">{booking.questions}</p>
														</div>
													</div>
												</div>
											)}

											{/* Action Buttons */}
											<div className="flex flex-col gap-2 pt-2">
												{booking.status !== "completed" ? (
													<>
														<div className="flex gap-2">
															<Button size="sm" className="flex-1 bg-[#0094da] hover:bg-[#0094da]" onClick={() => handleConfirm(booking._id, booking)} disabled={processingId === booking._id || booking.status === "confirmed" || booking.status === "no-show"}>
																{processingId === booking._id ? "Processing..." : booking.status === "confirmed" ? "Confirmed ✓" : "Confirm & Email"}
															</Button>
															{booking.status === "confirmed" && (
																<Button size="sm" variant="outline" className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50" onClick={() => handleComplete(booking._id)} disabled={processingId === booking._id}>
																	<CheckCircle className="w-4 h-4 mr-1" />
																	Complete
																</Button>
															)}
														</div>
														{(canMarkNoShow || canCancel) && (
															<div className="flex gap-2">
																{canMarkNoShow && (
																	<Button size="sm" variant="outline" className="flex-1 border-orange-500 text-orange-700 hover:bg-orange-50" onClick={() => handleNoShow(booking)} disabled={processingId === booking._id}>
																		<X className="w-4 h-4 mr-1" />
																		Mark No-Show
																	</Button>
																)}
																{canCancel && (
																	<Button size="sm" variant="outline" className="flex-1 border-red-500 text-red-700 hover:bg-red-50" onClick={() => handleCancel(booking)} disabled={processingId === booking._id}>
																		<X className="w-4 h-4 mr-1" />
																		Cancel
																	</Button>
																)}
															</div>
														)}
														{(booking.status === "confirmed" || booking.status === "no-show") && (
															<Button size="sm" variant="secondary" className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => handleOpenReschedule(booking)} disabled={processingId === booking._id}>
																<CalendarIcon className="w-4 h-4 mr-1" />
																Reschedule
															</Button>
														)}
													</>
												) : (
													<Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled>
														<CheckCircle className="w-4 h-4 mr-1" />
														Completed
													</Button>
												)}
											</div>

											{/* Metadata */}
											<div className="text-xs text-gray-400 pt-2 border-t">
												Submitted: {formatAppointmentDate(booking.createdAt)}
												{booking.status === "no-show" && booking.noShowAt && <span className="block text-orange-700 mt-1">No-show recorded: {formatAppointmentDate(booking.noShowAt)}</span>}
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					) : (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
								<p className="text-gray-500 text-lg">No tour bookings found</p>
								<p className="text-gray-400 text-sm mt-2">New bookings will appear here</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>{" "}
				<TabsContent value="availability">
					<div className="grid md:grid-cols-2 gap-8">
						<Card>
							<CardHeader className="flex flex-row items-start justify-between">
								<div>
									<CardTitle>Add Available Date</CardTitle>
									<CardDescription>Select a date and add available time slots for school tours</CardDescription>
								</div>
								<Button type="button" variant="ghost" size="icon" onClick={() => setShowInfoModal(true)} aria-label="How to add availability">
									<Info className="w-5 h-5 text-gray-600" />
								</Button>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="space-y-2">
										<Label>Select Date (Today or Future)</Label>
										<Calendar mode="single" selected={date} onSelect={handleDateSelect} className="border rounded-md" disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} />
										<p className="text-xs text-gray-500">Only today and future dates can be selected</p>
										{existingSlots.length > 0 && (
											<div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
												<p className="text-xs font-semibold text-blue-700 mb-1">Existing time slots for this date:</p>
												<div className="flex flex-wrap gap-1">
													{existingSlots.map((slot, idx) => (
														<span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
															{slot}
														</span>
													))}
												</div>
												<p className="text-xs text-blue-600 mt-1">New slots you add will be merged with these.</p>
											</div>
										)}
									</div>

									<div className="space-y-4">
										<Label>Time Slots (07:00 AM - 07:00 PM)</Label>

										<div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-gray-50">
											{timeSlots.length > 0 ? (
												timeSlots.map((slot) => (
													<div key={slot} className="flex items-center bg-white border border-gray-300 rounded-full px-3 py-1 shadow-sm">
														<span className="text-sm font-medium">{slot}</span>
														<button type="button" onClick={() => handleRemoveTimeSlot(slot)} className="ml-2 text-gray-500 hover:text-red-600 font-bold text-lg leading-none">
															×
														</button>
													</div>
												))
											) : (
												<p className="text-sm text-gray-400">No time slots added yet</p>
											)}
										</div>

										<div className="space-y-2">
											<div className="flex gap-2">
												<div className="flex-1">
													<Input
														placeholder="e.g., 09:00 AM or 02:30 PM"
														value={newTimeSlot}
														onChange={(e) => {
															setNewTimeSlot(e.target.value);
															if (timeError) setTimeError("");
														}}
														onKeyPress={handleTimeInputKeyPress}
														className={timeError ? "border-red-500" : ""}
													/>
													{timeError && <p className="text-xs text-red-600 mt-1">{timeError}</p>}
												</div>
												<Button type="button" variant="outline" onClick={handleAddTimeSlot}>
													Add Slot
												</Button>
											</div>
											<p className="text-xs text-gray-500">Format: HH:MM AM/PM (e.g., 09:00 AM, 02:30 PM). Time must be between 07:00 AM and 07:00 PM.</p>
										</div>
									</div>

									<Button type="submit" disabled={isSubmitting || !date || timeSlots.length === 0} className="w-full">
										{isSubmitting ? "Saving..." : "Save Available Date & Times"}
									</Button>
								</form>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Availability Overview</CardTitle>
								<CardDescription>Dates and time slots currently open for booking</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{availabilityList.length === 0 ? (
									<p className="text-sm text-gray-500">No availability has been set yet.</p>
								) : (
									availabilityList.map((avail) => {
										const dateLabel = formatAvailabilityDate(avail.date);
										// Build set of booked times from slots and confirmed bookings
										const dateKey = toDateOnly(avail.date);
										const bookingTimes = confirmedBookings.filter((b: any) => toDateOnly(b.confirmedDate || b.preferredDate) === dateKey).map((b: any) => b.confirmedTime || b.preferredTime);
										const bookedSet = new Set([...(avail.timeSlots || []).filter((s: any) => s.isBooked).map((s: any) => s.time), ...bookingTimes]);

										const totalSlots = avail.timeSlots?.length || 0;
										const openSlots = avail.timeSlots?.filter((slot: any) => !bookedSet.has(slot.time)).length || 0;

										return (
											<div key={avail._id} className="border rounded-md p-3 bg-gray-50">
												<div className="flex items-start justify-between">
													<div>
														<p className="text-sm font-semibold text-gray-800">{dateLabel}</p>
														<p className="text-xs text-gray-600">
															Open slots: {openSlots} / {totalSlots}
														</p>
													</div>
												</div>
												{avail.timeSlots?.length ? (
													<div className="mt-2 flex flex-wrap gap-2">
														{avail.timeSlots.map((slot: any, idx: number) => {
															const isBooked = bookedSet.has(slot.time);
															return (
																<div key={idx} className="relative inline-flex items-center">
																	<span className={`text-xs px-2 py-0.5 pr-6 rounded border ${isBooked ? "bg-red-50 text-red-700 border-red-200" : "bg-[#0094da] text-[#0094da] border-[#0094da]"}`}>{slot.time}</span>
																	{!isBooked && (
																		<button type="button" onClick={() => handleRemoveAvailabilitySlot(avail.date, slot.time)} className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white text-red-600 border border-red-200 shadow-sm flex items-center justify-center hover:bg-red-50" title="Remove time slot">
																			<X className="h-3 w-3" />
																		</button>
																	)}
																</div>
															);
														})}
													</div>
												) : (
													<p className="text-xs text-gray-500 mt-2">No time slots</p>
												)}
											</div>
										);
									})
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			{/* Date Selection Modal */}
			<Dialog open={showDateSelectionModal} onOpenChange={setShowDateSelectionModal}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-[#0094da]">Select Tour Date</DialogTitle>
						<DialogDescription>The parent has provided two date options. Please select which date to confirm for the tour.</DialogDescription>
					</DialogHeader>

					{selectedBooking && (
						<div className="space-y-4 py-4">
							{/* Preferred Date Option */}
							<div onClick={() => setSelectedDateOption("preferred")} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedDateOption === "preferred" ? "border-[#0094da] bg-[#0094da] shadow-md" : "border-gray-200 hover:border-[#0094da] hover:bg-gray-50"}`}>
								<div className="flex items-center gap-3">
									<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedDateOption === "preferred" ? "border-[#0094da]" : "border-gray-300"}`}>{selectedDateOption === "preferred" && <div className="w-3 h-3 rounded-full bg-[#0094da]"></div>}</div>
									<div className="flex-1">
										<div className="font-semibold text-gray-900">Preferred Date</div>
										<div className="flex items-center gap-2 mt-1">
											<CalendarIcon className="w-4 h-4 text-gray-500" />
											<span className="text-sm text-gray-700">{formatAppointmentDate(selectedBooking.preferredDate)}</span>
										</div>
										<div className="flex items-center gap-2 mt-1">
											<Clock className="w-4 h-4 text-gray-500" />
											<span className="text-sm text-gray-700">{selectedBooking.preferredTime}</span>
										</div>
									</div>
								</div>
							</div>

							{/* Alternate Date Option */}
							<div onClick={() => setSelectedDateOption("alternate")} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedDateOption === "alternate" ? "border-[#0094da] bg-[#0094da] shadow-md" : "border-gray-200 hover:border-[#0094da] hover:bg-gray-50"}`}>
								<div className="flex items-center gap-3">
									<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedDateOption === "alternate" ? "border-[#0094da]" : "border-gray-300"}`}>{selectedDateOption === "alternate" && <div className="w-3 h-3 rounded-full bg-[#0094da]"></div>}</div>
									<div className="flex-1">
										<div className="font-semibold text-gray-900">Alternate Date</div>
										<div className="flex items-center gap-2 mt-1">
											<CalendarIcon className="w-4 h-4 text-gray-500" />
											<span className="text-sm text-gray-700">{formatAppointmentDate(selectedBooking.alternateDate)}</span>
										</div>
										<div className="flex items-center gap-2 mt-1">
											<Clock className="w-4 h-4 text-gray-500" />
											<span className="text-sm text-gray-700">{selectedBooking.alternateTime}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDateSelectionModal(false)}>
							Cancel
						</Button>
						<Button className="bg-[#0094da] hover:bg-[#0094da]" onClick={handleDateSelectionConfirm}>
							Continue
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reschedule Modal */}
			<Dialog
				open={showRescheduleModal}
				onOpenChange={(open) => {
					setShowRescheduleModal(open);
					if (!open) {
						setRescheduleBooking(null);
						setRescheduleDate(undefined);
						setRescheduleTime("");
					}
				}}
			>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-[#0094da]">Reschedule Tour</DialogTitle>
						<DialogDescription>{hasRescheduleAvailability ? "Select an available date and time." : "No availability right now."}</DialogDescription>
					</DialogHeader>
					{!hasRescheduleAvailability ? (
						<div className="py-6 text-center space-y-2">
							<p className="text-lg font-semibold text-gray-800">No availability</p>
							<p className="text-sm text-gray-600">There are no dates or time slots available right now.</p>
						</div>
					) : (
						<div className="space-y-4">
							<div>
								<Label className="mb-2 block">Available Dates</Label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-auto pr-1">
									{getRescheduleEligibleDates().map((avail) => {
										const openSlots = getRescheduleSelectableSlots(avail.date);
										const isSelected = rescheduleDate ? toDateOnly(rescheduleDate) === toDateOnly(avail.date) : false;
										const isFull = openSlots.length === 0;
										return (
											<button
												type="button"
												key={avail._id}
												onClick={() => {
													setRescheduleDate(new Date(avail.date));
													const slots = getRescheduleSelectableSlots(avail.date);
													setRescheduleTime(slots[0] || "");
												}}
												className={`text-left border rounded-md p-3 transition hover:shadow-sm ${isSelected ? "border-[#0094da] bg-[#0094da]" : "border-gray-200 bg-white"} ${isFull ? "opacity-70 cursor-not-allowed" : ""}`}
												disabled={isFull}
											>
												<div className="text-sm font-semibold text-gray-900">{formatAvailabilityDate(avail.date)}</div>
												<div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
													<span>Open slots: {openSlots.length}</span>
													{isFull && <span className="text-[11px] px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">Full</span>}
												</div>
												<div className="mt-2 flex flex-wrap gap-1">
													{openSlots.slice(0, 4).map((slot: string, idx: number) => (
														<span key={`${slot}-${idx}`} className="text-[11px] px-2 py-0.5 rounded bg-[#0094da] text-[#0094da] border border-[#0094da]">
															{slot}
														</span>
													))}
												</div>
											</button>
										);
									})}
								</div>
							</div>
							<div>
								<Label className="mb-2 block">Available Times</Label>
								{rescheduleDate ? (
									<div className="flex flex-wrap gap-2 max-h-[200px] overflow-auto pr-1">
										{getRescheduleSelectableSlots(rescheduleDate).length === 0 && <p className="text-xs text-gray-500">No open slots for this date.</p>}
										{getRescheduleSelectableSlots(rescheduleDate).map((slot: string, idx: number) => {
											const isSelected = rescheduleTime === slot;
											return (
												<button type="button" key={`${slot}-${idx}`} onClick={() => setRescheduleTime(slot)} className={`text-xs px-3 py-1 rounded border transition ${isSelected ? "bg-[#0094da] text-white border-[#0094da]" : "bg-white text-gray-700 border-gray-200 hover:border-[#0094da]"}`}>
													{slot}
												</button>
											);
										})}
									</div>
								) : (
									<p className="text-xs text-gray-500">Select a date to see available times.</p>
								)}
							</div>
						</div>
					)}
					<DialogFooter className="flex gap-2 justify-end">
						{hasRescheduleActions ? (
							<>
								<Button variant="outline" onClick={() => setShowRescheduleModal(false)}>
									Cancel
								</Button>
								<Button className="bg-[#0094da] hover:bg-[#0094da]" onClick={handleSubmitReschedule} disabled={!rescheduleDate || !rescheduleTime}>
									Reschedule
								</Button>
							</>
						) : (
							<Button className="bg-gray-700 hover:bg-gray-800" onClick={() => setShowRescheduleModal(false)}>
								Close
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Info Modal */}
			<Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
				<DialogContent className="sm:max-w-[520px]">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-[#0094da]">How to add available tour dates</DialogTitle>
						<DialogDescription>Follow these steps to add or update availability.</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 text-sm text-gray-700">
						<ol className="list-decimal list-inside space-y-2">
							<li>Select a date from the calendar (today or any future date).</li>
							<li>
								Add time slots in the format <strong>HH:MM AM/PM</strong>.
							</li>
							<li>
								Times must be between <strong>07:00 AM</strong> and <strong>07:00 PM</strong>.
							</li>
							<li>Click &quot;Add Slot&quot; to add each time, or remove with the × button.</li>
							<li>Click &quot;Save&quot; to make these times available for booking.</li>
						</ol>
						<div className="mt-2 p-3 bg-blue-50 rounded-lg">
							<p className="font-semibold text-blue-800 mb-2">Examples of valid times:</p>
							<ul className="text-xs text-blue-700 space-y-1">
								<li>✓ 09:00 AM</li>
								<li>✓ 02:30 PM</li>
								<li>✓ 11:45 AM</li>
								<li>✗ 9 AM (missing minutes)</li>
								<li>✗ 14:00 (use 12-hour format with AM/PM)</li>
								<li>✗ 08:00 PM (after 7:00 PM)</li>
							</ul>
						</div>
						<p className="text-xs text-gray-500">
							<strong>Note:</strong> Parents will only be able to select dates and times that you make available here.
						</p>
					</div>
					<DialogFooter>
						<Button onClick={() => setShowInfoModal(false)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Final Confirmation Modal */}
			<Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
				<DialogContent className="sm:max-w-[450px]">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold text-[#0094da]">Confirm Tour Booking</DialogTitle>
						<DialogDescription>Please review the tour details before sending the confirmation email.</DialogDescription>
					</DialogHeader>

					{selectedBooking && (
						<div className="py-4">
							<div className="bg-[#0094da] rounded-lg p-4 space-y-3">
								<div className="flex items-center gap-2">
									<User className="w-5 h-5 text-[#0094da]" />
									<div>
										<div className="text-xs text-gray-600">Parent</div>
										<div className="font-semibold text-gray-900">
											{selectedBooking.parentFirstName} {selectedBooking.parentLastName}
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Baby className="w-5 h-5 text-[#0094da]" />
									<div>
										<div className="text-xs text-gray-600">Child</div>
										<div className="font-semibold text-gray-900">
											{selectedBooking.childFirstName} {selectedBooking.childLastName}
										</div>
									</div>
								</div>

								<div className="border-t border-[#0094da] pt-3 mt-3">
									<div className="flex items-center gap-2 mb-2">
										<CalendarIcon className="w-5 h-5 text-[#0094da]" />
										<div className="text-xs text-gray-600">Confirmed Tour Date</div>
									</div>
									<div className="ml-7">
										<div className="font-bold text-lg text-[#0094da]">{formatAppointmentDate(selectedDateOption === "preferred" ? selectedBooking.preferredDate : selectedBooking.alternateDate)}</div>
										<div className="flex items-center gap-1 mt-1">
											<Clock className="w-4 h-4 text-[#0094da]" />
											<span className="font-semibold text-[#0094da]">{selectedDateOption === "preferred" ? selectedBooking.preferredTime : selectedBooking.alternateTime}</span>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#0094da]">
									<Mail className="w-4 h-4 text-[#0094da]" />
									<span className="text-sm text-gray-700">{selectedBooking.email}</span>
								</div>
							</div>

							<div className="mt-4 p-3 bg-blue-50 rounded-lg">
								<p className="text-sm text-blue-800">
									<strong>📧 A confirmation email</strong> will be automatically sent to the parent with the tour details.
								</p>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowConfirmationModal(false)}>
							Cancel
						</Button>
						<Button className="bg-[#0094da] hover:bg-[#0094da]" onClick={handleFinalConfirmation}>
							Confirm & Send Email
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
