"use client";
import { useState } from "react";
import useFetchData from "@/hooks/useFetchData";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Printer, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

export default function SubscribersPage() {
	const [deleteId, setDeleteId] = useState(null);
	const { data: admissions, error, loading, mutate } = useFetchData("/api/admissions", "admissions");
	const handlePrint = (data) => {
		// Create a new window to hold the printable content
		// 	<div class="photo-section">
		//     <strong>Child's Photo:</strong><br>
		//     <div class="photo-placeholder">
		//       Photo will be attached separately
		//     </div>
		//   </div>
		const printWindow = window.open("", "", "width=800,height=600");

		// Define the content for printing
		const content = `
    <html>
    <head>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          line-height: 1.4;
        }
        .print-container {
          width: 100%;
          margin: auto;
          padding: 15px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          padding: 8px;
          background-color: #f5f5f5;
          border-left: 4px solid #22c55e;
        }
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        .print-table th, .print-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
          vertical-align: top;
        }
        .print-table th {
          background-color: #f9f9f9;
          font-weight: bold;
          width: 30%;
        }
        .photo-section {
          text-align: center;
          margin: 20px 0;
        }
        .photo-placeholder {
          width: 120px;
          height: 120px;
          border: 2px dashed #ccc;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <div class="header">
          <h1>RSP Norway RSP Norway</h1>
          <p>Student Admission Form</p>
        </div>
	

        <!-- Child Information Section -->
        <div class="section">
          <div class="section-title">Child Information</div>
          <table class="print-table">
            <tr>
              <th>Child's Full Name</th>
              <td>${data.childName || "Not provided"}</td>
            </tr>
            <tr>
              <th>Date of Birth</th>
              <td>${data.dob || "Not provided"}</td>
            </tr>
            <tr>
              <th>Gender</th>
              <td>${data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : "Not provided"}</td>
            </tr>
          </table>
          
          
        </div>

        <!-- Parent/Guardian Information Section -->
        <div class="section">
          <div class="section-title">Parent/Guardian Information</div>
          <table class="print-table">
            <tr>
              <th>Parent/Guardian Full Name</th>
              <td>${data.parentName || "Not provided"}</td>
            </tr>
            <tr>
              <th>Relationship to Child</th>
              <td>${data.relationship ? data.relationship.charAt(0).toUpperCase() + data.relationship.slice(1).replace("-", " ") : "Not provided"}</td>
            </tr>
            <tr>
              <th>Email Address</th>
              <td>${data.email || "Not provided"}</td>
            </tr>
            <tr>
              <th>Phone Number</th>
              <td>${data.phone || "Not provided"}</td>
            </tr>
            <tr>
              <th>Home Address</th>
              <td>${data.address || "Not provided"}</td>
            </tr>
          </table>
        </div>

        <!-- Additional Information Section -->
        <div class="section">
          <div class="section-title">Additional Information</div>
          <table class="print-table">
            <tr>
              <th>Allergies or Medical Conditions</th>
              <td>${data.allergies || "None specified"}</td>
            </tr>
            <tr>
              <th>Emergency Contact Name & Phone</th>
              <td>${data.emergencyContact || "Not provided"}</td>
            </tr>
            <tr>
              <th>Additional Comments or Questions</th>
              <td>${data.comments || "None provided"}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          <p>Application submitted on: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

		// Write the content to the new window
		printWindow.document.write(content);
		printWindow.document.close();

		// Trigger the print dialog
		printWindow.print();
	};

	const handleDelete = async (id) => {
		try {
			const response = await fetch(`/api/admissions/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Failed to delete admission");
			}
			toast.success("Admission deleted successfully!");
			mutate();
		} catch (error) {
			// console.error("Error deleting admission:", error);
			toast.error("Failed to delete admission. Please try again.", error);
		}
	};

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;
	return (
		<div className="max-w-2xl space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>
						Total Applications for Admission: <span className="text-2xl font-bold text-[#0094da] bg-slate-100 px-2 py-1 rounded-full">{admissions?.length}</span>
					</CardTitle>
					<CardDescription>Manage, View and Print admission applications.</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Applicant</TableHead>
								<TableHead>Applied on</TableHead>
								<TableHead>Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{admissions &&
								admissions.map((admission) => (
									<TableRow key={admission._id}>
										<TableCell className="font-medium">
											<div className="flex items-center space-x-4">
												<div>
													<div className="font-bold">{admission?.childName || ""}</div>
												</div>
											</div>
										</TableCell>
										<TableCell>{format(new Date(admission?.submittedAt), "PP")}</TableCell>

										<TableCell>
											<Button variant="ghost" size="icon" onClick={() => setDeleteId(admission._id)}>
												<Trash2 className="h-4 w-4 text-red-700" />
											</Button>

											<Button variant="ghost" size="icon" onClick={() => handlePrint(admission)}>
												<Printer className="h-4 w-4 text-[#0094da]" />
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
								<AlertDialogDescription>This action cannot be undone. This will permanently delete the admission from your database.</AlertDialogDescription>
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
