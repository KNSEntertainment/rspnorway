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

    console.log("Fetching budgets:", { year, period });

    // Fetch budgets for the specified year and period
    const budgets = await Budget.find({
      year: year,
      period: period,
    }).sort({ createdAt: -1 });

    console.log("Found budgets:", budgets.length, budgets.map(b => ({ category: b.category, allocated: b.allocated, year: b.year })));

    // Add calculated fields
    const budgetsWithMetrics = budgets.map(budget => ({
      id: budget._id.toString(),
      category: budget.category,
      allocated: budget.allocated,
      spent: budget.spent,
      remaining: budget.remaining,
      percentage: budget.percentage,
      description: budget.description,
      period: budget.period,
      year: budget.year,
      createdAt: budget.createdAt,
    }));

    return NextResponse.json(budgetsWithMetrics);
  } catch (error: unknown) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, allocated, description, period } = body;

    console.log("Budget creation request:", { category, allocated, description, period, user: session.user.email });

    if (!category || !allocated || allocated <= 0) {
      console.log("Validation failed:", { category, allocated });
      return NextResponse.json(
        { error: "Invalid budget data" },
        { status: 400 }
      );
    }

    // Check if budget category already exists for this period and year
    const currentYear = new Date().getFullYear();
    const budgetPeriod = period || "monthly";

    console.log("Checking for existing budget:", { category, budgetPeriod, currentYear });

    const existingBudget = await Budget.findOne({
      category: category,
      period: budgetPeriod,
      year: currentYear,
    });

    if (existingBudget) {
      console.log("Budget already exists:", existingBudget);
      return NextResponse.json(
        { error: "Budget category already exists for this period" },
        { status: 400 }
      );
    }

    // Create new budget
    const newBudget = new Budget({
      category,
      allocated,
      description: description || "",
      period: budgetPeriod,
      year: currentYear,
      createdBy: session.user.email,
    });

    console.log("Creating new budget:", newBudget);

    await newBudget.save();

    console.log("Budget saved successfully:", newBudget);

    return NextResponse.json({
      id: newBudget._id.toString(),
      category: newBudget.category,
      allocated: newBudget.allocated,
      spent: newBudget.spent,
      remaining: newBudget.remaining,
      percentage: newBudget.percentage,
      description: newBudget.description,
      period: newBudget.period,
      year: newBudget.year,
      createdAt: newBudget.createdAt,
    });
  } catch (error: unknown) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create budget" },
      { status: 500 }
    );
  }
}
