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
				});
				if (!response.ok) {
					throw new Error("Failed to delete event");
				}
				mutate();
			} catch (error) {
				console.error("Error deleting event:", error);
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
		setOpenEventModal(true);
	};

	return (
		<div className="w-full max-w-full px-2 sm:px-6">
			<div className="flex flex-col sm:flex-row sm:justify-end items-stretch gap-2 mt-2 mb-4">
				<button onClick={handleCreateEvent} className="bg-red-800 text-slate-200 font-bold px-4 py-2 rounded w-full sm:w-auto text-center">
					Create Event
				</button>
			</div>
			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<Table className="min-w-[700px]">
					<TableHeader>
						<TableRow>
							<TableHead>Event Name</TableHead>
							<TableHead>Event Description</TableHead>
							<TableHead>Event Venue</TableHead>
							<TableHead>Event Date</TableHead>
							<TableHead>Event Time</TableHead>
							<TableHead>Poster</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{events.length > 0 ? (
							events.map((event) => (
								<TableRow key={event._id}>
									<TableCell className="font-semibold max-w-40 truncate whitespace-normal break-words">{event.eventname}</TableCell>
									<TableCell className="max-w-40 truncate whitespace-normal break-words">{event.eventdescription}</TableCell>
									<TableCell>{event.eventvenue}</TableCell>
									<TableCell className="w-24">{event.eventdate}</TableCell>
									<TableCell className="w-28">{event.eventtime}</TableCell>
									<TableCell>
										<Image src={event.eventposterUrl || "/placeholder.jpg"} width={100} height={100} alt={event.eventname || "alt"} className="w-16 h-20 object-cover rounded" />
									</TableCell>
									<TableCell>
										<div className="flex flex-col sm:flex-row gap-2">
											<Button variant="ghost" size="icon" onClick={() => handleEdit(event)} className="w-8 h-8">
												<Pencil className="w-5 h-5 text-blue-700" />
											</Button>
											<Button variant="ghost" size="icon" onClick={() => handleDelete(event._id)} className="w-8 h-8">
												<Trash2 className="w-5 h-5 text-red-700" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={7} className="text-center">
									No events found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{openEventModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
					<div className="bg-white p-2 sm:p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-2xl mx-auto">
						<h2 className="text-base sm:text-lg font-bold text-slate-200 bg-brand p-2 sm:p-4 mb-4 sm:mb-6 text-center">{eventToEdit ? "Edit Event" : "Create Event"}</h2>
						<EventForm handleCloseEventModal={handleCloseEventModal} eventToEdit={eventToEdit} />
					</div>
				</div>
			)}
		</div>
	);
}
