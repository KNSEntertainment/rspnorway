import mongoose from "mongoose";

const financialCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    default: "#6B7280",
  },
  icon: {
    type: String,
    default: "folder",
  },
  subcategories: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
financialCategorySchema.index({ type: 1 });
financialCategorySchema.index({ isActive: 1 });

const FinancialCategory = mongoose.models.FinancialCategory || mongoose.model("FinancialCategory", financialCategorySchema);

export default FinancialCategory;
