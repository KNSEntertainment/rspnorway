import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FinancialTransaction from "@/models/FinancialTransaction.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const transaction = await FinancialTransaction.findById(id);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Handle status updates
    if (data.status) {
      transaction.status = data.status;
      if (data.status === "verified") {
        transaction.verifiedBy = session.user.email;
        transaction.verifiedAt = new Date();
      }
    }

    // Handle other updates
    if (data.category) transaction.category = data.category;
    if (data.subcategory !== undefined) transaction.subcategory = data.subcategory;
    if (data.amount) transaction.amount = data.amount;
    if (data.date) transaction.date = data.date;
    if (data.paymentMethod) transaction.paymentMethod = data.paymentMethod;
    if (data.description) transaction.description = data.description;
    if (data.notes) transaction.notes = data.notes;
    if (data.tags) transaction.tags = data.tags;

    await transaction.save();

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error updating financial transaction:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const transaction = await FinancialTransaction.findById(id);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Update budget if this was an expense transaction
    if (transaction.type === "expense" && transaction.budgetId) {
      const Budget = (await import("@/models/Budget.Model")).default;
      await Budget.findByIdAndUpdate(transaction.budgetId, {
        $inc: { spent: -transaction.amount }
      });
    }

    await FinancialTransaction.findByIdAndDelete(id);

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting financial transaction:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
