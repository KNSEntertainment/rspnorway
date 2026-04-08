import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2026-02-25.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
	try {
		console.log("Webhook received!");
		const body = await request.text();
		const headersList = await headers();
		const signature = headersList.get("stripe-signature");

		console.log("Webhook signature:", signature ? "present" : "missing");
		console.log("Webhook body length:", body.length);

		if (!signature) {
			return NextResponse.json({ error: "No signature" }, { status: 400 });
		}

		let event: Stripe.Event;

		try {
			event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
		} catch (err) {
			console.error("Webhook signature verification failed:", err);
			return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
		}

		await connectDB();

		// Handle the event
		console.log("Processing event type:", event.type);
		switch (event.type) {
			case "checkout.session.completed":
				const session = event.data.object as Stripe.Checkout.Session;
				console.log("Checkout session completed:", session.id);
				console.log("Payment intent:", session.payment_intent);

				// Update donation status
				const updatedDonation = await Donation.findOneAndUpdate(
					{ stripeSessionId: session.id },
					{
						paymentStatus: "completed",
						stripePaymentIntentId: session.payment_intent as string,
					},
					{ new: true } // Return the updated document
				);

				console.log("Donation updated:", updatedDonation?._id);
				console.log("Payment completed for session:", session.id);
				break;

			case "checkout.session.expired":
				const expiredSession = event.data.object as Stripe.Checkout.Session;

				await Donation.findOneAndUpdate({ stripeSessionId: expiredSession.id }, { paymentStatus: "failed" });

				console.log("Payment session expired:", expiredSession.id);
				break;

			case "payment_intent.payment_failed":
				const failedPayment = event.data.object as Stripe.PaymentIntent;

				await Donation.findOneAndUpdate({ stripePaymentIntentId: failedPayment.id }, { paymentStatus: "failed" });

				console.log("Payment failed:", failedPayment.id);
				break;

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return NextResponse.json({ received: true }, { status: 200 });
	} catch (error) {
		console.error("Webhook error:", error);
		return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
	}
}
