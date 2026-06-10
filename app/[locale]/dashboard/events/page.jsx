"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, XCircle, Eye, X } from "lucide-react";
import Image from "next/image";
import EventForm from "@/components/EventForm";
import useFetchData from "@/hooks/useFetchData";

export default function EventsPage() {
	const [openEventModal, setOpenEventModal] = useState(false);
	const [eventToEdit, setEventToEdit] = useState(null);
	const [activeTab, setActiveTab] = useState("events");
	const [selectedEventId, setSelectedEventId] = useState("");
	const [statusFilter, setStatusFilter] = useState("pending");
	const [paymentProofModal, setPaymentProofModal] = useState(null);
	const { data: events, mutate } = useFetchData("/api/events", "events");
	const { data: registrations, error: regError, loading: regLoading, mutate: regMutate } = useFetchData(
		`/api/events/registrations${selectedEventId ? `?eventId=${selectedEventId}` : ""}${statusFilter ? `${selectedEventId ? "&" : "?"}status=${statusFilter}` : ""}`,
		"registrations"
	);

	const handleEdit = (event) => {
		setEventToEdit(event);
		setOpenEventModal(true);
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this event?")) {
			try {
				const response = await fetch(`/api/events/${id}`, {
					method: "DELETE",
					credentials: "include",
				});
				const data = await response.json();
				if (!response.ok) {
					throw new Error(data.error || "Failed to delete event");
				}
				alert("Event deleted successfully!");
				mutate();
			} catch (error) {
				console.error("Error deleting event:", error);
				alert(`Error: ${error.message}`);
			}
		}
	};

	const handleCloseEventModal = () => {
		setOpenEventModal(false);
		setEventToEdit(null);
		mutate();
	};

	const handleCreateEvent = () => {
		setEventToEdit(null);
		setOpenEventModal(!openEventModal);
	};

	const handleApproveReject = async (registrationId, action) => {
		if (action === "reject" && !window.confirm("Are you sure you want to reject this registration?")) {
			return;
		}
		try {
			const response = await fetch(`/api/events/register/${registrationId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action }),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || `Failed to ${action} registration`);
			}
			alert(`Registration ${action}d successfully!`);
			regMutate();
		} catch (error) {
			console.error(`Error ${action}ing registration:`, error);
			alert(`Error: ${error.message}`);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4 border-b border-gray-200">
				<button
					onClick={() => setActiveTab("events")}
					className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "events" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
				>
					Events
				</button>
				<button
					onClick={() => setActiveTab("registrations")}
					className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "registrations" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
				>
					Registrations
				</button>
			</div>

			{activeTab === "events" && (
				<>
					<div className="flex flex-col sm:flex-row sm:justify-between items-stretch gap-2">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
							<p className="text-gray-600 mt-1">Create and manage events</p>
						</div>
						<button onClick={handleCreateEvent} className="bg-brand text-neutral-200 font-bold px-4 py-2 rounded w-full sm:w-auto text-center hover:bg-red-700 transition-colors">
							{openEventModal ? "Cancel" : "Create Event"}
						</button>
					</div>

					{openEventModal && (
						<div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border-2 border-brand">
							<h2 className="text-base sm:text-lg font-bold text-white bg-brand p-2 sm:p-4 mb-4 text-center rounded">{eventToEdit ? "Edit Event" : "Create Event"}</h2>
							<EventForm handleCloseEventModal={handleCloseEventModal} eventToEdit={eventToEdit} />
						</div>
					)}
					<div className="bg-white rounded-lg shadow overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Event Name</TableHead>
									<TableHead>Venue</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Time</TableHead>
									<TableHead>Tickets</TableHead>
									<TableHead>Poster</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{events?.length > 0 ? (
									events.map((event) => (
										<TableRow key={event._id}>
											<TableCell className="font-semibold whitespace-normal break-words">{event.eventname}</TableCell>
											<TableCell>{event.eventvenue}</TableCell>
											<TableCell>{event.eventdate}</TableCell>
											<TableCell>{event.eventtime}</TableCell>
											<TableCell>Adult: NOK {event.price || 0}<br />Student: NOK {event.studentPrice || 0}<br />Child: NOK {event.childPrice || 0}{event.childAgeLimit ? ` (${event.childAgeLimit})` : ""}<br />Elderly: NOK {event.elderlyPrice || 0}{event.elderlyAgeLimit ? ` (${event.elderlyAgeLimit})` : ""}</TableCell>
											<TableCell>
												<Image src={event.eventposterUrl || "/ghanti.png"} width={100} height={100} alt={event.eventname || "alt"} className="w-16 h-20 object-cover rounded" />
											</TableCell>
											<TableCell>
												<div className="flex gap-2">
													<Button variant="ghost" size="icon" onClick={() => handleEdit(event)} className="w-8 h-8">
														<Pencil className="w-5 h-5 text-brand" />
													</Button>
													<Button variant="ghost" size="icon" onClick={() => handleDelete(event._id)} className="w-8 h-8">
														<Trash2 className="w-5 h-5 text-red-600" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={10} className="text-center">
											No events found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</>
			)}

			{activeTab === "registrations" && (
				<>
					<div className="flex flex-col sm:flex-row sm:justify-between items-stretch gap-2">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Manage Registrations</h1>
							<p className="text-gray-600 mt-1">View and manage event registrations</p>
						</div>
						<div className="flex gap-2">
							<select
								value={selectedEventId}
								onChange={(e) => setSelectedEventId(e.target.value)}
								className="border border-gray-300 rounded px-3 py-2 text-sm"
							>
								<option value="">All Events</option>
								{events?.map((event) => (
									<option key={event._id} value={event._id}>{event.eventname}</option>
								))}
							</select>
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="border border-gray-300 rounded px-3 py-2 text-sm"
							>
								<option value="">All Status</option>
								<option value="pending">Pending</option>
								<option value="confirmed">Confirmed</option>
								<option value="cancelled">Cancelled</option>
							</select>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow overflow-x-auto">
						{regLoading ? (
							<p className="p-6 text-center text-gray-500">Loading registrations...</p>
						) : regError ? (
							<p className="p-6 text-center text-red-500">Error: {regError}</p>
						) : registrations?.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Registration ID</TableHead>
										<TableHead>Event</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Phone</TableHead>
										<TableHead>Attendees</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Payment Proof</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{registrations.map((reg) => (
										<TableRow key={reg._id}>
											<TableCell className="font-mono text-xs">{reg.registrationId}</TableCell>
											<TableCell>{reg.eventId?.eventname || "N/A"}</TableCell>
											<TableCell>{reg.firstName} {reg.lastName}</TableCell>
											<TableCell>{reg.email}</TableCell>
											<TableCell>{reg.phone}</TableCell>
											<TableCell>
												{reg.adults} adult{reg.adults > 1 ? "s" : ""}
												{reg.students > 0 ? `, ${reg.students} student${reg.students > 1 ? "s" : ""}` : ""}
												{reg.children > 0 ? `, ${reg.children} child${reg.children > 1 ? "ren" : ""}` : ""}
												{reg.elders > 0 ? `, ${reg.elders} elder${reg.elders > 1 ? "ly" : ""}` : ""}
											</TableCell>
											<TableCell>NOK {reg.totalAmount || 0}</TableCell>
											<TableCell>
												<span className={`px-2 py-1 rounded-full text-xs font-medium ${
													reg.status === "confirmed" ? "bg-green-100 text-green-800" :
													reg.status === "pending" ? "bg-yellow-100 text-yellow-800" :
													"bg-red-100 text-red-800"
												}`}>
													{reg.status}
												</span>
											</TableCell>
											<TableCell>
												{reg.paymentProofUrl ? (
													<button onClick={() => setPaymentProofModal(reg.paymentProofUrl)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
														<Eye className="w-4 h-4" />
														View
													</button>
												) : (
													<span className="text-gray-400 text-sm">N/A</span>
												)}
											</TableCell>
											<TableCell>
												{reg.status === "pending" ? (
													<div className="flex gap-1">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleApproveReject(reg._id, "approve")}
															className="w-8 h-8 text-green-600 hover:text-green-800"
															title="Approve"
														>
															<CheckCircle className="w-5 h-5" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleApproveReject(reg._id, "reject")}
															className="w-8 h-8 text-red-600 hover:text-red-800"
															title="Reject"
														>
															<XCircle className="w-5 h-5" />
														</Button>
													</div>
												) : (
													<span className="text-gray-400 text-sm">-</span>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<p className="p-6 text-center text-gray-500">No registrations found.</p>
						)}
					</div>
				</>
			)}
			{paymentProofModal && (
				<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPaymentProofModal(null)}>
					<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between p-4 border-b">
							<h3 className="font-semibold text-lg">Payment Proof</h3>
							<button onClick={() => setPaymentProofModal(null)} className="p-1 hover:bg-gray-100 rounded">
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-4">
							<Image
								src={paymentProofModal}
								alt="Payment proof"
								width={800}
								height={600}
								className="w-full h-auto rounded"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
