import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Budget from "@/models/Budget.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Test creating a simple budget
    const testBudget = new Budget({
      category: "Test Budget",
      allocated: 10000,
      description: "Test budget creation",
      period: "monthly",
      year: 2026,
      createdBy: session.user.email,
    });

    console.log("Test budget object:", testBudget);

    await testBudget.save();

    console.log("Test budget saved successfully:", testBudget);

    // Test retrieving the budget
    const savedBudgets = await Budget.find({
      category: "Test Budget",
      createdBy: session.user.email,
    });

    console.log("Retrieved budgets:", savedBudgets);

    // Clean up test budget
    await Budget.deleteOne({ _id: testBudget._id });

    return NextResponse.json({
      success: true,
      message: "Budget creation test successful",
      testBudget: {
        id: testBudget._id,
        category: testBudget.category,
        allocated: testBudget.allocated,
        spent: testBudget.spent,
        remaining: testBudget.remaining,
        percentage: testBudget.percentage,
      },
      retrievedCount: savedBudgets.length,
    });
  } catch (error: unknown) {
    console.error("Budget creation test failed:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Budget creation test failed",
        details: error instanceof Error ? error.stack : "No error details available"
      },
      { status: 500 }
    );
  }
}
