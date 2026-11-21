import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import ConnectDB from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog.Model";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		// Admin only authorization
		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json(
				{ error: "Access denied. Administrator privileges required." },
				{ status: 403 }
			);
		}

		await ConnectDB();

		const { searchParams } = new URL(req.url);

		const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
		const limit = Math.min(100, Math.max(5, parseInt(searchParams.get("limit") || "25", 10)));
		const skip = (page - 1) * limit;

		const search = searchParams.get("search")?.trim() || "";
		const action = searchParams.get("action")?.trim() || "";
		const category = searchParams.get("category")?.trim() || "";
		const membershipType = searchParams.get("membershipType")?.trim() || "";
		const status = searchParams.get("status")?.trim() || "";
		const timeRange = searchParams.get("timeRange")?.trim() || "all";
		const userEmail = searchParams.get("userEmail")?.trim() || "";

		// Build MongoDB query filter
		const filter: Record<string, unknown> = {};

		if (action && action !== "all") {
			filter.action = action.toUpperCase();
		}

		if (category && category !== "all") {
			filter.category = category.toLowerCase();
		}

		if (membershipType && membershipType !== "all") {
			filter.membershipType = membershipType.toLowerCase();
		}

		if (status && status !== "all") {
			filter.status = status.toLowerCase();
		}

		if (userEmail) {
			filter.userEmail = userEmail.toLowerCase();
		}

		// Time range filtering
		if (timeRange && timeRange !== "all") {
			const now = new Date();
			let startDate: Date | null = null;

			if (timeRange === "today") {
				startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			} else if (timeRange === "24h") {
				startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			} else if (timeRange === "7d") {
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			} else if (timeRange === "30d") {
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			}

			if (startDate) {
				filter.createdAt = { $gte: startDate };
			}
		}

		// Text search
		if (search) {
			const regex = new RegExp(search, "i");
			filter.$or = [
				{ userName: regex },
				{ userEmail: regex },
				{ description: regex },
				{ path: regex },
				{ ipAddress: regex },
				{ pageTitle: regex },
			];
		}

		// Query paginated logs and count in parallel
		const [logs, totalCount] = await Promise.all([
			ActivityLog.find(filter)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			ActivityLog.countDocuments(filter),
		]);

		// Compute KPI summary stats
		const todayStart = new Date();
		todayStart.setHours(0, 0, 0, 0);

		const [
			totalLogins,
			totalPageViews,
			failedLogins,
			todayLogins,
			distinctUsers,
			membershipCounts,
		] = await Promise.all([
			ActivityLog.countDocuments({ action: "LOGIN" }),
			ActivityLog.countDocuments({ action: "PAGE_VIEW" }),
			ActivityLog.countDocuments({ action: "LOGIN_FAILED" }),
			ActivityLog.countDocuments({ action: "LOGIN", createdAt: { $gte: todayStart } }),
			ActivityLog.distinct("userEmail", { userEmail: { $ne: "" } }),
			ActivityLog.aggregate([
				{ $match: { action: "LOGIN" } },
				{ $group: { _id: "$membershipType", count: { $sum: 1 } } },
			]),
		]);

		const membershipBreakdown: Record<string, number> = {};
		membershipCounts.forEach((item: { _id?: string; count: number }) => {
			if (item._id) membershipBreakdown[item._id] = item.count;
		});

		return NextResponse.json({
			success: true,
			logs,
			pagination: {
				total: totalCount,
				page,
				limit,
				totalPages: Math.ceil(totalCount / limit) || 1,
			},
			stats: {
				totalLogins,
				totalPageViews,
				failedLogins,
				todayLogins,
				uniqueUsersCount: distinctUsers.length,
				membershipBreakdown,
			},
		});
	} catch (error) {
		console.error("Error fetching activity logs:", error);
		const message = error instanceof Error ? error.message : "Failed to fetch logs";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		// Admin only authorization
		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json(
				{ error: "Access denied. Administrator privileges required." },
				{ status: 403 }
			);
		}

		await ConnectDB();

		const { searchParams } = new URL(req.url);
		const days = parseInt(searchParams.get("olderThanDays") || "0", 10);
		const clearAll = searchParams.get("clearAll") === "true";

		let deleteFilter: Record<string, unknown> = {};

		if (clearAll) {
			deleteFilter = {};
		} else if (days > 0) {
			const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
			deleteFilter = { createdAt: { $lt: cutoffDate } };
		} else {
			return NextResponse.json(
				{ error: "Specify either olderThanDays (e.g. 30, 60, 90) or clearAll=true" },
				{ status: 400 }
			);
		}

		const result = await ActivityLog.deleteMany(deleteFilter);

		return NextResponse.json({
			success: true,
			message: `Successfully purged ${result.deletedCount} log record(s).`,
			deletedCount: result.deletedCount,
		});
	} catch (error) {
		console.error("Error purging activity logs:", error);
		return NextResponse.json({ error: "Failed to purge logs" }, { status: 500 });
	}
}
