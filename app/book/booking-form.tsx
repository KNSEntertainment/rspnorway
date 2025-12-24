"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/calendar";
import { TimeSlotPicker } from "@/components/time-slot-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AvailableDate } from "@/lib/models";
import { bookAppointment, getAvailableDateByDate } from "@/lib/actions-mongoose";
import { CalendarIcon, Clock } from "lucide-react";

interface BookingFormProps {
	availableDates: AvailableDate[];
}

export default function BookingForm({ availableDates }: BookingFormProps) {
	const router = useRouter();
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedTime, setSelectedTime] = useState<string | null>(null);
	const [timeSlots, setTimeSlots] = useState<{ time: string; isBooked: boolean }[]>([]);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [step, setStep] = useState(1); // 1: Date selection, 2: Time selection, 3: Personal info

	// Handle date selection
	const handleDateSelect = async (date: Date) => {
		setSelectedDate(date);
		setSelectedTime(null);
		setIsLoading(true);

		try {
			// Fetch time slots for selected date from MongoDB
			const availableDate = await getAvailableDateByDate(date);

			if (availableDate) {
				setTimeSlots(availableDate.timeSlots);
				setStep(2); // Move to time selection step
			} else {
				setTimeSlots([]);
			}
		} catch (error) {
			console.error("Error fetching time slots:", error);
			setTimeSlots([]);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle time selection
	const handleTimeSelect = (time: string) => {
		setSelectedTime(time);
		setStep(3); // Move to personal info step
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedDate || !selectedTime) {
			return;
		}

		setIsLoading(true);

		try {
			// Save appointment to MongoDB
			await bookAppointment({
				name,
				email,
				phone,
				date: selectedDate,
				time: selectedTime,
				status: "scheduled",
				createdAt: new Date(),
			});

			// Redirect to confirmation page
			router.push("/book/confirmation");
		} catch (error) {
			console.error("Error booking appointment:", error);
			alert("Failed to book appointment. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-8">
			{/* Progress indicator */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center">
					<div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-white" : "bg-gray-200"}`}>1</div>
					<div className={`h-1 w-12 ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
					<div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-white" : "bg-gray-200"}`}>2</div>
					<div className={`h-1 w-12 ${step >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
					<div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-white" : "bg-gray-200"}`}>3</div>
				</div>
				<div className="text-sm text-gray-500">
					{step === 1 && "Select Date"}
					{step === 2 && "Select Time"}
					{step === 3 && "Your Details"}
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Step 1: Date Selection */}
				<div className={step === 1 ? "block" : "hidden"}>
					<div className="mb-6">
						<h2 className="text-xl font-semibold mb-2 flex items-center">
							<CalendarIcon className="mr-2 h-5 w-5 text-primary" />
							Select a Date
						</h2>
						<p className="text-gray-500 text-sm">Choose from available dates highlighted on the calendar</p>
					</div>

					<Calendar availableDates={availableDates} onSelectDate={handleDateSelect} selectedDate={selectedDate || undefined} />
				</div>

				{/* Step 2: Time Selection */}
				<div className={step === 2 ? "block" : "hidden"}>
					<div className="mb-6">
						<h2 className="text-xl font-semibold mb-2 flex items-center">
							<Clock className="mr-2 h-5 w-5 text-primary" />
							Select a Time
						</h2>
						<p className="text-gray-500 text-sm mb-4">Choose from available time slots for {selectedDate && format(selectedDate, "MMMM d, yyyy")}</p>

						<Button variant="outline" size="sm" onClick={() => setStep(1)} className="mb-4">
							← Change Date
						</Button>
					</div>

					{isLoading ? <div className="text-center py-8">Loading time slots...</div> : <TimeSlotPicker timeSlots={timeSlots} onSelectTime={handleTimeSelect} selectedTime={selectedTime || undefined} />}
				</div>

				{/* Step 3: Personal Information */}
				<div className={step === 3 ? "block" : "hidden"}>
					<div className="mb-6">
						<h2 className="text-xl font-semibold mb-2">Your Information</h2>
						<p className="text-gray-500 text-sm mb-4">Please provide your details to complete the booking</p>

						<div className="bg-gray-50 p-4 rounded-lg mb-6 border">
							<div className="flex items-center mb-2">
								<CalendarIcon className="h-5 w-5 text-primary mr-2" />
								<span className="font-medium">{selectedDate && format(selectedDate, "MMMM d, yyyy")}</span>
							</div>
							<div className="flex items-center">
								<Clock className="h-5 w-5 text-primary mr-2" />
								<span className="font-medium">{selectedTime}</span>
							</div>
						</div>

						<Button variant="outline" size="sm" onClick={() => setStep(2)} className="mb-4">
							← Change Time
						</Button>
					</div>

					<div className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Full Name</Label>
							<Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
						</div>

						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
						</div>

						<div className="grid gap-2">
							<Label htmlFor="phone">Phone Number</Label>
							<Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
						</div>

						<Button type="submit" className="w-full py-6 text-lg mt-6" disabled={isLoading}>
							{isLoading ? "Booking..." : "Complete Booking"}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
