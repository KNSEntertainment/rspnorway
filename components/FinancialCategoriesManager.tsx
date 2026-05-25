"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderOpen, 
  Heart, 
  Calendar, 
  Award, 
  DollarSign, 
  Building, 
  Megaphone, 
  Users, 
  FileText, 
  MoreHorizontal 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FinancialCategory {
  _id: string;
  name: string;
  type: "income" | "expense";
  description?: string;
  color: string;
  icon: string;
  subcategories: Array<{
    name: string;
    description?: string;
  }>;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

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

export default function FinancialCategoriesManager() {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    color: "#6B7280",
    icon: "FolderOpen",
    subcategories: [{ name: "", description: "" }]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/financial-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultCategories = async () => {
    try {
      const promises = defaultCategories.map(async (category) => {
        const response = await fetch("/api/financial-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(category),
        });
        return response;
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;
      
      toast({
        title: "Categories Initialized",
        description: `Successfully created ${successCount} out of ${defaultCategories.length} default categories`,
      });
      
      fetchCategories();
    } catch {
      toast({
        title: "Error",
        description: "Failed to initialize default categories",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/financial-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category created successfully",
        });
        setShowAddDialog(false);
        setFormData({
          name: "",
          type: "",
          description: "",
          color: "#6B7280",
          icon: "FolderOpen",
          subcategories: [{ name: "", description: "" }]
        });
        fetchCategories();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const addSubcategory = () => {
    setFormData(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, { name: "", description: "" }]
    }));
  };

  const updateSubcategory = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.map((sub, i) => 
        i === index ? { ...sub, [field]: value } : sub
      )
    }));
  };

  const removeSubcategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index)
    }));
  };

  const handleEdit = (category: FinancialCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || "",
      color: category.color,
      icon: category.icon,
      subcategories: category.subcategories.length > 0 
        ? category.subcategories.map(sub => ({ name: sub.name, description: sub.description || "" }))
        : [{ name: "", description: "" }]
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/financial-categories?id=${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        fetchCategories();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete category",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const response = await fetch("/api/financial-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: editingCategory._id,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        setShowEditDialog(false);
        setEditingCategory(null);
        setFormData({
          name: "",
          type: "",
          description: "",
          color: "#6B7280",
          icon: "FolderOpen",
          subcategories: [{ name: "", description: "" }]
        });
        fetchCategories();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<{ className?: string }> } = {
      Heart, Calendar, Award, DollarSign, Building, Megaphone, Users, FileText, FolderOpen, MoreHorizontal
    };
    const Icon = icons[iconName] || FolderOpen;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Categories</h2>
          <p className="text-gray-600">Manage income and expense categories</p>
        </div>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <Button onClick={initializeDefaultCategories} variant="outline">
              Initialize Default Categories
            </Button>
          )}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Financial Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FolderOpen">Folder</SelectItem>
                        <SelectItem value="Heart">Heart</SelectItem>
                        <SelectItem value="Calendar">Calendar</SelectItem>
                        <SelectItem value="Award">Award</SelectItem>
                        <SelectItem value="DollarSign">Dollar</SelectItem>
                        <SelectItem value="Building">Building</SelectItem>
                        <SelectItem value="Megaphone">Megaphone</SelectItem>
                        <SelectItem value="Users">Users</SelectItem>
                        <SelectItem value="FileText">File</SelectItem>
                        <SelectItem value="MoreHorizontal">More</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Subcategories</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSubcategory}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.subcategories.map((sub, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Subcategory name"
                          value={sub.name}
                          onChange={(e) => updateSubcategory(index, "name", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Description"
                          value={sub.description}
                          onChange={(e) => updateSubcategory(index, "description", e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSubcategory(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Category</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Category Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Financial Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Category Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-type">Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-color">Color</Label>
                    <Input
                      id="edit-color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-icon">Icon</Label>
                    <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FolderOpen">Folder</SelectItem>
                        <SelectItem value="Heart">Heart</SelectItem>
                        <SelectItem value="Calendar">Calendar</SelectItem>
                        <SelectItem value="Award">Award</SelectItem>
                        <SelectItem value="DollarSign">Dollar</SelectItem>
                        <SelectItem value="Building">Building</SelectItem>
                        <SelectItem value="Megaphone">Megaphone</SelectItem>
                        <SelectItem value="Users">Users</SelectItem>
                        <SelectItem value="FileText">File</SelectItem>
                        <SelectItem value="MoreHorizontal">More</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Subcategories</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSubcategory}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.subcategories.map((sub, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Subcategory name"
                          value={sub.name}
                          onChange={(e) => updateSubcategory(index, "name", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Description"
                          value={sub.description}
                          onChange={(e) => updateSubcategory(index, "description", e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSubcategory(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowEditDialog(false);
                    setEditingCategory(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Category</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-semibold">Category</th>
              <th className="text-left p-3 font-semibold">Type</th>
              <th className="text-left p-3 font-semibold">Subcategories</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1 rounded"
                      style={{ backgroundColor: category.color }}
                    >
                      {getIconComponent(category.icon)}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{category.name}</div>
                      {category.description && (
                        <div className="text-xs text-gray-600 truncate max-w-xs">{category.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <Badge className={category.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {category.type}
                  </Badge>
                </td>
                <td className="p-3">
                  {category.subcategories.length > 0 ? (
                    <div className="text-sm">
                      <div className="font-medium">{category.subcategories.length} subcategories</div>
                      <div className="text-xs text-gray-600">
                        {category.subcategories.slice(0, 2).map((sub, index) => (
                          <span key={index} className="capitalize">{sub.name}</span>
                        )).join(", ")}
                        {category.subcategories.length > 2 && "..."}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">None</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(category._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Yet</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating default categories or adding your own custom categories.
            </p>
            <Button onClick={initializeDefaultCategories}>
              Initialize Default Categories
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
