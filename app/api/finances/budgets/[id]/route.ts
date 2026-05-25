import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Budget from "@/models/Budget.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const budget = await Budget.findById(id);
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    await Budget.findByIdAndDelete(id);

    return NextResponse.json({ message: "Budget deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete budget" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { category, allocated, description, period } = body;

    if (!category || !allocated || allocated <= 0) {
      return NextResponse.json(
        { error: "Invalid budget data" },
        { status: 400 }
      );
    }

    const budget = await Budget.findById(id);
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Check if new category conflicts with existing budget for this period
    if (category !== budget.category) {
      const budgetPeriod = period || budget.period;

      const existingBudget = await Budget.findOne({
        category: category,
        period: budgetPeriod,
        year: budget.year,
        _id: { $ne: id }
      });

      if (existingBudget) {
        return NextResponse.json(
          { error: "Budget category already exists for this period" },
          { status: 400 }
        );
      }
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      {
        category: category || budget.category,
        allocated: allocated || budget.allocated,
        description: description !== undefined ? description : budget.description,
        period: period || budget.period,
      },
      { new: true }
    );

    return NextResponse.json({
      id: updatedBudget._id.toString(),
      category: updatedBudget.category,
      allocated: updatedBudget.allocated,
      spent: updatedBudget.spent,
      remaining: updatedBudget.remaining,
      percentage: updatedBudget.percentage,
      description: updatedBudget.description,
      period: updatedBudget.period,
      year: updatedBudget.year,
      createdAt: updatedBudget.createdAt,
    });
  } catch (error: unknown) {
    console.error("Error updating budget:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update budget" },
      { status: 500 }
    );
  }
}
