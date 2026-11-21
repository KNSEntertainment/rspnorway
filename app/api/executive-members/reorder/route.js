import { NextResponse } from "next/server";
import mongoose from "mongoose";
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

export async function PUT(req) {
	try {
		await connectDB();
		const body = await req.json();
		const { orderedIds, members } = body;

		if (!orderedIds && !members) {
			return NextResponse.json({ error: "orderedIds or members array is required." }, { status: 400 });
		}

		let itemsToOrder = [];
		if (Array.isArray(members) && members.length > 0) {
			itemsToOrder = members.map((m, index) => {
				const id = (m._id || m.id || "").toString();
				const parsed = parseOrder(m.order);
				return {
					id,
					order: parsed > 0 ? parsed : index + 1,
				};
			});
		} else if (Array.isArray(orderedIds)) {
			itemsToOrder = orderedIds.map((id, index) => ({
				id: id.toString(),
				order: index + 1,
			}));
		}

		if (itemsToOrder.length > 0) {
			// Update each member across both Membership and ExecutiveMember collections
			// We do direct updates using findByIdAndUpdate AND collection.updateOne to be 100% resilient
			const updatePromises = itemsToOrder.map(async (item) => {
				if (!item.id) return null;
				const idStr = item.id.toString();
				const orderNum = parseInt(item.order, 10);
				if (isNaN(orderNum) || orderNum <= 0) return null;

				const promises = [];

				// 1. Mongoose model updates with strict: false
				promises.push(
					Membership.findByIdAndUpdate(idStr, { $set: { order: orderNum, updatedAt: new Date() } }, { strict: false }).catch(() => null)
				);
				promises.push(
					ExecutiveMember.findByIdAndUpdate(idStr, { $set: { order: orderNum, updatedAt: new Date() } }, { strict: false }).catch(() => null)
				);

				// 2. Direct collection updates using proper ObjectId casting
				if (mongoose.Types.ObjectId.isValid(idStr)) {
					const objId = new mongoose.Types.ObjectId(idStr);
					if (Membership.collection) {
						promises.push(
							Membership.collection.updateOne({ _id: objId }, { $set: { order: orderNum, updatedAt: new Date() } }).catch(() => null)
						);
					}
					if (ExecutiveMember.collection) {
						promises.push(
							ExecutiveMember.collection.updateOne({ _id: objId }, { $set: { order: orderNum, updatedAt: new Date() } }).catch(() => null)
						);
					}
				}

				return Promise.all(promises);
			});

			await Promise.all(updatePromises);
		}

		return NextResponse.json({
			success: true,
			message: "Executive hierarchy order updated successfully across all executive members.",
		});
	} catch (error) {
		console.error("Error reordering executive members:", error);
		return NextResponse.json({ error: "Failed to update hierarchy order." }, { status: 500 });
	}
}

export async function POST(req) {
	return PUT(req);
}
