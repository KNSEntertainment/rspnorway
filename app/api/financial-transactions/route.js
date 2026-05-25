import {  NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FinancialTransaction from "@/models/FinancialTransaction.Model";
import FinancialCategory from "@/models/FinancialCategory.Model";
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
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    const query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { referenceNumber: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      FinancialTransaction.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FinancialTransaction.countDocuments(query)
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching financial transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ["type", "category", "amount", "description", "paymentMethod", "relatedTo"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Validate category exists
    const categoryExists = await FinancialCategory.findOne({ 
      name: data.category, 
      type: data.type,
      isActive: true 
    });
    
    if (!categoryExists) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const transaction = new FinancialTransaction({
      ...data,
      createdBy: session.user.email,
    });

    await transaction.save();

    // Update budget if applicable
    if (data.type === "expense" && data.budgetId) {
      const Budget = (await import("@/models/Budget.Model")).default;
      console.log("Updating budget:", { budgetId: data.budgetId, amount: data.amount });
      
      const updatedBudget = await Budget.findByIdAndUpdate(
        data.budgetId, 
        { $inc: { spent: data.amount } },
        { new: true }
      );
      
      console.log("Budget updated successfully:", {
        budgetId: data.budgetId,
        newSpent: updatedBudget.spent,
        allocated: updatedBudget.allocated,
        remaining: updatedBudget.remaining,
        percentage: updatedBudget.percentage
      });
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating financial transaction:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
