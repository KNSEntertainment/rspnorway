import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
  },
  allocated: {
    type: Number,
    required: true,
    min: 0,
  },
  spent: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
  },
  period: {
    type: String,
    enum: ["monthly", "quarterly", "yearly"],
    default: "monthly",
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
  createdBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Virtual for remaining amount
budgetSchema.virtual("remaining").get(function () {
  return this.allocated - this.spent;
});

// Virtual for percentage used
budgetSchema.virtual("percentage").get(function () {
  return this.allocated > 0 ? (this.spent / this.allocated) * 100 : 0;
});

// Index for faster queries
budgetSchema.index({ category: 1 });
budgetSchema.index({ year: 1 });
budgetSchema.index({ period: 1 });
budgetSchema.index({ createdBy: 1 });

const Budget = mongoose.models.Budget || mongoose.model("Budget", budgetSchema);

export default Budget;
