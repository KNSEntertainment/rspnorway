import mongoose from "mongoose";

const financialTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  subcategory: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "bank_transfer", "card", "check", "online", "other", "vipps"],
    required: true,
  },
  referenceNumber: {
    type: String,
    trim: true,
  },
  relatedTo: {
    type: String,
    enum: ["event", "donation", "membership", "operational", "other"],
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    default: null,
  },
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Budget",
    default: null,
  },
  receiptFiles: [{
    filename: String,
    originalName: String,
    url: String,
    publicId: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ["pending", "verified", "reconciled", "disputed"],
    default: "pending",
  },
  verifiedBy: {
    type: String,
    default: "",
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Index for faster queries
financialTransactionSchema.index({ type: 1 });
financialTransactionSchema.index({ category: 1 });
financialTransactionSchema.index({ date: 1 });
financialTransactionSchema.index({ status: 1 });
financialTransactionSchema.index({ createdBy: 1 });
financialTransactionSchema.index({ relatedTo: 1 });
financialTransactionSchema.index({ paymentMethod: 1 });
financialTransactionSchema.index({ tags: 1 });

// Virtual for formatted amount
financialTransactionSchema.virtual("formattedAmount").get(function () {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
  }).format(this.amount);
});

const FinancialTransaction = mongoose.models.FinancialTransaction || mongoose.model("FinancialTransaction", financialTransactionSchema);

export default FinancialTransaction;
