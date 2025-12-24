import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Availability from "@/models/Availability.Model";

// GET - Retrieve all available dates with time slots
export async function GET() {
	try {
		await connectDB();

		// Get all availability records sorted by date
		const availableDates = await Availability.find({}).sort({ date: 1 });

		// Filter out past dates and format the response
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const futureDates = availableDates.filter((avail) => {
			const availDate = new Date(avail.date);
			availDate.setHours(0, 0, 0, 0);
			return availDate >= today;
		});

		return NextResponse.json(futureDates, { status: 200 });
	} catch (error) {
		console.error("Error retrieving availability:", error);
		return NextResponse.json({ message: "Failed to retrieve availability", error: error.message }, { status: 500 });
	}
}

// DELETE - Remove a specific time slot for a given date
export async function DELETE(request) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const dateParam = searchParams.get("date");
		const time = searchParams.get("time");

		if (!dateParam || !time) {
			return NextResponse.json({ message: "Missing date or time" }, { status: 400 });
		}

		const [year, month, day] = dateParam.split("-").map(Number);
		if (!year || !month || !day) {
			return NextResponse.json({ message: "Invalid date" }, { status: 400 });
		}

		const dateUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
		const startOfDay = new Date(dateUtc);
		const endOfDay = new Date(dateUtc);
		endOfDay.setUTCHours(23, 59, 59, 999);

		const availability = await Availability.findOne({
			date: {
				$gte: startOfDay,
				$lte: endOfDay,
			},
			"timeSlots.time": time,
		});

		if (!availability) {
			return NextResponse.json({ message: "Availability not found" }, { status: 404 });
		}

		const slot = availability.timeSlots.find((s) => s.time === time);
		if (slot?.isBooked) {
			return NextResponse.json({ message: "Cannot remove a booked time slot" }, { status: 409 });
		}

		await Availability.updateOne({ _id: availability._id }, { $pull: { timeSlots: { time } }, $set: { updatedAt: new Date() } });
		const updatedAvailability = await Availability.findById(availability._id);

		if (!updatedAvailability || updatedAvailability.timeSlots.length === 0) {
			await Availability.deleteOne({ _id: availability._id });
			return NextResponse.json({ message: "Availability removed" }, { status: 200 });
		}

		return NextResponse.json(updatedAvailability, { status: 200 });
	} catch (error) {
		console.error("Error removing availability time slot:", error);
		return NextResponse.json({ message: "Failed to remove time slot", error: error.message }, { status: 500 });
	}
}
