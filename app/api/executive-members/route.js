import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import Membership from "@/models/Membership.Model";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseOrder(val) {
	if (val === null || val === undefined || val === "") return 0;
	const n = Number(val);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

// Hierarchy priority helper for sensible initial sorting when order is not yet explicitly set
function getInitialHierarchyPriority(position = "") {
	const pos = (position || "").toLowerCase().trim();
	if (!pos) return 99;

	if (pos.includes("senior vice president") || pos.includes("वरिष्ठ उपाध्यक्ष")) return 2;
	if (pos.includes("vice president") || pos.includes("उपाध्यक्ष")) return 3;
	if (pos.includes("president") || pos.includes("chair") || pos.includes("अध्यक्ष") || pos.includes("सभापति")) return 1;
	if (pos.includes("general secretary") || pos.includes("महासचिव")) return 4;
	if (pos.includes("joint secretary") || pos.includes("सह-सचिव") || pos.includes("उप-सचिव")) return 7;
	if (pos.includes("secretary") || pos.includes("सचिव")) return 5;
	if (pos.includes("joint treasurer") || pos.includes("सह-कोषाध्यक्ष")) return 8;
	if (pos.includes("treasurer") || pos.includes("कोषाध्यक्ष")) return 6;
	if (pos.includes("head") || pos.includes("coordinator") || pos.includes("प्रमुख") || pos.includes("संयोजक")) return 9;
	if (pos.includes("advisor") || pos.includes("सल्लाहकार")) return 11;
	if (pos.includes("member") || pos.includes("सदस्य")) return 10;
	return 20;
}

export async function GET(req) {
	try {
		await connectDB();
		const { searchParams } = new URL(req.url);
		const all = searchParams.get("all") === "true";

		// 1. Fetch from ExecutiveMember collection
		const execMemberQuery = all ? {} : { isActive: true };
		const adminExecutiveMembers = await ExecutiveMember.find(execMemberQuery).lean();

		const adminEmails = new Set(
			adminExecutiveMembers
				.map((m) => m.email?.toLowerCase().trim())
				.filter(Boolean)
		);

		// 2. Fetch from Membership collection where membershipType === 'executive'
		// For admin dashboard (all=true), show all executive members who are not blocked
		// For public view (all=false), show only unblocked ones
		const membershipQuery = all
			? { membershipType: "executive", membershipStatus: { $ne: "blocked" } }
			: { membershipType: "executive", membershipStatus: { $ne: "blocked" } };

		const membershipExecutiveMembers = await Membership.find(membershipQuery).lean();

		// Transform Membership records to unified Executive Member format
		const transformedMemberships = membershipExecutiveMembers
			.filter((m) => !adminEmails.has(m.email?.toLowerCase().trim()))
			.map((m) => ({
				_id: m._id.toString(),
				name: m.fullName || "Member",
				fullName: m.fullName || "Member",
				email: m.email || "",
				phone: m.phone || "",
				position: m.position || m.profession || "Executive Member",
				department: m.department || "",
				subdepartment: m.subdepartment || "",
				imageUrl: m.profilePhoto || "",
				order: parseOrder(m.order),
				isActive: m.membershipStatus !== "blocked",
				membershipStatus: m.membershipStatus || "pending",
				membershipType: "executive",
				source: "membership",
				createdAt: m.createdAt,
				updatedAt: m.updatedAt || m.createdAt,
			}));

		const transformedAdminMembers = adminExecutiveMembers.map((m) => ({
			_id: m._id.toString(),
			name: m.name,
			fullName: m.name,
			email: m.email,
			phone: m.phone,
			position: m.position || "Executive Member",
			department: m.department || "",
			subdepartment: m.subdepartment || "",
			imageUrl: m.imageUrl || "",
			order: parseOrder(m.order),
			isActive: m.isActive !== undefined ? m.isActive : true,
			membershipStatus: m.isActive ? "approved" : "pending",
			membershipType: "executive",
			source: "executive_member",
			createdAt: m.createdAt,
			updatedAt: m.updatedAt || m.createdAt,
		}));

		// Combine both sources
		const allMembers = [...transformedAdminMembers, ...transformedMemberships];

		// Sort by order ASC (1, 2, 3...). If order is 0/unranked, sort by standard hierarchy priority
		allMembers.sort((a, b) => {
			const orderA = parseOrder(a.order);
			const orderB = parseOrder(b.order);

			if (orderA > 0 && orderB > 0) {
				if (orderA !== orderB) {
					return orderA - orderB;
				}
			}
			if (orderA > 0 && orderB === 0) return -1;
			if (orderA === 0 && orderB > 0) return 1;

			// Both are unranked: sort by position hierarchy priority
			const prioA = getInitialHierarchyPriority(a.position);
			const prioB = getInitialHierarchyPriority(b.position);
			if (prioA !== prioB) return prioA - prioB;

			return (a.name || "").localeCompare(b.name || "");
		});

		return NextResponse.json(allMembers, {
			headers: {
				"Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
				Pragma: "no-cache",
				Expires: "0",
			},
		});
	} catch (error) {
		console.error("Error fetching executive members:", error);
		return NextResponse.json({ error: "Failed to fetch executive members." }, { status: 500 });
	}
}
