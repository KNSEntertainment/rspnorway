"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import EventForm from "@/components/EventForm";
import useFetchData from "@/hooks/useFetchData";

export default function EventsPage() {
	const [openEventModal, setOpenEventModal] = useState(false);
	const [eventToEdit, setEventToEdit] = useState(null);
	const { data: events, error, loading, mutate } = useFetchData("/api/events", "events");

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

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

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:justify-between items-stretch gap-2">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
					<p className="text-gray-600 mt-1">Create and manage events</p>
				</div>
				<button onClick={handleCreateEvent} className="bg-brand text-neutral-200 font-bold px-4 py-2 rounded w-full sm:w-auto text-center hover:bg-red-700 transition-colors">
					{openEventModal ? "Cancel" : "Create Event"}
				</button>
			</div>

			{/* Inline Form Section */}
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
						{events.length > 0 ? (
							events.map((event) => (
								<TableRow key={event._id}>
									<TableCell className="font-semibold whitespace-normal break-words">{event.eventname}</TableCell>
									<TableCell>{event.eventvenue}</TableCell>
									<TableCell>{event.eventdate}</TableCell>
									<TableCell>{event.eventtime}</TableCell>
									<TableCell>Adult: NOK {event.price || 0}<br />Student: NOK {event.studentPrice || 0}</TableCell>
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
		</div>
	);
}
