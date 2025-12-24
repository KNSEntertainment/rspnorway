"use client";

import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/lib/models";
import { Clock } from "lucide-react";

interface TimeSlotPickerProps {
	timeSlots: TimeSlot[];
	onSelectTime: (time: string) => void;
	selectedTime?: string;
}

export function TimeSlotPicker({ timeSlots, onSelectTime, selectedTime }: TimeSlotPickerProps) {
	const availableTimeSlots = timeSlots.filter((slot) => !slot.isBooked);

	// Group time slots by morning, afternoon, evening
	const morningSlots = availableTimeSlots.filter((slot) => {
		const hour = Number.parseInt(slot.time.split(":")[0]);
		const isPM = slot.time.includes("PM");
		return (!isPM && hour >= 7) || (isPM && hour === 12);
	});

	const afternoonSlots = availableTimeSlots.filter((slot) => {
		const hour = Number.parseInt(slot.time.split(":")[0]);
		const isPM = slot.time.includes("PM");
		return isPM && hour >= 1 && hour < 5;
	});

	const eveningSlots = availableTimeSlots.filter((slot) => {
		const hour = Number.parseInt(slot.time.split(":")[0]);
		const isPM = slot.time.includes("PM");
		return isPM && hour >= 5;
	});

	return (
		<div className="w-full space-y-6">
			{availableTimeSlots.length > 0 ? (
				<>
					{morningSlots.length > 0 && (
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-gray-500">Morning</h3>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
								{morningSlots.map((slot) => (
									<button key={slot.time} onClick={() => onSelectTime(slot.time)} className={cn("py-3 px-4 rounded-lg border text-center transition-colors flex items-center justify-center", selectedTime === slot.time ? "bg-primary text-white border-primary" : "bg-gray-50 hover:bg-gray-100 border-gray-200")} type="button">
										<Clock className={cn("mr-2 h-4 w-4", selectedTime === slot.time ? "text-white" : "text-primary")} />
										{slot.time}
									</button>
								))}
							</div>
						</div>
					)}

					{afternoonSlots.length > 0 && (
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-gray-500">Afternoon</h3>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
								{afternoonSlots.map((slot) => (
									<button key={slot.time} onClick={() => onSelectTime(slot.time)} className={cn("py-3 px-4 rounded-lg border text-center transition-colors flex items-center justify-center", selectedTime === slot.time ? "bg-primary text-white border-primary" : "bg-gray-50 hover:bg-gray-100 border-gray-200")} type="button">
										<Clock className={cn("mr-2 h-4 w-4", selectedTime === slot.time ? "text-white" : "text-primary")} />
										{slot.time}
									</button>
								))}
							</div>
						</div>
					)}

					{eveningSlots.length > 0 && (
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-gray-500">Evening</h3>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
								{eveningSlots.map((slot) => (
									<button key={slot.time} onClick={() => onSelectTime(slot.time)} className={cn("py-3 px-4 rounded-lg border text-center transition-colors flex items-center justify-center", selectedTime === slot.time ? "bg-primary text-white border-primary" : "bg-gray-50 hover:bg-gray-100 border-gray-200")} type="button">
										<Clock className={cn("mr-2 h-4 w-4", selectedTime === slot.time ? "text-white" : "text-primary")} />
										{slot.time}
									</button>
								))}
							</div>
						</div>
					)}
				</>
			) : (
				<div className="text-center py-8 border rounded-lg bg-gray-50">
					<Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
					<p className="text-gray-500 font-medium">No available time slots for this date</p>
					<p className="text-gray-400 text-sm mt-1">Please select another date</p>
				</div>
			)}
		</div>
	);
}
