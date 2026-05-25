"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Download
} from "lucide-react";

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
  description: string;
  period: string;
  year: number;
  createdAt: string;
}

interface BudgetAlert {
  type: "warning" | "danger" | "info";
  message: string;
  budgetId: string;
}

export default function BudgetManagement() {
  const { data: session } = useSession();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [formData, setFormData] = useState({
    category: "",
    allocated: "",
    description: "",
    period: "monthly"
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NO', {
      style: 'currency',
      currency: 'NOK'
    }).format(amount);
  };

  const getBudgetStatus = (allocated: number, spent: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage >= 100) return "text-red-600";
    if (percentage >= 80) return "text-yellow-600";
    return "text-green-600";
  };

  const getBudgetStatusIcon = (allocated: number, spent: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage >= 100) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (percentage >= 80) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/finances/budgets?period=${selectedPeriod}&year=${selectedYear}`);
      if (response.ok) {
        const budgetData = await response.json();
        setBudgets(budgetData);
        generateAlerts(budgetData);
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedYear]);

  const generateAlerts = (budgetData: Budget[]) => {
    const newAlerts: BudgetAlert[] = [];
    
    budgetData.forEach(budget => {
      const percentage = (budget.spent / budget.allocated) * 100;
      
      if (percentage >= 100) {
        newAlerts.push({
          type: "danger",
          message: `Budget for ${budget.category} has been exceeded (${percentage.toFixed(1)}%)`,
          budgetId: budget.id
        });
      } else if (percentage >= 80) {
        newAlerts.push({
          type: "warning", 
          message: `Budget for ${budget.category} is ${percentage.toFixed(1)}% used`,
          budgetId: budget.id
        });
      }
    });
    
    setAlerts(newAlerts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/finances/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          allocated: parseFloat(formData.allocated),
          description: formData.description,
          period: formData.period
        })
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setFormData({ category: "", allocated: "", description: "", period: "monthly" });
        fetchBudgets();
      }
    } catch (error) {
      console.error("Error creating budget:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/finances/budgets/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchBudgets();
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  const exportBudgetReport = async () => {
    try {
      const response = await fetch(`/api/finances/budgets/export?period=${selectedPeriod}&year=${selectedYear}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-report-${selectedPeriod}-${selectedYear}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting budget report:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchBudgets();
    }
  }, [session, selectedPeriod, selectedYear, fetchBudgets]);

  if (session?.user?.role !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don&apos;t have permission to access budget management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-gray-600">Manage and track your organization&apos;s budgets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBudgetReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Marketing, Operations, Events"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="allocated">Allocated Amount (NOK) *</Label>
                  <Input
                    id="allocated"
                    type="number"
                    value={formData.allocated}
                    onChange={(e) => setFormData({ ...formData, allocated: e.target.value })}
                    placeholder="10000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="period">Period</Label>
                  <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description for this budget"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Budget</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() + 1].map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === "danger" ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(budgets.reduce((sum, b) => sum + b.allocated, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(budgets.reduce((sum, b) => sum + b.spent, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(budgets.reduce((sum, b) => sum + b.remaining, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Details */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading budgets...</div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No budgets found for this period.</p>
              <p className="text-sm">Create a budget to start tracking your expenses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => (
                <div key={budget.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{budget.category}</h3>
                      <p className="text-sm text-gray-600">{budget.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{budget.period}</Badge>
                        <span className="text-xs text-gray-500">
                          Created {new Date(budget.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getBudgetStatusIcon(budget.allocated, budget.spent)}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progress</span>
                      <span className={`text-sm font-semibold ${getBudgetStatus(budget.allocated, budget.spent)}`}>
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          budget.percentage > 100 ? "bg-red-500" : 
                          budget.percentage > 80 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{budget.percentage.toFixed(1)}% used</span>
                      <span>{formatCurrency(budget.remaining)} remaining</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
