"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, Heart, AlertCircle, PiggyBank, Receipt } from "lucide-react";

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalDonations: number;
  donationCount: number;
  totalBudgetAllocated: number;
  totalBudgetSpent: number;
  totalBudgetRemaining: number;
  budgetUtilizationPercentage: number;
}

export default function FinancesPage() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/finances/member-summary")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch financial data");
        return res.json();
      })
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [session]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-emerald-600" />
          Organization Finances
        </h1>
        <p className="text-gray-600 mt-1">Current financial status of the organization</p>
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-800">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">
                  {formatCurrency(summary.totalIncome)}
                </div>
                <div className="text-xs text-emerald-700 mt-1">
                  {formatCurrency(summary.monthlyIncome)} this month
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">
                  {formatCurrency(summary.totalExpenses)}
                </div>
                <div className="text-xs text-red-700 mt-1">
                  {formatCurrency(summary.monthlyExpenses)} this month
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Net Income</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.netIncome >= 0 ? "text-blue-900" : "text-red-900"}`}>
                  {formatCurrency(summary.netIncome)}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {summary.netIncome >= 0 ? "Positive balance" : "Negative balance"}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-pink-800">Donations</CardTitle>
                <Heart className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-pink-900">
                  {formatCurrency(summary.totalDonations)}
                </div>
                <div className="text-xs text-pink-700 mt-1">
                  {summary.donationCount} completed donations
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Budget</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {formatCurrency(summary.totalBudgetAllocated)}
                </div>
                <div className="text-xs text-purple-700 mt-1">
                  {formatCurrency(summary.totalBudgetSpent)} spent
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-800">Budget Remaining</CardTitle>
                <PiggyBank className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-900">
                  {formatCurrency(summary.totalBudgetRemaining)}
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  {summary.budgetUtilizationPercentage}% utilized
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Health Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Financial Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700">Income vs Expenses</h3>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${Math.min(
                          (summary.totalIncome / (summary.totalIncome + summary.totalExpenses)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Income: {formatCurrency(summary.totalIncome)}</span>
                    <span>Expenses: {formatCurrency(summary.totalExpenses)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700">Budget Utilization</h3>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        summary.budgetUtilizationPercentage > 100
                          ? "bg-red-500"
                          : summary.budgetUtilizationPercentage > 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(summary.budgetUtilizationPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Allocated: {formatCurrency(summary.totalBudgetAllocated)}</span>
                    <span>Spent: {formatCurrency(summary.totalBudgetSpent)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-sm text-emerald-700 font-medium">Income</div>
                  <div className="text-xl font-bold text-emerald-900">
                    {formatCurrency(summary.monthlyIncome)}
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-700 font-medium">Expenses</div>
                  <div className="text-xl font-bold text-red-900">
                    {formatCurrency(summary.monthlyExpenses)}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700 font-medium">Net</div>
                  <div className={`text-xl font-bold ${summary.monthlyIncome - summary.monthlyExpenses >= 0 ? "text-blue-900" : "text-red-900"}`}>
                    {formatCurrency(summary.monthlyIncome - summary.monthlyExpenses)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
