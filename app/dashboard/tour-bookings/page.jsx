"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
// import { useRouter } from "next/navigation";

export default function AdminTourBookings() {
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [statusFilter, setStatusFilter] = useState("all");
	const [dateFilter, setDateFilter] = useState("");
	// const router = useRouter();

	// const [isAuthenticated, setIsAuthenticated] = useState(false);

	// useEffect(() => {

	// 	const checkAuth = async () => {
	// 		try {
	// 			const isAuth = localStorage.getItem("adminAuthenticated") === "true";
	// 			setIsAuthenticated(isAuth);

	// 			if (!isAuth) {
	// 				router.push("/admin/login");
	// 			}
	// 		} catch (error) {
	// 			console.error("Auth error:", error);
	// 		}
	// 	};

	// 	checkAuth();
	// }, [router]);

	// Fetch bookings based on filters
	useEffect(() => {
		const fetchBookings = async () => {
			// if (!isAuthenticated) return;

			setLoading(true);
			try {
				let url = "/api/tour-bookings";
				const params = new URLSearchParams();

				if (statusFilter !== "all") {
					params.append("status", statusFilter);
				}

				if (dateFilter) {
					params.append("date", dateFilter);
				}

				if (params.toString()) {
					url += `?${params.toString()}`;
				}

				const response = await fetch(url);

				if (!response.ok) {
					throw new Error("Failed to fetch bookings");
				}

				const data = await response.json();
				setBookings(data);
				setError(null);
			} catch (err) {
				console.error("Error fetching bookings:", err);
				setError("Failed to load bookings. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchBookings();
	}, [statusFilter, dateFilter]);

	const handleStatusChange = async (id, newStatus) => {
		try {
			const response = await fetch(`/api/tour-bookings/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				throw new Error("Failed to update booking status");
			}

			// Update booking in the state
			setBookings(bookings.map((booking) => (booking._id === id ? { ...booking, status: newStatus } : booking)));
		} catch (err) {
			console.error("Error updating booking status:", err);
			setError("Failed to update booking status.");
		}
	};

	const handleDeleteBooking = async (id) => {
		if (!confirm("Are you sure you want to delete this booking?")) {
			return;
		}

		try {
			const response = await fetch(`/api/tour-bookings/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete booking");
			}

			// Remove booking from the state
			setBookings(bookings.filter((booking) => booking._id !== id));
		} catch (err) {
			console.error("Error deleting booking:", err);
			setError("Failed to delete booking.");
		}
	};

	// Format date for display
	const formatDate = (dateString) => {
		const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	// if (!isAuthenticated) {
	// 	return <div className="text-center py-10">Checking authentication...</div>;
	// }

	return (
		<>
			<Head>
				<title>Admin - Tour Bookings | RSP Norway School</title>
				<meta name="robots" content="noindex, nofollow" />
			</Head>

			<div className="container mx-auto p-4">
				<h1 className="text-2xl md:text-3xl font-bold mb-6">Tour Bookings Management</h1>

				{/* Filters */}
				<div className="bg-white p-4 rounded-lg shadow-md mb-6">
					<div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
						<div>
							<label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
								Status Filter
							</label>
							<select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md w-full md:w-auto">
								<option value="all">All Statuses</option>
								<option value="pending">Pending</option>
								<option value="confirmed">Confirmed</option>
								<option value="completed">Completed</option>
								<option value="cancelled">Cancelled</option>
							</select>
						</div>

						<div>
							<label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
								Date Filter
							</label>
							<input id="dateFilter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md w-full md:w-auto" />
						</div>

						<div className="md:self-end mt-auto">
							<button
								onClick={() => {
									setStatusFilter("all");
									setDateFilter("");
								}}
								className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
							>
								Clear Filters
							</button>
						</div>
					</div>
				</div>

				{/* Error message */}
				{error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

				{/* Bookings table */}
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					{loading ? (
						<div className="text-center py-10">Loading bookings...</div>
					) : bookings.length === 0 ? (
						<div className="text-center py-10">No bookings found.</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Child</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour Date/Time</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{bookings.map((booking) => (
										<tr key={booking._id} className="hover:bg-gray-50">
											<td className="px-4 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{booking.parentFirstName} {booking.parentLastName}
												</div>
											</td>
											<td className="px-4 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900">
													{booking.childFirstName} {booking.childLastName}
												</div>
												<div className="text-sm text-gray-500">{new Date(booking.childDob).toLocaleDateString()}</div>
											</td>
											<td className="px-4 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900">{booking.email}</div>
												<div className="text-sm text-gray-500">{booking.phone}</div>
											</td>
											<td className="px-4 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900">{formatDate(booking.preferredDate)}</div>
												<div className="text-sm text-gray-500">{booking.preferredTime}</div>
												{booking.alternateDate && (
													<div className="text-xs text-gray-500 mt-1">
														Alt: {formatDate(booking.alternateDate)} {booking.alternateTime}
													</div>
												)}
											</td>
											<td className="px-4 py-4 whitespace-nowrap">
												<span
													className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${booking.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                          ${booking.status === "confirmed" ? "bg-blue-100 text-blue-800" : ""}
                          ${booking.status === "completed" ? "bg-[#0094da] text-[#0094da]" : ""}
                          ${booking.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
                        `}
												>
													{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
												</span>
											</td>
											<td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
												<div className="flex space-x-2">
													<select value={booking.status} onChange={(e) => handleStatusChange(booking._id, e.target.value)} className="text-xs border border-gray-300 rounded-md">
														<option value="pending">Pending</option>
														<option value="confirmed">Confirmed</option>
														<option value="completed">Completed</option>
														<option value="cancelled">Cancelled</option>
													</select>

													{/* <button onClick={() => router.push(`/dashboard/tour-bookings/${booking._id}`)} className="text-indigo-600 hover:text-indigo-900">
														View
													</button> */}

													<button onClick={() => handleDeleteBooking(booking._id)} className="text-red-600 hover:text-red-900">
														Delete
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
