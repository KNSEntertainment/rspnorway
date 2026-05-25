import {  NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FinancialTransaction from "@/models/FinancialTransaction.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentWeek = new Date(now);
    currentWeek.setDate(now.getDate() - now.getDay());

    // Calculate summary statistics
    const [
      totalIncome,
      totalExpenses,
      pendingCount,
      verifiedCount,
      disputedCount,
      monthlyIncome,
      monthlyExpenses,
      weeklyIncome,
      weeklyExpenses,
      donationIncome,
      eventIncome,
      membershipIncome,
      otherIncome
    ] = await Promise.all([
      // Total income and expenses (with date filter)
      FinancialTransaction.aggregate([
        { $match: { type: "income", ...(startDate || endDate ? { date: dateFilter } : {}) } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      FinancialTransaction.aggregate([
        { $match: { type: "expense", ...(startDate || endDate ? { date: dateFilter } : {}) } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      // Status counts
      FinancialTransaction.countDocuments({ status: "pending" }),
      FinancialTransaction.countDocuments({ status: "verified" }),
      FinancialTransaction.countDocuments({ status: "disputed" }),
      // Monthly income and expenses
      FinancialTransaction.aggregate([
        { $match: { type: "income", date: { $gte: currentMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      FinancialTransaction.aggregate([
        { $match: { type: "expense", date: { $gte: currentMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      // Weekly income and expenses
      FinancialTransaction.aggregate([
        { $match: { type: "income", date: { $gte: currentWeek } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      FinancialTransaction.aggregate([
        { $match: { type: "expense", date: { $gte: currentWeek } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      // Category-specific income
      FinancialTransaction.aggregate([
        { $match: { type: "income", relatedTo: "donation", ...(startDate || endDate ? { date: dateFilter } : {}) } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      FinancialTransaction.aggregate([
        { $match: { type: "income", relatedTo: "event", ...(startDate || endDate ? { date: dateFilter } : {}) } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      FinancialTransaction.aggregate([
        { $match: { type: "income", relatedTo: "membership", ...(startDate || endDate ? { date: dateFilter } : {}) } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      FinancialTransaction.aggregate([
        { $match: { type: "income", relatedTo: "other", ...(startDate || endDate ? { date: dateFilter } : {}) } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    const totalIncomeAmount = totalIncome[0]?.total || 0;
    const totalExpensesAmount = totalExpenses[0]?.total || 0;
    const monthlyIncomeAmount = monthlyIncome[0]?.total || 0;
    const monthlyExpensesAmount = monthlyExpenses[0]?.total || 0;
    const weeklyIncomeAmount = weeklyIncome[0]?.total || 0;
    const weeklyExpensesAmount = weeklyExpenses[0]?.total || 0;
    const donationIncomeAmount = donationIncome[0]?.total || 0;
    const eventIncomeAmount = eventIncome[0]?.total || 0;
    const membershipIncomeAmount = membershipIncome[0]?.total || 0;
    const otherIncomeAmount = otherIncome[0]?.total || 0;

    const summary = {
      totalIncome: totalIncomeAmount,
      totalExpenses: totalExpensesAmount,
      netIncome: totalIncomeAmount - totalExpensesAmount,
      pendingTransactions: pendingCount,
      verifiedTransactions: verifiedCount,
      disputedTransactions: disputedCount,
      monthlyIncome: monthlyIncomeAmount,
      monthlyExpenses: monthlyExpensesAmount,
      weeklyIncome: weeklyIncomeAmount,
      weeklyExpenses: weeklyExpensesAmount,
      donationIncome: donationIncomeAmount,
      eventIncome: eventIncomeAmount,
      membershipIncome: membershipIncomeAmount,
      otherIncome: otherIncomeAmount,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
