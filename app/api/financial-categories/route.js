import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
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
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive") !== "false";

    const query = { isActive };
    if (type) query.type = type;

    const categories = await FinancialCategory.find(query)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching financial categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
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
    const requiredFields = ["name", "type"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Check if category already exists
    const existingCategory = await FinancialCategory.findOne({ 
      name: data.name.toLowerCase().trim(),
      type: data.type 
    });
    
    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }

    const category = new FinancialCategory({
      ...data,
      name: data.name.toLowerCase().trim(),
      createdBy: session.user.email,
    });

    await category.save();
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating financial category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Validate required fields
    const requiredFields = ["name", "type"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Check if category name conflicts with existing category (excluding current one)
    const existingCategory = await FinancialCategory.findOne({ 
      name: data.name.toLowerCase().trim(),
      type: data.type,
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    const category = await FinancialCategory.findByIdAndUpdate(
      id,
      {
        ...data,
        name: data.name.toLowerCase().trim(),
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating financial category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Check if category is being used by any transactions
    const FinancialTransaction = (await import("@/models/FinancialTransaction.Model")).default;
    const transactionCount = await FinancialTransaction.countDocuments({ category: id });

    if (transactionCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete category. It is being used by ${transactionCount} transaction(s). Please reassign or delete these transactions first.` 
      }, { status: 400 });
    }

    const category = await FinancialCategory.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting financial category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
