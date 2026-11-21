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

// Sensible initial priority when order is not yet explicitly set
function getHierarchyPriority(position = "") {
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

export async function GET() {
	try {
		await connectDB();

		// 1. Get executive members from ExecutiveMember collection
		const adminExecutiveMembers = await ExecutiveMember.find({ isActive: true }).lean();

		const adminEmails = new Set(
			adminExecutiveMembers
				.map((m) => m.email?.toLowerCase().trim())
				.filter(Boolean)
		);

		// 2. Get executive members from Membership collection (not blocked)
		const selfRegisteredExecutiveMembers = await Membership.find({
			membershipType: "executive",
			membershipStatus: { $ne: "blocked" },
		}).lean();

		// Transform self-registered members
		const transformedSelfRegistered = selfRegisteredExecutiveMembers
			.filter((member) => !adminEmails.has(member.email?.toLowerCase().trim()))
			.map((member) => ({
				_id: member._id.toString(),
				name: member.fullName,
				email: member.email,
				phone: member.phone,
				position: member.position || member.profession || "Executive Member",
				department: member.department || "",
				subdepartment: member.subdepartment || "",
				imageUrl: member.profilePhoto || "",
				order: parseOrder(member.order),
				isActive: member.membershipStatus !== "blocked",
				createdBy: "membership-form",
				createdAt: member.createdAt,
				updatedAt: member.updatedAt || member.createdAt,
				source: "membership",
			}));

		const transformedAdminMembers = adminExecutiveMembers.map((m) => ({
			_id: m._id.toString(),
			name: m.name,
			email: m.email,
			phone: m.phone,
			position: m.position || "Executive Member",
			department: m.department || "",
			subdepartment: m.subdepartment || "",
			imageUrl: m.imageUrl || "",
			order: parseOrder(m.order),
			isActive: true,
			createdBy: m.createdBy || "",
			createdAt: m.createdAt,
			updatedAt: m.updatedAt || m.createdAt,
			source: "executive_member",
		}));

		// Combine both arrays and sort strictly by organizational hierarchy order (ascending)
		const allExecutiveMembers = [...transformedAdminMembers, ...transformedSelfRegistered].sort((a, b) => {
			const orderA = parseOrder(a.order);
			const orderB = parseOrder(b.order);

			// 1. If both have explicit assigned orders, respect explicit order (lower number first)
			if (orderA > 0 && orderB > 0) {
				if (orderA !== orderB) {
					return orderA - orderB;
				}
			}

			// 2. Explicit order always comes before unranked (order === 0)
			if (orderA > 0 && orderB === 0) return -1;
			if (orderA === 0 && orderB > 0) return 1;

			// 3. Fallback: position hierarchy priority (President -> VP -> Gen Sec -> Treasurer -> Members)
			const prioA = getHierarchyPriority(a.position);
			const prioB = getHierarchyPriority(b.position);
			if (prioA !== prioB) return prioA - prioB;

			// 4. Final tiebreaker: alphabetical by name
			return (a.name || "").localeCompare(b.name || "");
		});

		return NextResponse.json(allExecutiveMembers, {
			headers: {
				"Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
				Pragma: "no-cache",
				Expires: "0",
			},
		});
	} catch (error) {
		console.error("Error fetching unified executive members:", error);
		return NextResponse.json({ error: "Failed to fetch executive members." }, { status: 500 });
	}
}
