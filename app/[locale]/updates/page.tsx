import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Calendar, FileText, Download, Bell, ArrowRight } from "lucide-react";

export const metadata = {
	title: "Updates | PNSB-Norway",
	description: "Stay updated with the latest events, notices, circulars, and downloads from PNSB-Norway.",
	openGraph: {
		title: "Updates | PNSB-Norway",
		description: "Stay updated with the latest events, notices, circulars, and downloads from PNSB-Norway.",
		url: "/updates",
		siteName: "PNSB-Norway",
		type: "website",
	},
};

export default async function UpdatesPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations("navigation");

	const updateCategories = [
		{
			title: t("events"),
			description: "Stay informed about upcoming events, meetings, and community gatherings.",
			href: "/events",
			icon: Calendar,
			color: "from-blue-500 to-blue-600",
		},
		{
			title: t("notices"),
			description: "Important announcements and official notices from PNSB-Norway.",
			href: "/notices",
			icon: Bell,
			color: "from-amber-500 to-orange-600",
		},
		{
			title: t("circulars"),
			description: "Official circulars and communications for our members.",
			href: "/circulars",
			icon: FileText,
			color: "from-green-500 to-emerald-600",
		},
		{
			title: t("downloads"),
			description: "Access important documents, forms, and resources.",
			href: "/downloads",
			icon: Download,
			color: "from-purple-500 to-violet-600",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
			<div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Header */}
				<div className="text-center mb-16">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						Updates
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Stay connected with the latest happenings at PNSB-Norway. Find all events, notices, circulars, and resources in one place.
					</p>
				</div>

				{/* Categories Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
					{updateCategories.map((category) => {
						const IconComponent = category.icon;
						return (
							<Link
								key={category.title}
								href={`/${locale}${category.href}`}
								className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
							>
								{/* Gradient Header */}
								<div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${category.color}`}></div>
								
								<div className="p-8">
									{/* Icon */}
									<div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${category.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
										<IconComponent className="w-8 h-8" />
									</div>

									{/* Content */}
									<h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
										{category.title}
									</h3>
									<p className="text-gray-600 mb-4 line-clamp-3">
										{category.description}
									</p>

									{/* Arrow */}
									<div className="flex items-center text-gray-400 group-hover:text-gray-600 transition-colors">
										<span className="text-sm font-medium mr-2">View</span>
										<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
									</div>
								</div>
							</Link>
						);
					})}
				</div>

				{/* Quick Info Section */}
				<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
					<div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
						<h2 className="text-2xl font-bold text-white mb-2">Need Help?</h2>
						<p className="text-white/90">
							Can&apos;t find what you&apos;re looking for? Contact us for assistance.
						</p>
					</div>
					<div className="p-8">
						<div className="flex flex-col sm:flex-row gap-4 items-center">
							<Link
								href={`/${locale}/contact`}
								className="flex-1 bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand/90 transition-colors text-center"
							>
								Contact Support
							</Link>
							<Link
								href={`/${locale}`}
								className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
							>
								Back to Home
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
