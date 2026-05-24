"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import DepartmentForm from "@/components/DepartmentForm";

interface Department {
	_id: string;
	name: string;
	subdepartments: string[];
	order: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

function DepartmentCard({ department, onEdit, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: { 
	department: Department; 
	onEdit: (dept: Department) => void; 
	onDelete: (id: string) => void;
	onMoveUp: (id: string) => void;
	onMoveDown: (id: string) => void;
	canMoveUp: boolean;
	canMoveDown: boolean;
}) {
	return (
		<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
			<div className="flex justify-between items-start mb-4">
				<div className="flex items-start gap-3 flex-1">
					<div className="flex flex-col gap-1">
						<button 
							onClick={() => onMoveUp(department._id)}
							disabled={!canMoveUp}
							className="p-1 text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<ArrowUp className="w-4 h-4" />
						</button>
						<button 
							onClick={() => onMoveDown(department._id)}
							disabled={!canMoveDown}
							className="p-1 text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<ArrowDown className="w-4 h-4" />
						</button>
					</div>
					<div>
						<h2 className="text-xl font-semibold text-gray-900">{department.name}</h2>
						<p className="text-sm text-gray-900 mt-1">Order: {department.order}</p>
					</div>
				</div>
				<div className="flex gap-2">
					<button onClick={() => onEdit(department)} className="p-2 text-brand hover:bg-brand/10 rounded">
						<Edit className="w-4 h-4" />
					</button>
					<button onClick={() => onDelete(department._id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
						<Trash2 className="w-4 h-4" />
					</button>
				</div>
			</div>

			{department.subdepartments && department.subdepartments.length > 0 && (
				<div className="mt-4">
					<p className="text-sm font-medium text-gray-900 mb-2">Subdepartments:</p>
					<div className="flex flex-wrap gap-2">
						{department.subdepartments.map((subdept, index) => (
							<span key={index} className="px-3 py-1 bg-brand/10 text-brand text-sm rounded-full">
								{subdept}
							</span>
						))}
					</div>
				</div>
			)}

			<div className="mt-4 pt-4 border-t border-light">
				<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${department.isActive ? "bg-success text-white" : "bg-light text-gray-900"}`}>{department.isActive ? "Active" : "Inactive"}</span>
			</div>
		</div>
	);
}

export default function DepartmentsPage() {
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

	useEffect(() => {
		fetchDepartments();
	}, []);

	const fetchDepartments = async () => {
		try {
			const response = await fetch("/api/departments");
			const data = await response.json();
			if (data.success) {
				setDepartments(data.departments);
			}
		} catch (error) {
			console.error("Error fetching departments:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (department: Department) => {
		setEditingDepartment(department);
		setShowModal(!showModal);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this department?")) return;

		try {
			const response = await fetch(`/api/departments/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				fetchDepartments();
			}
		} catch (error) {
			console.error("Error deleting department:", error);
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingDepartment(null);
		fetchDepartments();
	};

	const moveDepartment = async (departmentId: string, direction: 'up' | 'down') => {
		const sortedDepartments = [...departments].sort((a, b) => a.order - b.order);
		const currentIndex = sortedDepartments.findIndex(d => d._id === departmentId);
		
		if (currentIndex === -1) return;
		
		const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
		
		if (newIndex < 0 || newIndex >= sortedDepartments.length) return;
		
		// Swap the departments
		const newDepartments = [...sortedDepartments];
		[newDepartments[currentIndex], newDepartments[newIndex]] = [newDepartments[newIndex], newDepartments[currentIndex]];
		
		// Update order values
		newDepartments.forEach((dept, index) => {
			dept.order = index;
		});
		
		// Update backend
		try {
			await fetch("/api/departments/reorder", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ departments: newDepartments }),
			});
			
			// Update local state
			setDepartments(newDepartments);
		} catch (error) {
			console.error("Error updating department order:", error);
		}
	};

	if (loading) {
		return <div className="p-6">Loading...</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Manage Departments</h1>
				<Button
					onClick={() => {
						setEditingDepartment(null);
						setShowModal(!showModal);
					}}
					className="bg-brand hover:bg-brand/90"
				>
					{showModal ? (
						"Cancel"
					) : (
						<>
							<Plus className="w-4 h-4 mr-2" /> Add Department
						</>
					)}
				</Button>
			</div>

			{/* Inline Form Section */}
			{showModal && (
				<div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-brand">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">{editingDepartment ? "Edit Department" : "Add New Department"}</h2>
					<DepartmentForm handleCloseModal={handleCloseModal} departmentToEdit={editingDepartment as unknown as null} />
				</div>
			)}

			{departments.length === 0 ? (
				<div className="text-center py-12 bg-light rounded-lg">
					<p className="text-gray-900">No departments found. Create your first department!</p>
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{departments
						.sort((a, b) => a.order - b.order)
						.map((department, index) => (
							<DepartmentCard 
								key={department._id} 
								department={department} 
								onEdit={handleEdit} 
								onDelete={handleDelete}
								onMoveUp={() => moveDepartment(department._id, 'up')}
								onMoveDown={() => moveDepartment(department._id, 'down')}
								canMoveUp={index > 0}
								canMoveDown={index < departments.length - 1}
							/>
						))}
				</div>
			)}
		</div>
	);
}
