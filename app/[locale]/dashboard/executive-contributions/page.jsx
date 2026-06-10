"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetchData from "@/hooks/useFetchData";

export default function ExecutiveContributionsPage() {
	const { data: session } = useSession();
	const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
	const [contributions, setContributions] = useState([]);
	const [summary, setSummary] = useState({ totalDue: 0, totalPaid: 0, totalRemaining: 0, pendingCount: 0, paidCount: 0 });
	const [showAddModal, setShowAddModal] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(null);
	const [showPaymentsModal, setShowPaymentsModal] = useState(null);
	const [newContribution, setNewContribution] = useState({ memberId: "", memberEmail: "", memberName: "", year: "", totalDue: 1200 });
	const [payment, setPayment] = useState({ amount: "", paymentDate: new Date().toISOString().split("T")[0], paymentMethod: "cash", notes: "" });
	const [submitting, setSubmitting] = useState(false);

	const { data: executiveMembers } = useFetchData("/api/membership", "memberships");

	const fetchContributions = useCallback(async () => {
		try {
			const res = await fetch(`/api/executive-contributions${filterYear ? `?year=${filterYear}` : ""}`);
			if (res.ok) {
				const data = await res.json();
				setContributions(data.contributions || []);
				setSummary(data.summary || { totalDue: 0, totalPaid: 0, totalRemaining: 0, pendingCount: 0, paidCount: 0 });
			}
		} catch (err) {
			console.error("Error fetching contributions:", err);
		}
	}, [filterYear]);

	useEffect(() => {
		fetchContributions();
	}, [fetchContributions]);

	const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());

	const handleCreateContribution = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const res = await fetch("/api/executive-contributions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...newContribution, year: parseInt(newContribution.year) }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			setShowAddModal(false);
			setNewContribution({ memberId: "", memberEmail: "", memberName: "", year: "", totalDue: 1200 });
			fetchContributions();
		} catch (error) {
			alert("Error: " + error.message);
		} finally {
			setSubmitting(false);
		}
	};

	const handleAddPayment = async (e) => {
		e.preventDefault();
		if (!showPaymentModal) return;
		setSubmitting(true);
		try {
			const res = await fetch(`/api/executive-contributions/${showPaymentModal._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "add-payment",
					amount: parseFloat(payment.amount),
					paymentDate: payment.paymentDate,
					paymentMethod: payment.paymentMethod,
					notes: payment.notes,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			if (data.warning) alert("Warning: " + data.warning);
			setShowPaymentModal(null);
			setPayment({ amount: "", paymentDate: new Date().toISOString().split("T")[0], paymentMethod: "cash", notes: "" });
			fetchContributions();
		} catch (error) {
			alert("Error: " + error.message);
		} finally {
			setSubmitting(false);
		}
	};

	const statusBadge = (status) => {
		const styles = {
			paid: "bg-green-100 text-green-800",
			partial: "bg-yellow-100 text-yellow-800",
			pending: "bg-gray-100 text-gray-800",
			overdue: "bg-red-100 text-red-800",
		};
		return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>{status}</span>;
	};

	if (!session?.user) return <p>Loading...</p>;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:justify-between items-stretch gap-2">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Executive Contributions</h1>
					<p className="text-gray-600 mt-1">Manage 100 NOK/month membership contributions</p>
				</div>
				<div className="flex gap-2">
					<select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="border border-gray-300 rounded px-2 text-sm">
						<option value="">All Years</option>
						{years.map((y) => (
							<option key={y} value={y}>
								{y}
							</option>
						))}
					</select>
					<Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
						<Plus className="w-4 h-4" /> New Record
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-gray-600">Total Due</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">NOK {summary.totalDue.toLocaleString()}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-gray-600">Total Collected</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold text-green-600">NOK {summary.totalPaid.toLocaleString()}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-gray-600">Remaining</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold text-amber-600">NOK {summary.totalRemaining.toLocaleString()}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-gray-600">Pending</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{summary.pendingCount} members</p>
					</CardContent>
				</Card>
			</div>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b bg-gray-50">
							<th className="text-left p-3 font-semibold">Member</th>
							<th className="text-left p-3 font-semibold">Email</th>
							<th className="text-center p-3 font-semibold">Year</th>
							<th className="text-right p-3 font-semibold">Due (NOK)</th>
							<th className="text-right p-3 font-semibold">Paid (NOK)</th>
							<th className="text-right p-3 font-semibold">Remaining (NOK)</th>
							<th className="text-center p-3 font-semibold">Status</th>
							<th className="text-center p-3 font-semibold">Actions</th>
						</tr>
					</thead>
					<tbody>
						{contributions.length === 0 ? (
							<tr>
								<td colSpan={8} className="text-center p-6 text-gray-500">
									No contributions found
								</td>
							</tr>
						) : (
							contributions.map((c) => (
								<tr key={c._id} className="border-b hover:bg-gray-50">
									<td className="p-3 font-medium">{c.memberName}</td>
									<td className="p-3 text-gray-600">{c.memberEmail}</td>
									<td className="p-3 text-center">{c.year}</td>
									<td className="p-3 text-right">{c.totalDue.toLocaleString()}</td>
									<td className="p-3 text-right text-green-600">{c.amountPaid.toLocaleString()}</td>
									<td className="p-3 text-right text-amber-600">{(c.totalDue - c.amountPaid).toLocaleString()}</td>
									<td className="p-3 text-center">{statusBadge(c.status)}</td>
									<td className="p-3 text-center">
										<div className="flex justify-center gap-2">
											<button onClick={() => setShowPaymentModal(c)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
												Add Payment
											</button>
											<button onClick={() => setShowPaymentsModal(c)} className="text-gray-600 hover:text-gray-800 text-xs font-medium">
												History
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* New Contribution Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
					<div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-bold">New Contribution Record</h2>
							<button onClick={() => setShowAddModal(false)}>
								<X className="w-5 h-5" />
							</button>
						</div>
						<form onSubmit={handleCreateContribution} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1">Executive Member *</label>
								<select
									required
									value={newContribution.memberId}
									onChange={(e) => {
										const member = executiveMembers.find((m) => m._id === e.target.value);
										setNewContribution({
											...newContribution,
											memberId: e.target.value,
											memberEmail: member?.email || "",
											memberName: member?.fullName || "",
										});
									}}
									className="w-full p-2 border rounded"
								>
									<option value="">Select member...</option>
									{executiveMembers.map((m) => (
										<option key={m._id} value={m._id}>
											{m.fullName}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Year *</label>
								<select required value={newContribution.year} onChange={(e) => setNewContribution({ ...newContribution, year: e.target.value })} className="w-full p-2 border rounded">
									<option value="">Select year...</option>
									{years.map((y) => (
										<option key={y} value={y}>
											{y}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Total Due (NOK)</label>
								<input type="number" min={1} value={newContribution.totalDue} onChange={(e) => setNewContribution({ ...newContribution, totalDue: parseInt(e.target.value) })} className="w-full p-2 border rounded" />
								<p className="text-xs text-gray-500 mt-1">Default: 1200 (100 NOK × 12 months)</p>
							</div>
							<Button type="submit" disabled={submitting} className="w-full">
								{submitting ? "Creating..." : "Create Record"}
							</Button>
						</form>
					</div>
				</div>
			)}

			{/* Add Payment Modal */}
			{showPaymentModal && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentModal(null)}>
					<div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
						<div className="flex justify-between items-center mb-4">
							<div>
								<h2 className="text-lg font-bold">Record Payment</h2>
								<p className="text-sm text-gray-600">
									{showPaymentModal.memberName} — Year {showPaymentModal.year}
								</p>
							</div>
							<button onClick={() => setShowPaymentModal(null)}>
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="bg-gray-50 rounded p-3 mb-4 text-sm space-y-1">
							<p>
								Total Due: <strong>NOK {showPaymentModal.totalDue}</strong>
							</p>
							<p>
								Already Paid: <strong>NOK {showPaymentModal.amountPaid}</strong>
							</p>
							<p>
								Remaining: <strong>NOK {showPaymentModal.totalDue - showPaymentModal.amountPaid}</strong>
							</p>
						</div>
						<form onSubmit={handleAddPayment} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1">Amount (NOK) *</label>
								<input type="number" min={1} required value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} className="w-full p-2 border rounded" />
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Payment Date *</label>
								<input type="date" required value={payment.paymentDate} onChange={(e) => setPayment({ ...payment, paymentDate: e.target.value })} className="w-full p-2 border rounded" />
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Payment Method</label>
								<select value={payment.paymentMethod} onChange={(e) => setPayment({ ...payment, paymentMethod: e.target.value })} className="w-full p-2 border rounded">
									<option value="cash">Cash</option>
									<option value="bank_transfer">Bank Transfer</option>
									<option value="card">Card</option>
									<option value="vipps">Vipps</option>
									<option value="online">Online</option>
									<option value="other">Other</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Notes</label>
								<textarea value={payment.notes} onChange={(e) => setPayment({ ...payment, notes: e.target.value })} className="w-full p-2 border rounded" rows={2} />
							</div>
							<Button type="submit" disabled={submitting} className="w-full">
								{submitting ? "Recording..." : "Record Payment"}
							</Button>
						</form>
					</div>
				</div>
			)}

			{/* Payment History Modal */}
			{showPaymentsModal && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentsModal(null)}>
					<div className="bg-white rounded-lg max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
						<div className="flex justify-between items-center mb-4">
							<div>
								<h2 className="text-lg font-bold">Payment History</h2>
								<p className="text-sm text-gray-600">
									{showPaymentsModal.memberName} — Year {showPaymentsModal.year}
								</p>
							</div>
							<button onClick={() => setShowPaymentsModal(null)}>
								<X className="w-5 h-5" />
							</button>
						</div>
						{showPaymentsModal.payments?.length > 0 ? (
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b bg-gray-50">
										<th className="text-left p-2 font-semibold">Date</th>
										<th className="text-right p-2 font-semibold">Amount</th>
										<th className="text-center p-2 font-semibold">Method</th>
										<th className="text-left p-2 font-semibold">Notes</th>
									</tr>
								</thead>
								<tbody>
									{showPaymentsModal.payments.map((p, i) => (
										<tr key={i} className="border-b">
											<td className="p-2">{new Date(p.paymentDate).toLocaleDateString()}</td>
											<td className="p-2 text-right font-medium">NOK {p.amount}</td>
											<td className="p-2 text-center capitalize">{p.paymentMethod}</td>
											<td className="p-2 text-gray-600">{p.notes || "-"}</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<p className="text-center text-gray-500 py-4">No payments recorded yet</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
