import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FinancialTransaction from "@/models/FinancialTransaction.Model";
import Budget from "@/models/Budget.Model";
import Donation from "@/models/Donation.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    const isExecutiveMember =
      session?.user?.role === "member" && session?.user?.membershipType === "executive";
    const isAdmin = session?.user?.role === "admin";

    if (!session || !(isAdmin || isExecutiveMember)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      donationData,
      budgets,
    ] = await Promise.all([
      FinancialTransaction.aggregate([
        { $match: { type: "income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      FinancialTransaction.aggregate([
        { $match: { type: "expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      FinancialTransaction.aggregate([
        { $match: { type: "income", date: { $gte: currentMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      FinancialTransaction.aggregate([
        { $match: { type: "expense", date: { $gte: currentMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Donation.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Budget.find({}).lean(),
    ]);

    const totalIncomeAmount = totalIncome[0]?.total || 0;
    const totalExpensesAmount = totalExpenses[0]?.total || 0;
    const monthlyIncomeAmount = monthlyIncome[0]?.total || 0;
    const monthlyExpensesAmount = monthlyExpenses[0]?.total || 0;
    const totalDonations = donationData[0]?.total || 0;
    const donationCount = donationData[0]?.count || 0;
    const totalBudgetAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalBudgetSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    const summary = {
      totalIncome: totalIncomeAmount,
      totalExpenses: totalExpensesAmount,
      netIncome: totalIncomeAmount - totalExpensesAmount,
      monthlyIncome: monthlyIncomeAmount,
      monthlyExpenses: monthlyExpensesAmount,
      totalDonations,
      donationCount,
      totalBudgetAllocated,
      totalBudgetSpent,
      totalBudgetRemaining: totalBudgetAllocated - totalBudgetSpent,
      budgetUtilizationPercentage:
        totalBudgetAllocated > 0
          ? Math.round((totalBudgetSpent / totalBudgetAllocated) * 100)
          : 0,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching member financial summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
