import { Suspense } from "react";
import { getAvailableDates } from "@/lib/actions-mongoose";
import BookingForm from "./booking-form";

export default async function BookPage() {
	// Get available dates from MongoDB
	const availableDates = await getAvailableDates();

	return (
		<div className="container mx-auto px-4 py-12 max-w-3xl">
			<h1 className="text-4xl font-bold text-center mb-2">Book Your Appointment</h1>
			<p className="text-center text-gray-500 mb-8">Select an available date and time for your appointment</p>

			<Suspense fallback={<div>Loading booking form...</div>}>
				<BookingForm availableDates={availableDates} />
			</Suspense>
		</div>
	);
}
