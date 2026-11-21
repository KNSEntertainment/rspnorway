"use client";

import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import { Phone, Mail, Search, X, UserPlus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";

/**
 * @typedef {Object} ExecutiveMember
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} [imageUrl]
 * @property {string} [position]
 * @property {string} [department]
 * @property {string} [subdepartment]
 * @property {string[]} [tags]
 */

/**
 * @typedef {Object} RegularMember
 * @property {string} _id
 * @property {string} fullName
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [profilePhoto]
 * @property {string} membershipType
 * @property {string} membershipStatus
 * @property {string} [city]
 * @property {string} [province]
 * @property {string} [profession]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Department
 * @property {string} _id
 * @property {string} name
 * @property {string[]} subdepartments
 * @property {number} order
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} Filters
 * @property {string|null} department
 * @property {string|null} subdepartment
 * @property {string} search
 */

function MemberCard({ name, position, department, subdepartment, email, phone, imageUrl, avatarGradient, showContact, session, member, locale = "en" }) {
	const initial = name?.charAt(0).toUpperCase() ?? "?";

	// Debug logging for production vs localhost differences
	if (member?.profilePhoto && process.env.NODE_ENV === "production") {
		console.log("MemberCard Debug:", {
			name,
			permissionPhotos: member?.permissionPhotos,
			permissionType: typeof member?.permissionPhotos,
			hasPhoto: !!member?.profilePhoto,
			imageUrl,
		});
	}

	const profileUrl = member?._id ? `/${locale}/members/${member._id}` : null;

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col relative group">
			{/* Avatar / Photo */}
			{profileUrl ? (
				<Link href={profileUrl} className="block aspect-square overflow-hidden bg-light relative cursor-pointer">
					{member?.permissionPhotos !== false && imageUrl && !imageUrl.startsWith("data:") ? (
						<Image src={imageUrl} alt={name} width={300} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
					) : (
						<div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${avatarGradient}`}>
							<span className="text-white text-6xl font-bold">{initial}</span>
						</div>
					)}
				</Link>
			) : (
				<div className="aspect-square overflow-hidden bg-light relative">
					{member?.permissionPhotos !== false && imageUrl && !imageUrl.startsWith("data:") ? (
						<Image src={imageUrl} alt={name} width={300} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
					) : (
						<div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${avatarGradient}`}>
							<span className="text-white text-6xl font-bold">{initial}</span>
						</div>
					)}
				</div>
			)}

			{/* Info */}
			<div className="p-3 md:p-5 flex flex-col flex-1">
				{profileUrl ? (
					<Link href={profileUrl} className="hover:text-brand transition-colors">
						<h3 className="text-sm md:text-lg font-bold text-gray-900 group-hover:text-brand mb-0.5 line-clamp-1">{name}</h3>
					</Link>
				) : (
					<h3 className="text-sm md:text-lg font-bold text-gray-900 mb-0.5 line-clamp-1">{name}</h3>
				)}

				{position && <p className="text-xs md:text-sm font-semibold text-brand mb-1 line-clamp-1">{position}</p>}
				{department && (
					<span className="inline-block self-start text-[10px] md:text-xs text-gray-600 bg-gray-100 rounded px-2 py-0.5 mb-2 line-clamp-1">
						{department}
						{subdepartment ? ` • ${subdepartment}` : ""}
					</span>
				)}

				{/* Contact — only show when session exists AND member has granted permission (or undefined for executive members) */}
				{showContact && session?.user && (
					<div className="space-y-1.5 mb-2 mt-auto text-xs">
						{(member?.permissionPhone !== false || member?.permissionPhone === undefined) && phone && (
							<a href={`tel:${phone}`} className="flex items-center gap-2 text-gray-600 hover:text-brand text-xs">
								<Phone className="w-3.5 h-3.5 flex-shrink-0" />
								<span className="truncate">{phone}</span>
							</a>
						)}
						{(member?.permissionEmail !== false || member?.permissionEmail === undefined) && (
							<a href={`mailto:${email}`} className="flex items-center gap-2 text-gray-600 hover:text-brand text-xs break-all">
								<Mail className="w-3.5 h-3.5 flex-shrink-0" />
								<span className="truncate">{email}</span>
							</a>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

// Sensible hierarchy priority when numeric order is 0 or unassigned
function getPublicHierarchyPriority(position = "") {
	const pos = (position || "").toLowerCase().trim();
	if (!pos) return 99;

	if (pos.includes("senior vice") || pos.includes("sr. vice") || pos.includes("sr vice") || pos.includes("वरिष्ठ उपाध्यक्ष")) return 2;
	if (pos.includes("vice") || pos.includes("उपाध्यक्ष")) return 3;
	if (pos.includes("president") || pos.includes("chair") || pos.includes("अध्यक्ष") || pos.includes("सभापति")) return 1;
	if (pos.includes("general secretary") || pos.includes("gen. sec") || pos.includes("gen sec") || pos.includes("secretary general") || pos.includes("महासचिव")) return 4;
	if (pos.includes("joint secretary") || pos.includes("deputy secretary") || pos.includes("सह-सचिव") || pos.includes("सहसचिव") || pos.includes("उप-सचिव")) return 7;
	if (pos.includes("secretary") || pos.includes("सचिव")) return 5;
	if (pos.includes("joint treasurer") || pos.includes("deputy treasurer") || pos.includes("सह-कोषाध्यक्ष") || pos.includes("सहकोषाध्यक्ष")) return 8;
	if (pos.includes("treasurer") || pos.includes("finance") || pos.includes("कोषाध्यक्ष")) return 6;
	if (pos.includes("spokesperson") || pos.includes("प्रवक्ता")) return 8.5;
	if (pos.includes("head") || pos.includes("coordinator") || pos.includes("प्रमुख") || pos.includes("संयोजक")) return 9;
	if (pos.includes("advisor") || pos.includes("सल्लाहकार")) return 12;
	if (pos.includes("member") || pos.includes("सदस्य")) return 10;
	return 20;
}

export default function Members() {
	const t = useTranslations("members");
	const locale = useLocale();
	const { data: session } = useSession();
	const [executiveMembers, setExecutiveMembers] = useState([]);
	const [filteredExecutiveMembers, setFilteredExecutiveMembers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		async function fetchData() {
			try {
				const timestamp = new Date().getTime();
				const getUrl = (path) => {
					if (typeof window !== "undefined") return `${path}?t=${timestamp}`;
					const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
					return `${base}${path}?t=${timestamp}`;
				};

				const executiveMembersResponse = await fetch(getUrl("/api/executive-members/unified"), {
					cache: "no-store",
					headers: {
						"Cache-Control": "no-cache, no-store, must-revalidate",
						Pragma: "no-cache",
						Expires: "0",
					},
				});

				if (executiveMembersResponse.ok) {
					const executiveMembersData = await executiveMembersResponse.json();
					setExecutiveMembers(executiveMembersData);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
				setExecutiveMembers([]);
				setFilteredExecutiveMembers([]);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	// Helper to safely parse order values
	const parseOrder = (val) => {
		if (val === null || val === undefined || val === "") return 0;
		const n = Number(val);
		return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
	};

	// Sort executive members strictly by organizational hierarchy order (lower numbers first, or by role hierarchy priority)
	const sortExecutiveByHierarchy = useCallback((list) => {
		return [...list].sort((a, b) => {
			const orderA = parseOrder(a.order);
			const orderB = parseOrder(b.order);

			// 1. If explicit positive orders exist and differ, sort by explicit order
			if (orderA > 0 && orderB > 0) {
				if (orderA !== orderB) {
					return orderA - orderB;
				}
			}
			if (orderA > 0 && orderB === 0) return -1;
			if (orderA === 0 && orderB > 0) return 1;

			// 2. If unranked or equal order, sort by organizational hierarchy priority of the position
			const prioA = getPublicHierarchyPriority(a.position);
			const prioB = getPublicHierarchyPriority(b.position);
			if (prioA !== prioB) {
				return prioA - prioB;
			}

			// 3. Fallback: alphabetical by name
			return (a.name || "").localeCompare(b.name || "");
		});
	}, []);

	useEffect(() => {
		const sortedExecutiveMembers = sortExecutiveByHierarchy(executiveMembers);
		setFilteredExecutiveMembers(sortedExecutiveMembers);
	}, [executiveMembers, sortExecutiveByHierarchy]);

	const applyFilters = useCallback(() => {
		let executiveFiltered = [...executiveMembers];
		if (searchQuery.trim()) {
			const searchLower = searchQuery.toLowerCase().trim();
			executiveFiltered = executiveFiltered.filter((m) => {
				const nameMatch = m.name?.toLowerCase().includes(searchLower);
				const positionMatch = m.position?.toLowerCase().includes(searchLower);
				const emailMatch = m.permissionEmail && m.email?.toLowerCase().includes(searchLower);
				return nameMatch || positionMatch || emailMatch;
			});
		}

		// Sort filtered executive members by organizational hierarchy order
		const sortedExecutiveFiltered = sortExecutiveByHierarchy(executiveFiltered);

		setFilteredExecutiveMembers(sortedExecutiveFiltered);
	}, [executiveMembers, searchQuery, sortExecutiveByHierarchy]);

	useEffect(() => {
		applyFilters();
	}, [applyFilters]);

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
			<SectionHeader heading={t("title")} subtitle={t("description")} className="mb-0" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
				{/* Search and Filter Toggle */}
				<div className="mb-3">
					<div className="bg-white rounded-lg shadow-sm px-4 py-3">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							{!session && (
								<div className="order-first sm:order-none sm:justify-end flex">
									<Link href={`/${locale}/membership`} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
										<UserPlus className="h-4 w-4" />
										<span>{t("become_a_member")}</span>
									</Link>
								</div>
							)}

							<div className="flex items-stretch sm:items-center gap-3 order-last sm:order-none">
								<div className="flex">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
										<input type="text" id="search" placeholder={t("search_placeholder")} className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
										{searchQuery && (
											<button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
												<X className="h-4 w-4" />
											</button>
										)}
									</div>
								</div>

								{/* <div className="flex items-center gap-2">
									<button onClick={() => setShowMobileFilters(!showMobileFilters)} className="inline-flex items-center gap-2 px-3 py-2 bg-brand text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
										<Filter className="h-4 w-4" />
										<span>{t("filters")}</span>
										{hasActiveFilters && <span className="bg-white text-brand rounded-full px-2 py-0.5 text-xs font-semibold">{[filters.department, filters.subdepartment].filter(Boolean).length}</span>}
									</button>
									{hasActiveFilters && (
										<button onClick={clearAllFilters} className="text-sm text-brand hover:text-blue-700 font-medium">
											{t("clear_all")}
										</button>
									)}
								</div> */}
							</div>
						</div>

						{/* <div className="text-sm text-gray-700 sm:ml-auto m-2 text-left sm:text-right">
							<span className="text-brand font-bold">{filteredExecutiveMembers.length}</span> {filteredExecutiveMembers.length === 1 ? t("executive_member") : t("executive_members")}
						</div> */}
					</div>
				</div>

				{/* Filters Panel */}
				{/* <div className={`mb-3 ${showMobileFilters ? "block" : "hidden"}`}>
					<div className="bg-white rounded-lg shadow-sm px-4 py-3">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-md font-bold text-brand">{t("filters")}</h3>
						</div>

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
				</div> */}

				{/* Active Filter Pills */}
				{/* {hasActiveFilters && (
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
				)} */}

				{/* Executive Members */}
				{filteredExecutiveMembers.length > 0 && (
					<div className="mb-8 md:mb-20 px-0 p-6">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">{t("executive_members")}</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
							{filteredExecutiveMembers.map((member) => (
								<MemberCard key={member._id} name={member.name} position={member.position} department={member.department} subdepartment={member.subdepartment} order={member.order} email={member.email} phone={member.phone} imageUrl={member.imageUrl} avatarGradient="from-brand to-blue-600" showContact={true} session={session} member={member} locale={locale} />
							))}
						</div>
					</div>
				)}

				{/* General Members
				{filteredGeneralMembers.length > 0 && (
					<div className="mb-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">{t("general_members")}</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
							{filteredGeneralMembers.map((member) => (
								<MemberCard key={member._id} name={member.fullName} email={member.email} phone={member.phone} imageUrl={member.profilePhoto} avatarGradient="from-gray-500 to-gray-600" showContact={true} session={session} member={member} />
							))}
						</div>
					</div>
				)} */}

				{/* No Results */}
				{/* {filteredExecutiveMembers.length === 0 && (
					<div className="bg-white rounded-lg shadow-sm p-12 text-center">
						<div className="max-w-md mx-auto">
							<svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
				)} */}
			</div>
		</div>
	);
}
