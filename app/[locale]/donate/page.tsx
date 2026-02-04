import DonationForm from "@/components/DonationForm";
import SectionHeader from "@/components/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Target, TrendingUp } from "lucide-react";

export const metadata = {
	title: "Donate - RSP Norway",
	description: "Support RSP Norway with your generous donation",
};

export default function DonatePage() {
	return (
		<div className="min-h-screen pb-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Hero Section */}
				<header className="text-center mb-12">
					<SectionHeader heading="Support Us" />
					<p className="text-gray-900 mt-4 text-lg max-w-2xl mx-auto">Your generous contribution helps us make a positive impact in the Nepali community in Norway and support democratic values in Nepal.</p>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
					{/* Donation Form - Takes 2 columns */}
					<div className="lg:col-span-2">
						<DonationForm />
					</div>

					{/* Impact Section - Takes 1 column */}
					<div className="space-y-6">
						<Card className="border-0 shadow-lg">
							<CardContent className="pt-6">
								<h3 className="text-xl font-bold text-gray-900 mb-4">Your Impact</h3>
								<div className="space-y-4">
									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
												<Users className="w-5 h-5 text-brand" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">Community Events</h4>
											<p className="text-sm text-gray-600">Support cultural programs and community gatherings</p>
										</div>
									</div>

									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
												<Target className="w-5 h-5 text-success" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">Political Advocacy</h4>
											<p className="text-sm text-gray-600">Fund campaigns and awareness programs</p>
										</div>
									</div>

									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
												<TrendingUp className="w-5 h-5 text-purple-600" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">Organizational Growth</h4>
											<p className="text-sm text-gray-600">Expand our reach and strengthen our movement</p>
										</div>
									</div>

									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
												<Heart className="w-5 h-5 text-amber-600" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">Member Support</h4>
											<p className="text-sm text-gray-600">Resources and assistance for our members</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg bg-gradient-to-br from-brand to-blue-700 text-white">
							<CardContent className="pt-6">
								<h3 className="text-xl font-bold mb-3">Why Donate?</h3>
								<ul className="space-y-2 text-sm">
									<li className="flex items-start gap-2">
										<span className="text-white/80">✓</span>
										<span>100% of donations go directly to our programs</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-white/80">✓</span>
										<span>Transparent financial reporting</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-white/80">✓</span>
										<span>Secure payment through Stripe</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-white/80">✓</span>
										<span>Email receipt for tax purposes</span>
									</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* FAQ Section */}
				<Card className="border-0 shadow-lg">
					<CardContent className="pt-6">
						<h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">Is my donation secure?</h4>
								<p className="text-sm text-gray-600">Yes, all payments are processed securely through Stripe, a trusted payment platform used by millions worldwide.</p>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">Will I receive a receipt?</h4>
								<p className="text-sm text-gray-600">Yes, you will receive an email receipt immediately after your donation is processed.</p>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">Can I donate anonymously?</h4>
								<p className="text-sm text-gray-600">Yes, you can choose to make your donation anonymous by checking the anonymous option in the form.</p>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">How will my donation be used?</h4>
								<p className="text-sm text-gray-600">Your donation supports community events, political advocacy, organizational operations, and member services.</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
