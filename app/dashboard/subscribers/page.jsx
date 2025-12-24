"use client";
import { useState } from "react";
import useFetchData from "@/hooks/useFetchData";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

export default function SubscribersPage() {
	const [deleteId, setDeleteId] = useState(null);
	const { data: subscribers, error, loading, mutate } = useFetchData("/api/subscribers", "subscribers");

	const handleDelete = async (id) => {
		try {
			const response = await fetch(`/api/subscribers/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Failed to delete subscriber");
			}
			toast.success("Subscriber deleted successfully!");
			mutate();
		} catch (error) {
			// console.error("Error deleting subscriber:", error);
			toast.error("Failed to delete subscriber. Please try again.", error);
		}
	};

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;
	return (
		<div className="max-w-2xl space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>
						Total Subscribers: <span className="text-2xl font-bold text-[#0094da] bg-slate-100 px-2 py-1 rounded-full">{subscribers?.length}</span>
					</CardTitle>
					<CardDescription>Manage and view your newsletter subscribers.</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Subscriber</TableHead>
								<TableHead>Joined</TableHead>
								<TableHead>Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{subscribers &&
								subscribers.map((subscriber) => (
									<TableRow key={subscriber._id}>
										<TableCell className="font-medium">
											<div className="flex items-center space-x-4">
												<div>
													<div className="font-bold">{subscriber?.subscriber || ""}</div>
												</div>
											</div>
										</TableCell>
										<TableCell>{format(new Date(subscriber.createdAt), "PP")}</TableCell>

										<TableCell>
											<Button variant="ghost" size="icon" onClick={() => setDeleteId(subscriber._id)}>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
					<AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
						{/* <div className="fixed inset-0 bg-black bg-opacity-60"></div> */}
						<AlertDialogContent className="bg-white p-6 rounded-lg shadow-lg">
							<AlertDialogHeader>
								<AlertDialogTitle>Are you sure?</AlertDialogTitle>
								<AlertDialogDescription>This action cannot be undone. This will permanently delete the subscriber from your database.</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={() => handleDelete(deleteId)}>Yes, Delete</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardContent>
			</Card>
		</div>
	);
}
