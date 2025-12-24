// pages/tour-confirmation.js
import React from "react";
import Link from "next/link";
import Head from "next/head";

export default function TourConfirmation() {
	return (
		<>
			<Head>
				<title>Tour Booking Confirmation | RSP Norway School</title>
				<meta name="description" content="Thank you for booking a tour at our RSP Norway." />
			</Head>

			<div className="max-w-3xl mx-auto p-6 md:p-8 md:pt-36 md:pb-12  bg-white rounded-lg shadow-md">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-[#0094da] mb-6">Thank You for Booking a Tour!</h1>

					<div className="mb-8">
						<div className="w-24 h-24 rounded-full bg-[#0094da] text-[#0094da] flex items-center justify-center mx-auto mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>

						<p className="text-lg text-gray-700 mb-2">Your tour booking has been successfully submitted!</p>
						<p className="text-gray-600 mb-6">A member of our admissions team will contact you shortly to confirm your appointment.</p>
					</div>

					<div className="bg-[#0094da] p-4 rounded-lg mb-8">
						<h2 className="text-xl font-semibold text-[#0094da] mb-3">What to Expect</h2>
						<ul className="text-left text-gray-700 space-y-2">
							<li className="flex items-start">
								<span className="mr-2 text-[#0094da]">•</span>
								<span>You will receive a confirmation email with your tour details</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 text-[#0094da]">•</span>
								<span>Tours typically last 30-45 minutes</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 text-[#0094da]">•</span>
								<span>You&apos;ll have the opportunity to meet our teachers and observe classes</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 text-[#0094da]">•</span>
								<span>Feel free to bring your child along for the tour</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2 text-[#0094da]">•</span>
								<span>Come with any questions you have about our RSP Norway program</span>
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<p className="text-gray-700">If you need to reschedule or have any questions before your tour, please contact our admissions office:</p>

						<div className="flex justify-center space-x-4">
							<a href="tel:+977 1-5454294" className="flex items-center text-[#0094da] hover:text-[#0094da]">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
								</svg>
								+977 1-5454294{" "}
							</a>

							<a href="mailto:magicchalk.edu@gmail.com" className="flex items-center text-[#0094da] hover:text-[#0094da]">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
								magicchalk.edu@gmail.com
							</a>
						</div>
					</div>

					<div className="mt-10">
						<Link href="/" className="inline-block px-6 py-3 bg-[#0094da] text-white rounded-md hover:bg-[#0094da] focus:outline-none focus:ring-2 focus:ring-[#0094da] focus:ring-offset-2">
							Return to Homepage
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}
