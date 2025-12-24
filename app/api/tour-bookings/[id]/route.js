import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TourBooking from "@/models/TourBooking.Model";
import mongoose from "mongoose";

// Ensure database connection
connectDB();

// GET - Retrieve a single tour booking by ID
export async function GET(req, { params }) {
	try {
		const { id } = params;

		// Validate ID format
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json({ message: "Invalid booking ID" }, { status: 400 });
		}

		const tourBooking = await TourBooking.findById(id);

		if (!tourBooking) {
			return NextResponse.json({ message: "Tour booking not found" }, { status: 404 });
		}

		return NextResponse.json(tourBooking, { status: 200 });
	} catch (error) {
		console.error("Error retrieving tour booking:", error);
		return NextResponse.json({ message: "Failed to retrieve tour booking", error: error.message }, { status: 500 });
	}
}

// PUT/PATCH - Update a tour booking
export async function PUT(req, { params }) {
	return updateTourBooking(req, params);
}

export async function PATCH(req, { params }) {
	return updateTourBooking(req, params);
}

async function updateTourBooking(req, { id }) {
	try {
		// Validate ID format
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json({ message: "Invalid booking ID" }, { status: 400 });
		}

		const body = await req.json();

		// Find and update the tour booking
		const updatedTourBooking = await TourBooking.findByIdAndUpdate(id, { ...body, updatedAt: Date.now() }, { new: true, runValidators: true });

		if (!updatedTourBooking) {
			return NextResponse.json({ message: "Tour booking not found" }, { status: 404 });
		}

		return NextResponse.json(
			{
				message: "Tour booking updated successfully",
				tourBooking: updatedTourBooking,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating tour booking:", error);

		// Handle validation errors
		if (error.name === "ValidationError") {
			const validationErrors = {};

			for (const field in error.errors) {
				validationErrors[field] = error.errors[field].message;
			}

			return NextResponse.json({ message: "Validation error", errors: validationErrors }, { status: 400 });
		}

		return NextResponse.json({ message: "Failed to update tour booking", error: error.message }, { status: 500 });
	}
}

// DELETE - Delete a tour booking
export async function DELETE(req, { params }) {
	try {
		const { id } = params;

		// Validate ID format
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json({ message: "Invalid booking ID" }, { status: 400 });
		}

		const deletedTourBooking = await TourBooking.findByIdAndDelete(id);

		if (!deletedTourBooking) {
			return NextResponse.json({ message: "Tour booking not found" }, { status: 404 });
		}

		return NextResponse.json({ message: "Tour booking deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting tour booking:", error);
		return NextResponse.json({ message: "Failed to delete tour booking", error: error.message }, { status: 500 });
	}
}
