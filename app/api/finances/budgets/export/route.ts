import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Budget from "@/models/Budget.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const period = searchParams.get("period") || "monthly";

    // Fetch budgets for the specified period
    const budgets = await Budget.find({
      year: year,
      period: period,
    }).sort({ category: 1 });

    // Generate CSV content
    const headers = [
      "Category",
      "Allocated Amount",
      "Spent Amount",
      "Remaining Amount",
      "Percentage Used",
      "Status",
      "Description",
      "Period",
      "Year",
      "Created Date"
    ];

    const csvRows = [
      headers.join(","),
      ...budgets.map(budget => {
        const percentage = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;
        const status = percentage >= 100 ? "Exceeded" : percentage >= 80 ? "Warning" : "On Track";
        
        return [
          `"${budget.category}"`,
          budget.allocated,
          budget.spent,
          budget.remaining,
          `${percentage.toFixed(2)}%`,
          status,
          `"${budget.description || ""}"`,
          budget.period,
          budget.year,
          new Date(budget.createdAt).toLocaleDateString()
        ].join(",");
      })
    ];

    // Add summary section
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalAllocated - totalSpent;
    const overallPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    csvRows.push("");
    csvRows.push("SUMMARY");
    csvRows.push(`"Total Allocated",${totalAllocated}`);
    csvRows.push(`"Total Spent",${totalSpent}`);
    csvRows.push(`"Total Remaining",${totalRemaining}`);
    csvRows.push(`"Overall Percentage Used","${overallPercentage.toFixed(2)}%"`);

    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="budget-report-${period}-${year}.csv"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error exporting budget report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export budget report" },
      { status: 500 }
    );
  }
}
