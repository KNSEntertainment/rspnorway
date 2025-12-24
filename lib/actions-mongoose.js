"use server";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import Availability from "@/models/Availability.Model";
import Appointment from "@/models/Appointment.Model";

// Helper function to create consistent date
function createConsistentDate(date) {
	// If date is a string, parse it properly
	if (typeof date === "string") {
		// Parse as Date to keep the actual instant, then build with UTC components
		const parsed = new Date(date);
		if (!Number.isNaN(parsed.getTime())) {
			// Use local calendar components to preserve the selected day (avoids UTC shifting back a day)
			return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0));
		}
		// Fallback for YYYY-MM-DD strings that failed parsing
		const [year, month, day] = date.split("-").map(Number);
		return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
	}

	// If date is a Date object, extract components and create UTC date
	if (date instanceof Date) {
		return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
	}

	// Fallback
	return new Date(date);
}

// Get all available dates
export async function getAvailableDates() {
	await connectDB();
	// Find all dates that have at least one available time slot
	const availableDates = await Availability.find({
		"timeSlots.isBooked": false, // At least one time slot is not booked
	}).sort({ date: 1 });
	return availableDates;
}

// Get available date by date
export async function getAvailableDateByDate(date) {
	await connectDB();

	// Create consistent date
	const consistentDate = createConsistentDate(date);

	// Create start and end of day using the consistent date
	const startOfDay = new Date(consistentDate);
	startOfDay.setUTCHours(0, 0, 0, 0);

	const endOfDay = new Date(consistentDate);
	endOfDay.setUTCHours(23, 59, 59, 999);

	console.log("Searching for date between:", startOfDay, "and", endOfDay);

	const availableDate = await Availability.findOne({
		date: {
			$gte: startOfDay,
			$lte: endOfDay,
		},
	});
	return availableDate;
}

// Add available date - FIXED VERSION
export async function addAvailableDate(date, timeSlots) {
	await connectDB();

	console.log("Original date received:", date);
	console.log("Type of date:", typeof date);

	// Create consistent date to avoid timezone issues
	const consistentDate = createConsistentDate(date);

	console.log("Consistent date created:", consistentDate);
	console.log("Will be stored as:", consistentDate.toISOString());

	// Use the static method from the model with the consistent date
	await Availability.addOrUpdateAvailableDate(consistentDate, timeSlots);

	revalidatePath("/admin");
	revalidatePath("/book");
}

// Book appointment
export async function bookAppointment(appointmentData) {
	await connectDB();

	// Create consistent date for appointment
	const consistentDate = createConsistentDate(appointmentData.date);
	const updatedAppointmentData = {
		...appointmentData,
		date: consistentDate,
	};

	// 1. Create the appointment
	const appointment = await Appointment.create(updatedAppointmentData);

	// 2. Update the availability to mark the time slot as booked
	const startOfDay = new Date(consistentDate);
	startOfDay.setUTCHours(0, 0, 0, 0);

	const endOfDay = new Date(consistentDate);
	endOfDay.setUTCHours(23, 59, 59, 999);

	await Availability.findOneAndUpdate(
		{
			date: {
				$gte: startOfDay,
				$lte: endOfDay,
			},
			"timeSlots.time": appointmentData.time,
		},
		{
			$set: {
				"timeSlots.$.isBooked": true,
				"timeSlots.$.appointment": appointment._id,
			},
		}
	);

	revalidatePath("/book");
	revalidatePath("/admin");
	return appointment;
}

// Get all appointments
export async function getAppointments() {
	await connectDB();
	const appointments = await Appointment.find().sort({ date: 1, time: 1 });
	return appointments;
}

// Get upcoming appointments
export async function getUpcomingAppointments() {
	await connectDB();
	const appointments = await Appointment.findUpcoming();
	return appointments;
}

// Cancel appointment
export async function cancelAppointment(appointmentId) {
	await connectDB();
	const appointment = await Appointment.findById(appointmentId);
	if (!appointment) {
		throw new Error("Appointment not found");
	}
	if (!appointment.canBeCancelled()) {
		throw new Error("This appointment cannot be cancelled");
	}

	// Update appointment status
	appointment.status = "cancelled";
	await appointment.save();

	// Create consistent date for the appointment
	const consistentDate = createConsistentDate(appointment.date);

	// Free up the time slot
	const startOfDay = new Date(consistentDate);
	startOfDay.setUTCHours(0, 0, 0, 0);

	const endOfDay = new Date(consistentDate);
	endOfDay.setUTCHours(23, 59, 59, 999);

	await Availability.findOneAndUpdate(
		{
			date: {
				$gte: startOfDay,
				$lte: endOfDay,
			},
			"timeSlots.time": appointment.time,
		},
		{
			$set: {
				"timeSlots.$.isBooked": false,
				"timeSlots.$.appointment": null,
			},
		}
	);

	revalidatePath("/admin");
	return appointment;
}
