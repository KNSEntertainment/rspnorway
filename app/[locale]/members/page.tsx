"use client";

import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import { Phone, Mail, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Member {
	_id: string;
	name: string;
	email: string;
	phone: string;
	imageUrl?: string;
	position?: string;
	department?: string;
	subdepartment?: string;
	tags?: string[];
}

interface Department {
	_id: string;
	name: string;
	subdepartments: string[];
	order: number;
	isActive: boolean;
}

interface Filters {
	department: string | null;
	subdepartment: string | null;
	search: string;
}

export default function Members() {
	const [members, setMembers] = useState<Member[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState<Filters>({
		department: null,
		subdepartment: null,
		search: "",
	});
	const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
	const [activeSubdepartment, setActiveSubdepartment] = useState<string | null>(null);

	useEffect(() => {
		async function fetchData() {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
				const timestamp = new Date().getTime(); // Cache busting

				// Fetch members
				const membersResponse = await fetch(`${baseUrl}/api/executive-members?t=${timestamp}`, {
					cache: "no-store",
				});

				// Fetch departments
				const departmentsResponse = await fetch(`${baseUrl}/api/departments?t=${timestamp}`, {
					cache: "no-store",
				});

				if (membersResponse.ok) {
					const membersData = await membersResponse.json();
					setMembers(membersData);
					setFilteredMembers(membersData);
				}

				if (departmentsResponse.ok) {
					const departmentsData = await departmentsResponse.json();
					if (departmentsData.success) {
						setDepartments(departmentsData.departments);
					}
				}
			} catch (error) {
				console.error("Error fetching data:", error);
				setMembers([]);
				setFilteredMembers([]);
				setDepartments([]);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	const applyFilters = useCallback(() => {
		let filtered = [...members];

		// Department filter
		if (filters.department) {
			filtered = filtered.filter((m) => m.department === filters.department);
		}

		// Subdepartment filter
		if (filters.subdepartment) {
			filtered = filtered.filter((m) => m.subdepartment === filters.subdepartment);
		}

		// Quick filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter((m) => m.name.toLowerCase().includes(searchLower) || m.email.toLowerCase().includes(searchLower) || m.phone.includes(searchLower) || (m.position && m.position.toLowerCase().includes(searchLower)));
		}

		setFilteredMembers(filtered);
	}, [filters, members]);

	useEffect(() => {
		applyFilters();
	}, [applyFilters]);

	const selectDepartment = (deptName: string) => {
		if (activeDepartment === deptName) {
			// Deselect if clicking the same department
			setActiveDepartment(null);
			setActiveSubdepartment(null);
			setFilters({ ...filters, department: null, subdepartment: null });
		} else {
			setActiveDepartment(deptName);
			setActiveSubdepartment(null);
			setFilters({ ...filters, department: deptName, subdepartment: null });
		}
	};

	const selectSubdepartment = (subdept: string) => {
		if (activeSubdepartment === subdept) {
			setActiveSubdepartment(null);
			setFilters({ ...filters, subdepartment: null });
		} else {
			setActiveSubdepartment(subdept);
			setFilters({ ...filters, subdepartment: subdept });
		}
	};

	const clearAllFilters = () => {
		setFilters({
			department: null,
			subdepartment: null,
			search: "",
		});
		setActiveDepartment(null);
		setActiveSubdepartment(null);
	};

	const removeFilter = (filterType: "department" | "subdepartment") => {
		if (filterType === "department") {
			setActiveDepartment(null);
			setActiveSubdepartment(null);
			setFilters({ ...filters, department: null, subdepartment: null });
		} else if (filterType === "subdepartment") {
			setActiveSubdepartment(null);
			setFilters({ ...filters, subdepartment: null });
		}
	};

	const getActiveDepartmentSubdepartments = (): string[] => {
		if (!activeDepartment) return [];
		const dept = departments.find((d) => d.name === activeDepartment);
		return dept?.subdepartments || [];
	};

	if (loading) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center py-20">
					<p className="text-gray-900 text-lg">Loading members...</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			{/* Basic Members Display */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<header className="text-center mb-12">
					<SectionHeader heading="Executive Members Directory" />
					{/* <p className="text-gray-900 mt-4 text-lg max-w-2xl mx-auto">Find leadership by department and committee</p> */}
				</header>

				{members.length === 0 && (
					<div className="text-center py-20">
						<p className="text-gray-900 text-lg">No executive members found.</p>
					</div>
				)}
			</div>

			{/* Filtered Members Directory */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
				{/* Search Bar */}
				<div className="mb-8 bg-white rounded-lg shadow-sm p-6">
					<div>
						<label htmlFor="search" className="block text-sm font-medium text-gray-900 mb-2">
							Search Members
						</label>
						<div className="relative">
							<input type="text" id="search" placeholder="Search by name, email, phone, or position..." className="w-full pl-10 pr-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
							<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-900" />
						</div>
					</div>
				</div>

				{/* Major Departments */}
				<div className="mb-6">
					<h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Departments</h3>
					<div className="flex flex-wrap gap-2">
						{departments.map((dept) => (
							<button key={dept._id} onClick={() => selectDepartment(dept.name)} className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeDepartment === dept.name ? "border-blue-500 bg-blue-50 text-brand" : "bg-white border-light text-gray-900 hover:border-blue-500 hover:bg-brand/10 hover:text-brand"}`}>
								{dept.name}
							</button>
						))}
					</div>
				</div>

				{/* Subdepartments */}
				{activeDepartment && getActiveDepartmentSubdepartments().length > 0 && (
					<div className="mb-6">
						<h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Subdepartments</h3>
						<div className="flex flex-wrap gap-2">
							{getActiveDepartmentSubdepartments().map((subdept) => (
								<button key={subdept} onClick={() => selectSubdepartment(subdept)} className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${activeSubdepartment === subdept ? "bg-blue-100 border-blue-400 text-brand" : "bg-light border-light text-gray-900 hover:bg-blue-100 hover:border-blue-400 hover:text-brand"}`}>
									{subdept}
								</button>
							))}
						</div>
					</div>
				)}

				{/* Active Filters */}
				{(filters.department || filters.subdepartment) && (
					<div className="mb-6">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-sm font-medium text-gray-900">Active Filters:</span>
							<div className="flex flex-wrap gap-2">
								{filters.department && (
									<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-brand rounded-full text-sm font-medium">
										Department: {filters.department}
										<button onClick={() => removeFilter("department")} className="hover:text-blue-900">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
											</svg>
										</button>
									</span>
								)}
								{filters.subdepartment && (
									<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-brand rounded-full text-sm font-medium">
										Subdept: {filters.subdepartment}
										<button onClick={() => removeFilter("subdepartment")} className="hover:text-blue-900">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
											</svg>
										</button>
									</span>
								)}
							</div>
							<button onClick={clearAllFilters} className="text-sm text-brand hover:text-brand font-medium ml-2">
								Clear All
							</button>
						</div>
					</div>
				)}

				{/* Members Count */}
				<div className="mb-4">
					<p className="text-sm text-gray-900">
						Showing <span className="font-semibold text-gray-900">{filteredMembers.length}</span> members
					</p>
				</div>

				{/* Members Grid */}
				{filteredMembers.length === 0 ? (
					<div className="text-center py-12">
						<svg className="mx-auto h-12 w-12 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						<h3 className="mt-2 text-lg font-medium text-gray-900">No members found</h3>
						<p className="mt-1 text-gray-900">Try adjusting your search or filter criteria</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredMembers.map((member) => (
							<div key={member._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
								<div className="aspect-square overflow-hidden bg-light">
									{member.imageUrl ? (
										<Image src={member.imageUrl} alt={member.name} width={600} height={600} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
									) : (
										<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
											<span className="text-white text-8xl font-bold">{member.name.charAt(0).toUpperCase()}</span>
										</div>
									)}
								</div>
								<div className="p-6">
									<h3 className="text-2xl font-semibold text-gray-900 mb-1">{member.name}</h3>
									{member.position && <p className="text-sm text-brand font-medium mb-4">{member.position}</p>}

									<div className="space-y-3">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
												<Phone className="w-5 h-5 text-white" />
											</div>
											<div>
												<p className="text-xs text-gray-900 uppercase tracking-wide">Mobile</p>
												<a href={`tel:${member.phone}`} className="text-gray-900 hover:text-brand">
													{member.phone}
												</a>
											</div>
										</div>

										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
												<Mail className="w-5 h-5 text-white" />
											</div>
											<div>
												<p className="text-xs text-gray-900 uppercase tracking-wide">Email</p>
												<a href={`mailto:${member.email}`} className="text-gray-900 hover:text-brand text-sm break-all">
													{member.email}
												</a>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
