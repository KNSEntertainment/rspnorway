import mongoose from "mongoose";
import connectDB from "../lib/mongodb.js";
import FinancialCategory from "../models/FinancialCategory.Model.js";

const defaultCategories = [
  // Income Categories
  {
    name: "donations",
    type: "income",
    description: "Donations from members and supporters",
    color: "#10B981",
    icon: "Heart",
    subcategories: [
      { name: "general donations", description: "General fund donations" },
      { name: "event donations", description: "Donations collected at events" },
      { name: "membership fees", description: "Annual membership fees" },
      { name: "sponsorship", description: "Corporate or individual sponsorships" }
    ]
  },
  {
    name: "event revenue",
    type: "income",
    description: "Revenue from events and programs",
    color: "#3B82F6",
    icon: "Calendar",
    subcategories: [
      { name: "ticket sales", description: "Event ticket sales" },
      { name: "registration fees", description: "Program registration fees" },
      { name: "merchandise", description: "Event merchandise sales" },
      { name: "food & beverage", description: "Food and beverage sales at events" }
    ]
  },
  {
    name: "grants",
    type: "income",
    description: "Government and foundation grants",
    color: "#8B5CF6",
    icon: "Award",
    subcategories: [
      { name: "government grants", description: "Government funding" },
      { name: "foundation grants", description: "Private foundation grants" },
      { name: "project grants", description: "Specific project funding" }
    ]
  },
  {
    name: "other income",
    type: "income",
    description: "Other sources of income",
    color: "#F59E0B",
    icon: "DollarSign",
    subcategories: [
      { name: "interest earned", description: "Bank interest" },
      { name: "rental income", description: "Property or equipment rental" },
      { name: "miscellaneous", description: "Other miscellaneous income" }
    ]
  },

  // Expense Categories
  {
    name: "event expenses",
    type: "expense",
    description: "Expenses related to events and programs",
    color: "#EF4444",
    icon: "Calendar",
    subcategories: [
      { name: "venue rental", description: "Event venue costs" },
      { name: "catering", description: "Food and catering services" },
      { name: "decorations", description: "Event decorations and supplies" },
      { name: "entertainment", description: "Entertainment and performers" },
      { name: "transportation", description: "Event transportation costs" }
    ]
  },
  {
    name: "operational",
    type: "expense",
    description: "Day-to-day operational expenses",
    color: "#6B7280",
    icon: "Building",
    subcategories: [
      { name: "office rent", description: "Office space rental" },
      { name: "utilities", description: "Electricity, water, internet" },
      { name: "office supplies", description: "Stationery and office supplies" },
      { name: "communication", description: "Phone and internet costs" },
      { name: "insurance", description: "Insurance premiums" }
    ]
  },
  {
    name: "marketing",
    type: "expense",
    description: "Marketing and promotional expenses",
    color: "#EC4899",
    icon: "Megaphone",
    subcategories: [
      { name: "advertising", description: "Online and print advertising" },
      { name: "social media", description: "Social media marketing" },
      { name: "printing", description: "Brochures and printed materials" },
      { name: "promotional items", description: "Branded merchandise and giveaways" }
    ]
  },
  {
    name: "staff costs",
    type: "expense",
    description: "Employee and contractor costs",
    color: "#059669",
    icon: "Users",
    subcategories: [
      { name: "salaries", description: "Employee salaries" },
      { name: "contractors", description: "Freelance and contractor fees" },
      { name: "training", description: "Staff training and development" },
      { name: "benefits", description: "Employee benefits and insurance" }
    ]
  },
  {
    name: "administrative",
    type: "expense",
    description: "Administrative and professional fees",
    color: "#7C3AED",
    icon: "FileText",
    subcategories: [
      { name: "legal fees", description: "Legal and consultation fees" },
      { name: "accounting", description: "Accounting and bookkeeping" },
      { name: "bank fees", description: "Bank transaction fees" },
      { name: "software licenses", description: "Software and subscription fees" }
    ]
  },
  {
    name: "other expenses",
    type: "expense",
    description: "Other miscellaneous expenses",
    color: "#DC2626",
    icon: "MoreHorizontal",
    subcategories: [
      { name: "travel", description: "Business travel expenses" },
      { name: "equipment", description: "Equipment and tools" },
      { name: "maintenance", description: "Equipment and facility maintenance" },
      { name: "miscellaneous", description: "Other miscellaneous expenses" }
    ]
  }
];

async function initializeCategories() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Clear existing categories (optional - comment out if you want to keep existing ones)
    console.log("Clearing existing financial categories...");
    await FinancialCategory.deleteMany({});

    // Insert default categories
    console.log("Inserting default financial categories...");
    const categories = await FinancialCategory.insertMany(
      defaultCategories.map(cat => ({
        ...cat,
        createdBy: "system@pnsbnorway.org"
      }))
    );

    console.log(`Successfully created ${categories.length} financial categories:`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.type})`);
      cat.subcategories.forEach(sub => {
        console.log(`  - ${sub.name}`);
      });
    });

    console.log("\nFinancial categories initialization completed!");
  } catch (error) {
    console.error("Error initializing financial categories:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the initialization
initializeCategories();
