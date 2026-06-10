"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContributionSummary {
  totalDue: number;
  totalPaid: number;
  remaining: number;
}

interface Payment {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
  transactionId?: string;
}

interface Contribution {
  _id: string;
  memberName: string;
  year: number;
  totalDue: number;
  amountPaid: number;
  status: string;
  payments?: Payment[];
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  paymentMethod: string;
}

interface ContributionsResponse {
  contributions: Contribution[];
  summary: ContributionSummary;
  transactions: Transaction[];
}

export default function MyContributionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContributionsResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/executive-contributions/my");
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  const contributions = result?.contributions || [];
  const summary = result?.summary || { totalDue: 0, totalPaid: 0, remaining: 0 };
  const transactions = result?.transactions || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Contributions</h1>
        <p className="text-gray-600 mt-1">Executive membership contributions at 100 NOK/month</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">NOK {summary.totalDue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">NOK {summary.totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${summary.remaining > 0 ? "text-amber-600" : "text-green-600"}`}>
              NOK {summary.remaining.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-semibold">Year</th>
              <th className="text-right p-3 font-semibold">Due (NOK)</th>
              <th className="text-right p-3 font-semibold">Paid (NOK)</th>
              <th className="text-right p-3 font-semibold">Remaining (NOK)</th>
              <th className="text-center p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {contributions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">No contribution records found</td>
              </tr>
            ) : (
              contributions.map((c) => (
                <tr key={c._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{c.year}</td>
                  <td className="p-3 text-right">{c.totalDue.toLocaleString()}</td>
                  <td className="p-3 text-right text-green-600">{c.amountPaid.toLocaleString()}</td>
                  <td className="p-3 text-right text-amber-600">{(c.totalDue - c.amountPaid).toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === "paid" ? "bg-green-100 text-green-800" :
                      c.status === "partial" ? "bg-yellow-100 text-yellow-800" :
                      c.status === "overdue" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payment history per year */}
      {contributions.filter(c => c.payments && c.payments.length > 0).length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Payment History</h2>
          </div>
          {contributions.filter(c => c.payments && c.payments.length > 0).map((c) => (
            <div key={c._id} className="border-b last:border-b-0">
              <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                {c.year} — {c.memberName}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Date</th>
                    <th className="text-right p-2 font-semibold">Amount</th>
                    <th className="text-center p-2 font-semibold">Method</th>
                    <th className="text-left p-2 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {c.payments?.map((p, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-2">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="p-2 text-right font-medium">NOK {p.amount}</td>
                      <td className="p-2 text-center capitalize">{p.paymentMethod}</td>
                      <td className="p-2 text-gray-600">{p.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Financial Transactions</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">Date</th>
                <th className="text-left p-3 font-semibold">Category</th>
                <th className="text-left p-3 font-semibold">Description</th>
                <th className="text-right p-3 font-semibold">Amount</th>
                <th className="text-center p-3 font-semibold">Method</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-3 capitalize">{t.category}</td>
                  <td className="p-3 text-gray-600">{t.description || "-"}</td>
                  <td className="p-3 text-right font-medium text-green-600">
                    +NOK {t.amount.toLocaleString()}
                  </td>
                  <td className="p-3 text-center capitalize">{t.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
