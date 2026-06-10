import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, required: true, default: Date.now },
  paymentMethod: { type: String, enum: ["cash", "bank_transfer", "card", "vipps", "online", "other"], default: "cash" },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "FinancialTransaction" },
  notes: { type: String, trim: true },
  recordedBy: { type: String, required: true },
  recordedAt: { type: Date, default: Date.now },
});

const ExecutiveContributionSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  memberEmail: { type: String, required: true },
  memberName: { type: String, required: true },
  year: { type: Number, required: true },
  totalDue: { type: Number, required: true, default: 1200 },
  amountPaid: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "partial", "paid", "overdue"], default: "pending" },
  payments: [paymentSchema],
}, { timestamps: true });

ExecutiveContributionSchema.index({ memberId: 1, year: 1 }, { unique: true });
ExecutiveContributionSchema.index({ year: 1 });
ExecutiveContributionSchema.index({ status: 1 });

const ExecutiveContribution = mongoose.models.ExecutiveContribution ||
  mongoose.model("ExecutiveContribution", ExecutiveContributionSchema);

export default ExecutiveContribution;
