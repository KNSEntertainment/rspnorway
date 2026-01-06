"use client";

import React, { useState } from "react";
import useFetchData from "@/hooks/useFetchData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import NoticeForm from "@/components/NoticeForm";

export default function NoticesPage() {
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [noticeToEdit, setNoticeToEdit] = useState(null);
	const { data: notices, error, loading, mutate } = useFetchData("/api/notices", "notices");

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	const handleEdit = (notice) => {
		setNoticeToEdit(notice);
		setOpenNoticeModal(true);
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this notice?")) {
			try {
				const response = await fetch(`/api/notices/${id}`, {
					method: "DELETE",
				});
				if (!response.ok) {
					throw new Error("Failed to delete notice");
				}
				mutate();
			} catch (error) {
				console.error("Error deleting notice:", error);
				alert("Failed to delete notice. Please try again.");
			}
		}
	};

	const handleCloseNoticeModal = () => {
		setOpenNoticeModal(false);
		setNoticeToEdit(null);
		mutate();
	};

	const handleCreateNotice = () => {
		setNoticeToEdit(null);
		setOpenNoticeModal(true);
	};

	return (
		<div className="max-w-4xl">
			<div className="text-right">
				<button onClick={handleCreateNotice} className="bg-red-800 text-slate-200 font-bold px-4 py-2 my-4">
					Create Notice
				</button>
			</div>
			<div className=" bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Notice Title</TableHead>
							<TableHead>Notice</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Photo</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{notices.length > 0 ? (
							notices.map((notice) => (
								<TableRow key={notice._id}>
									<TableCell className="w-48 font-semibold">{notice.noticetitle}</TableCell>
									<TableCell className="w-48">{notice.notice}</TableCell>
									<TableCell className="w-72">{notice.noticedate}</TableCell>
									<TableCell className="w-24">
										<Image src={notice.noticeimage || "/placeholder.jpg"} width={200} height={200} alt={notice.notice || "alt"} className="w-16 h-16 rounded-full object-cover" />
									</TableCell>
									<TableCell>
										<div className="flex space-x-2">
											<Button variant="ghost" size="icon" onClick={() => handleEdit(notice)}>
												<Pencil className="w-6 h-6 text-blue-700" />
											</Button>
											<Button variant="ghost" size="icon" onClick={() => handleDelete(notice._id)}>
												<Trash2 className="w-6 h-6 text-red-700" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={5} className="text-red-600">
									No notices found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{openNoticeModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h2 className="text-lg font-bold text-slate-200 bg-brand p-4 mb-6 text-center">{noticeToEdit ? "Edit Notice" : "Create Notice"}</h2>
						<NoticeForm handleCloseNoticeModal={handleCloseNoticeModal} noticeToEdit={noticeToEdit} fetchNotices={notices} />
					</div>
				</div>
			)}
		</div>
	);
}
