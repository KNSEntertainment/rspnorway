import DonationForm from "@/components/DonationForm";
import SectionHeader from "@/components/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Target, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const metadata = {
	title: "Donate - RSP Norway",
	description: "Support RSP Norway with your generous donation",
};

export default async function DonatePage() {
	const t = await getTranslations("donate");

	return (
		<div className="min-h-screen pb-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Hero Section */}

				<header className="text-center mb-12">
					<SectionHeader heading={t("hero_title")} />
					<p className="text-gray-900 mt-4 text-lg max-w-2xl mx-auto">{t("hero_description")}</p>
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
								<h3 className="text-xl font-bold text-gray-900 mb-4">{t("impact_title")}</h3>
								<div className="space-y-4">
									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
												<Users className="w-5 h-5 text-brand" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">{t("community_events")}</h4>
											<p className="text-sm text-gray-600">{t("community_events_desc")}</p>
										</div>
									</div>

									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
												<Target className="w-5 h-5 text-success" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">{t("political_advocacy")}</h4>
											<p className="text-sm text-gray-600">{t("political_advocacy_desc")}</p>
										</div>
									</div>

									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
												<TrendingUp className="w-5 h-5 text-purple-600" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">{t("organizational_growth")}</h4>
											<p className="text-sm text-gray-600">{t("organizational_growth_desc")}</p>
										</div>
									</div>

									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
												<Heart className="w-5 h-5 text-amber-600" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">{t("member_support")}</h4>
											<p className="text-sm text-gray-600">{t("member_support_desc")}</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg bg-gradient-to-br from-brand to-blue-700 text-white">
							<CardContent className="pt-6">
								<h3 className="text-xl font-bold mb-3">{t("why_donate")}</h3>
								<ul className="space-y-2 text-sm">
									<li className="flex items-start gap-2">
										<span className="text-white/80">✓</span>
										<span>{t("why_donate_1")}</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-white/80">✓</span>
										<span>{t("why_donate_2")}</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-white/80">✓</span>
										<span>{t("why_donate_3")}</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-white/80">✓</span>
										<span>{t("why_donate_4")}</span>
									</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* FAQ Section */}
				<Card className="border-0 shadow-lg">
					<CardContent className="pt-6">
						<h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t("faq_title")}</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">{t("faq_1_question")}</h4>
								<p className="text-sm text-gray-600">{t("faq_1_answer")}</p>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">{t("faq_2_question")}</h4>
								<p className="text-sm text-gray-600">{t("faq_2_answer")}</p>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">{t("faq_3_question")}</h4>
								<p className="text-sm text-gray-600">{t("faq_3_answer")}</p>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">{t("faq_4_question")}</h4>
								<p className="text-sm text-gray-600">{t("faq_4_answer")}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
