"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvailableDate } from "@/lib/models";

interface CalendarProps {
	availableDates: AvailableDate[];
	onSelectDate: (date: Date) => void;
	selectedDate?: Date;
}

export function Calendar({ availableDates, onSelectDate, selectedDate }: CalendarProps) {
	const [currentMonth, setCurrentMonth] = useState(new Date());

	// Get available dates as Date objects
	const availableDateObjects = availableDates.map((d) => new Date(d.date));

	// Check if a date is available
	const isDateAvailable = (date: Date) => {
		return availableDateObjects.some((availableDate) => availableDate.getDate() === date.getDate() && availableDate.getMonth() === date.getMonth() && availableDate.getFullYear() === date.getFullYear());
	};

	// Check if a date is selected
	const isDateSelected = (date: Date) => {
		if (!selectedDate) return false;

		return selectedDate.getDate() === date.getDate() && selectedDate.getMonth() === date.getMonth() && selectedDate.getFullYear() === date.getFullYear();
	};

	// Check if a date is in the past
	const isDateInPast = (date: Date) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return date < today;
	};

	// Get days in month
	const getDaysInMonth = (year: number, month: number) => {
		return new Date(year, month + 1, 0).getDate();
	};

	// Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
	const getFirstDayOfMonth = (year: number, month: number) => {
		return new Date(year, month, 1).getDay();
	};

	// Get previous month days to display
	const getPreviousMonthDays = (year: number, month: number) => {
		const firstDayOfMonth = getFirstDayOfMonth(year, month);
		const daysInPreviousMonth = getDaysInMonth(year, month - 1);

		const days = [];

		for (let i = 0; i < firstDayOfMonth; i++) {
			days.push({
				date: new Date(year, month - 1, daysInPreviousMonth - firstDayOfMonth + i + 1),
				isCurrentMonth: false,
			});
		}

		return days;
	};

	// Get current month days
	const getCurrentMonthDays = (year: number, month: number) => {
		const daysInMonth = getDaysInMonth(year, month);

		const days = [];

		for (let i = 1; i <= daysInMonth; i++) {
			days.push({
				date: new Date(year, month, i),
				isCurrentMonth: true,
			});
		}

		return days;
	};

	// Get next month days to display
	const getNextMonthDays = (year: number, month: number, currentDays: number) => {
		const totalCells = 42; // 6 rows x 7 days
		const remainingCells = totalCells - currentDays;

		const days = [];

		for (let i = 1; i <= remainingCells; i++) {
			days.push({
				date: new Date(year, month + 1, i),
				isCurrentMonth: false,
			});
		}

		return days;
	};

	// Get all days to display
	const getAllDays = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();

		const previousMonthDays = getPreviousMonthDays(year, month);
		const currentMonthDays = getCurrentMonthDays(year, month);
		const nextMonthDays = getNextMonthDays(year, month, previousMonthDays.length + currentMonthDays.length);

		return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
	};

	// Navigate to previous month
	const goToPreviousMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
	};

	// Navigate to next month
	const goToNextMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
	};

	// Format month and year
	const formatMonthYear = (date: Date) => {
		return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
	};

	const days = getAllDays();

	return (
		<div className="w-full max-w-md mx-auto bg-white rounded-lg overflow-hidden border">
			<div className="flex items-center justify-between p-4">
				<button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100" type="button">
					<ChevronLeft className="h-5 w-5" />
				</button>
				<h2 className="text-lg font-semibold">{formatMonthYear(currentMonth)}</h2>
				<button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100" type="button">
					<ChevronRight className="h-5 w-5" />
				</button>
			</div>

			<div className="grid grid-cols-7 gap-1 p-4">
				{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
					<div key={day} className="text-center text-sm font-medium text-gray-500">
						{day}
					</div>
				))}

				{days.map((day, index) => {
					const isAvailable = isDateAvailable(day.date) && !isDateInPast(day.date);
					const isSelected = isDateSelected(day.date);

					return (
						<button key={index} onClick={() => (isAvailable ? onSelectDate(day.date) : null)} disabled={!isAvailable} className={cn("h-10 w-10 rounded-full flex items-center justify-center text-sm", !day.isCurrentMonth && "text-gray-300", day.isCurrentMonth && !isAvailable && "text-gray-400", isAvailable && "hover:bg-gray-100 cursor-pointer", isAvailable && day.isCurrentMonth && !isSelected && "text-primary font-medium", isSelected && "bg-primary text-white hover:bg-primary-dark")} type="button">
							{day.date.getDate()}
						</button>
					);
				})}
			</div>
		</div>
	);
}
