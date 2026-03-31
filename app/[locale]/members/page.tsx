"use client";

import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import { Phone, Mail, Search, X, Filter, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

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
	const t = useTranslations("members");
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
	const [showMobileFilters, setShowMobileFilters] = useState(false);

	useEffect(() => {
		async function fetchData() {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
				const timestamp = new Date().getTime();

				const membersResponse = await fetch(`${baseUrl}/api/executive-members?t=${timestamp}`, {
					cache: "no-store",
				});

				const departmentsResponse = await fetch(`${baseUrl}/api/departments?t=${timestamp}`, {
					cache: "no-store",
				});

				if (membersResponse.ok) {
					const membersData = await membersResponse.json();
					setMembers(membersData);
				}

				if (departmentsResponse.ok) {
					const departmentsData = await departmentsResponse.json();
					if (departmentsData.success) {
						const depts = departmentsData.departments;
						setDepartments(depts);

						// Auto-select first department on initial load
						if (depts.length > 0) {
							const firstDept = depts[0].name;
							setActiveDepartment(firstDept);
							setFilters((prev) => ({ ...prev, department: firstDept }));
						}
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

		if (filters.department) {
			filtered = filtered.filter((m) => m.department === filters.department);
		}

		if (filters.subdepartment) {
			filtered = filtered.filter((m) => m.subdepartment === filters.subdepartment);
		}

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

	const hasActiveFilters = filters.department || filters.subdepartment || filters.search;

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent mb-4"></div>
					<p className="text-gray-700 text-lg">{t("loading")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen pt-12">
			{/* Header Section */}
		
			<SectionHeader heading={t("title")} className="bg-white mb-0" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
				{/* Search and Filter Toggle */}
				<div className="mb-3">
					<div className="bg-white rounded-lg shadow-sm px-4 py-3">
						<div className="flex items-stretch sm:items-center gap-3">
							{/* Search Input */}
							<div className="flex">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input type="text" id="search" placeholder={t("search_placeholder")} className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
									{filters.search && (
										<button onClick={() => setFilters({ ...filters, search: "" })} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
											<X className="h-4 w-4" />
										</button>
									)}
								</div>
							</div>

							{/* Filter Toggle */}
							<div className="flex items-center gap-2">
								<button onClick={() => setShowMobileFilters(!showMobileFilters)} className="inline-flex items-center gap-2 px-3 py-2 bg-brand text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
									<Filter className="h-4 w-4" />
									<span>Filters</span>
									{hasActiveFilters && <span className="bg-white text-brand rounded-full px-2 py-0.5 text-xs font-semibold">{[filters.department, filters.subdepartment].filter(Boolean).length}</span>}
								</button>
								{hasActiveFilters && (
									<button onClick={clearAllFilters} className="text-sm text-brand hover:text-blue-700 font-medium">
										{t("clear_all")}
									</button>
								)}
							</div>

							{/* Members Count */}
						</div>
						{filteredMembers.length > 0 && 	<div className="text-sm text-gray-700 sm:ml-auto m-1">
								{t("showing")} <span className="text-brand font-bold">{filteredMembers.length}</span> {filteredMembers.length === 1 ? t("member") : t("members")}
							</div>}
					</div>
				</div>	

				{/* Filters Section - Desktop and Mobile */}
				<div className={`mb-3 ${showMobileFilters ? "block" : "hidden"}`}>
					<div className="bg-white rounded-lg shadow-sm px-4 py-3">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-semibold text-gray-900">{t("filters")}</h3>
						</div>

						{/* Departments */}
						<div className="mb-4">
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t("departments")}</h3>
							</div>
							<div className="relative">
								<div className="flex overflow-x-auto gap-2 sm:gap-3 pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory">
									{departments.map((dept) => (
										<button key={dept._id} onClick={() => selectDepartment(dept.name)} className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand whitespace-nowrap flex-shrink-0 snap-start ${activeDepartment === dept.name ? "border-brand bg-blue-50 text-brand shadow-sm" : "bg-white border-gray-200 text-gray-700 hover:border-brand hover:bg-blue-50 hover:text-brand"}`}>
											{dept.name}
										</button>
									))}
								</div>
								{departments.length > 3 && (
									<div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none flex items-center justify-end pr-2">
										<ChevronRight className="w-5 h-5 text-gray-400" />
									</div>
								)}
							</div>
						</div>

						{/* Subdepartments */}
						{activeDepartment && getActiveDepartmentSubdepartments().length > 0 && (
							<div className="pt-4 border-t border-gray-200">
								<div className="flex items-center justify-between mb-3">
									<h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t("subdepartments")}</h3>
								</div>
								<div className="relative">
									<div className="flex overflow-x-auto gap-2 pb-2 scroll-smooth hide-scrollbar snap-x snap-mandatory">
										{getActiveDepartmentSubdepartments().map((subdept) => (
											<button key={subdept} onClick={() => selectSubdepartment(subdept)} className={`px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium whitespace-nowrap flex-shrink-0 snap-start ${activeSubdepartment === subdept ? "bg-blue-100 border-blue-400 text-brand" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-brand"}`}>
												{subdept}
											</button>
										))}
									</div>
									{getActiveDepartmentSubdepartments().length > 4 && (
										<div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none flex items-center justify-end pr-2">
											<ChevronRight className="w-5 h-5 text-gray-400" />
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					<style jsx>{`
						.hide-scrollbar::-webkit-scrollbar {
							display: none;
						}
						.hide-scrollbar {
							-ms-overflow-style: none;
							scrollbar-width: none;
						}
					`}</style>
				</div>

				{/* Active Filters Pills */}
				{hasActiveFilters && (
					<div className="mb-4">
						<div className="bg-white rounded-lg shadow-sm px-4 py-3">
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-sm font-medium text-gray-700">{t("active_filters")}:</span>
								{filters.department && (
									<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-brand rounded-full text-sm font-medium">
										{filters.department}
										<button onClick={() => removeFilter("department")} className="hover:text-blue-900 transition-colors" aria-label="Remove department filter">
											<X className="w-4 h-4" />
										</button>
									</span>
								)}
								{filters.subdepartment && (
									<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-brand rounded-full text-sm font-medium">
										{filters.subdepartment}
										<button onClick={() => removeFilter("subdepartment")} className="hover:text-blue-900 transition-colors" aria-label="Remove subdepartment filter">
											<X className="w-4 h-4" />
										</button>
									</span>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Members Grid */}
				{filteredMembers.length === 0 ? (
					<div className="bg-white rounded-lg shadow-sm p-12 text-center">
						<div className="max-w-md mx-auto">
							<svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">{t("no_results")}</h3>
							<p className="text-gray-600 mb-6">{t("adjust_filters")}</p>
							{hasActiveFilters && (
								<button onClick={clearAllFilters} className="px-6 py-2.5 bg-brand text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
									{t("clear_all")}
								</button>
							)}
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
						{filteredMembers.map((member) => (
						
							<div key={member._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
						<div className="aspect-square overflow-hidden bg-light">
							{member.imageUrl && !member.imageUrl.startsWith("data:") ? (
								<Image src={member.imageUrl} alt={member.name} width={200} height={200} className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand to-blue-600">
									<span className="text-white text-6xl font-bold">{member.name.charAt(0).toUpperCase()}</span>
								</div>
							)}
						</div>

						<div className="p-6">
							<h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
							{member.position && <p className="text-sm text-brand font-medium mb-3">{member.position}</p>}

							<div className="space-y-2 mb-4">
								<a href={`tel:${member.phone}`} className="flex items-center gap-2 text-gray-900 hover:text-brand text-sm">
									<Phone className="w-4 h-4" />
									{member.phone}
								</a>
								<a href={`mailto:${member.email}`} className="flex items-center gap-2 text-gray-900 hover:text-brand text-sm break-all">
									<Mail className="w-4 h-4" />
									{member.email}
								</a>
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
