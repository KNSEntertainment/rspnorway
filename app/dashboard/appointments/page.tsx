"use client";

import { Suspense } from "react";
import AdminDashboard from "@/app/dashboard/appointments/admin-dashboard";
import useFetchData from "@/hooks/useFetchData";

export default function AdminPage() {
	const { data: tourBookings, loading, error, mutate } = useFetchData("/api/tour-bookings");

	return (
		<div className="container mx-auto px-4 py-8">
			{/* <h1 className="text-3xl font-bold mb-2">School Tour Appointments</h1>
			<p className="text-gray-600 mb-8">Manage tour bookings and availability</p> */}

			{loading && <div className="text-center py-8">Loading appointments...</div>}
			{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">Error loading appointments: {error}</div>}

			<Suspense fallback={<div>Loading dashboard...</div>}>
				<AdminDashboard appointments={tourBookings || []} onRefresh={mutate} />
			</Suspense>
		</div>
	);
}
