import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TourBooking from "@/models/TourBooking.Model";
import { sendTourBookingConfirmation } from "@/lib/email";

// GET - Retrieve all tour bookings
export async function GET(req) {
	try {
		await connectDB();
		const { searchParams } = new URL(req.url);
		const status = searchParams.get("status");
		const date = searchParams.get("date");

		let query = {};

		if (status) {
			query.status = status;
		}

		if (date) {
			const searchDate = new Date(date);
			searchDate.setHours(0, 0, 0, 0);
			const nextDay = new Date(searchDate);
			nextDay.setDate(nextDay.getDate() + 1);

			query.preferredDate = {
				$gte: searchDate,
				$lt: nextDay,
			};
		}

		const tourBookings = await TourBooking.find(query).sort({ createdAt: -1 }).limit(100);
		return NextResponse.json(tourBookings, { status: 200 });
	} catch (error) {
		console.error("Error retrieving tour bookings:", error);
		return NextResponse.json({ message: "Failed to retrieve tour bookings", error: error.message }, { status: 500 });
	}
}

// POST - Create a new tour booking
export async function POST(req) {
	try {
		await connectDB();
		console.log("Database connected successfully");

		const body = await req.json();

		const { parentFirstName, parentLastName, email, phone, childFirstName, childLastName, childDob, preferredDate, preferredTime } = body;

		if (!parentFirstName || !parentLastName || !email || !phone || !childFirstName || !childLastName || !childDob || !preferredDate || !preferredTime) {
			console.log("Missing required fields");
			return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
		}

		const newTourBooking = new TourBooking(body);
		console.log("Created new tour booking document:", newTourBooking);

		await newTourBooking.save();
		console.log("Tour booking saved successfully:", newTourBooking._id);

		return NextResponse.json({ message: "Tour booking created successfully", tourBooking: newTourBooking }, { status: 201 });
	} catch (error) {
		console.error("Error creating tour booking:", error);

		if (error.name === "ValidationError") {
			const validationErrors = {};
			for (const field in error.errors) {
				validationErrors[field] = error.errors[field].message;
			}

			return NextResponse.json({ message: "Validation error", errors: validationErrors }, { status: 400 });
		}

		return NextResponse.json({ message: "Failed to create tour booking", error: error.message }, { status: 500 });
	}
}

// PATCH - Update tour booking status
export async function PATCH(req) {
	try {
		await connectDB();
		const body = await req.json();
		const { id, status, confirmedDate, confirmedTime, noShowAt } = body;

		if (!id || !status) {
			return NextResponse.json({ message: "Missing id or status" }, { status: 400 });
		}

		const existingBooking = await TourBooking.findById(id);

		if (!existingBooking) {
			return NextResponse.json({ message: "Booking not found" }, { status: 404 });
		}

		const hasExistingSchedule = Boolean(existingBooking.confirmedDate || existingBooking.confirmedTime);
		const dateChanged = hasExistingSchedule && existingBooking.confirmedDate && confirmedDate && new Date(confirmedDate).getTime() !== new Date(existingBooking.confirmedDate).getTime();
		const timeChanged = hasExistingSchedule && existingBooking.confirmedTime && confirmedTime && confirmedTime !== existingBooking.confirmedTime;
		const isReschedule = status === "confirmed" && hasExistingSchedule && (dateChanged || timeChanged);

		// Prepare update data
		const updateData = {
			status,
			updatedAt: new Date(),
			rescheduled: isReschedule ? true : existingBooking.rescheduled || false,
		};

		if (status === "no-show") {
			updateData.noShowAt = noShowAt || new Date();
		}

		// Add confirmed date/time if provided
		if (confirmedDate && confirmedTime) {
			updateData.confirmedDate = confirmedDate;
			updateData.confirmedTime = confirmedTime;
		}

		const updatedBooking = await TourBooking.findByIdAndUpdate(id, updateData, { new: true });

		console.log("Tour booking updated:", updatedBooking._id);

		// Send confirmation email if status is confirmed
		if (status === "confirmed") {
			try {
				// Use confirmed date/time if available, otherwise fall back to preferred
				const dateToUse = updatedBooking.confirmedDate || updatedBooking.preferredDate;
				const timeToUse = updatedBooking.confirmedTime || updatedBooking.preferredTime;

				const formattedDate = new Date(dateToUse).toLocaleDateString("en-US", {
					weekday: "long",
					year: "numeric",
					month: "long",
					day: "numeric",
				});

				await sendTourBookingConfirmation(updatedBooking.email, {
					parentFirstName: updatedBooking.parentFirstName,
					parentLastName: updatedBooking.parentLastName,
					childFirstName: updatedBooking.childFirstName,
					childLastName: updatedBooking.childLastName,
					preferredDate: formattedDate,
					preferredTime: timeToUse,
					confirmedDate: updatedBooking.confirmedDate ? formattedDate : undefined,
					confirmedTime: updatedBooking.confirmedTime,
					phone: updatedBooking.phone,
					isReschedule,
					previousDate: isReschedule ? existingBooking.confirmedDate || existingBooking.preferredDate : undefined,
					previousTime: isReschedule ? existingBooking.confirmedTime || existingBooking.preferredTime : undefined,
				});
				console.log("Confirmation email sent successfully");
			} catch (emailError) {
				console.error("Failed to send confirmation email:", emailError);
				// Don't fail the whole request if email fails
			}
		}

		return NextResponse.json({ message: "Booking updated successfully", tourBooking: updatedBooking }, { status: 200 });
	} catch (error) {
		console.error("Error updating tour booking:", error);
		return NextResponse.json({ message: "Failed to update tour booking", error: error.message }, { status: 500 });
	}
}

// DELETE - Delete a tour booking
export async function DELETE(req) {
	try {
		await connectDB();
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ message: "Missing booking ID" }, { status: 400 });
		}

		const deletedBooking = await TourBooking.findByIdAndDelete(id);

		if (!deletedBooking) {
			return NextResponse.json({ message: "Booking not found" }, { status: 404 });
		}

		console.log("Tour booking deleted:", id);
		return NextResponse.json({ message: "Booking deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting tour booking:", error);
		return NextResponse.json({ message: "Failed to delete tour booking", error: error.message }, { status: 500 });
	}
}
