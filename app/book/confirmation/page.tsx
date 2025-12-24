import Link from "next/link";
import { CheckCircle, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmationPage() {
	return (
		<div className="container mx-auto px-4 py-12 max-w-md">
			<div className="text-center space-y-6 bg-white p-8 rounded-lg border shadow-sm">
				<div className="flex justify-center">
					<div className="bg-[#0094da] p-3 rounded-full">
						<CheckCircle className="h-16 w-16 text-[#0094da]" />
					</div>
				</div>

				<h1 className="text-2xl font-bold">Appointment Confirmed!</h1>

				<p className="text-gray-600">Your appointment has been successfully booked. We&apos;ve sent a confirmation email with all the details.</p>

				<div className="bg-gray-50 p-4 rounded-lg text-left">
					<div className="flex items-center mb-2">
						<Calendar className="h-5 w-5 text-primary mr-2" />
						<span className="font-medium">Appointment Details</span>
					</div>
					<p className="text-sm text-gray-500 ml-7">You&apos;ll receive a reminder 24 hours before your appointment.</p>
				</div>

				<div className="pt-4">
					<Link href="/">
						<Button className="w-full">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Return to Home
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
