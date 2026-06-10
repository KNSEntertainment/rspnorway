"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Target } from "lucide-react";

export default function CreateBudget() {
  const { data: session } = useSession();
  const params = useParams();
  const locale = params.locale as string;

  const [formData, setFormData] = useState({
    category: "",
    allocated: "",
    description: "",
    period: "monthly",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!session || session.user.role !== "admin" && session.user.role !== "treasurer") {
    return (
      <div className="text-center py-12">
        <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 mb-6">You need admin privileges to create budgets.</p>
        <Button asChild>
          <Link href={`/${locale}/dashboard`}>Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/finances/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: formData.category,
          allocated: parseFloat(formData.allocated),
          description: formData.description,
          period: formData.period,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Budget created successfully!" });
        // Reset form
        setFormData({
          category: "",
          allocated: "",
          description: "",
          period: "monthly",
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = `/${locale}/dashboard/finances`;
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create budget" });
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      setMessage({ type: "error", text: "An error occurred while creating the budget" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${locale}/dashboard/finances`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Financial Analytics
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="h-8 w-8 text-blue-600" />
            Create Budget
          </h1>
          <p className="text-gray-600 mt-1">Set up a new budget category for financial planning</p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.type === "success" 
                ? "bg-green-50 border border-green-200 text-green-800" 
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Budget Category</Label>
                <Input
                  id="category"
                  name="category"
                  type="text"
                  placeholder="e.g., Event Management, Marketing"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocated">Allocated Amount (NOK)</Label>
                <Input
                  id="allocated"
                  name="allocated"
                  type="number"
                  placeholder="0.00"
                  value={formData.allocated}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                type="text"
                placeholder="Brief description of this budget category"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Budget Period</Label>
              <select
                id="period"
                name="period"
                value={formData.period}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href={`/${locale}/dashboard/finances`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Budget"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
