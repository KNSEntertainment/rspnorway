"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function GetInvolvedPage() {
	const t = useTranslations("getInvolved");
	const [hoveredCard, setHoveredCard] = useState<number | null>(null);
	// Add CSS animations on client only
	useEffect(() => {
		const style = document.createElement("style");
		style.textContent = `
		@keyframes fadeInUp {
			from {
				opacity: 0;
				transform: translateY(30px);
			}
			from {
				opacity: 0;
				transform: translateY(50px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
		@keyframes fade-in {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
		.animate-fade-in {
			animation: fade-in 1s ease-out;
		}
	`;
		document.head.appendChild(style);
		return () => {
			document.head.removeChild(style);
		};
	}, []);

	const opportunities = [
		{
			id: "community-organizer",
			title: t("communityOrganizer"),
			description: t("communityOrganizerDesc"),
			icon: "🎪",
			color: "bg-blue-300",
			gradient: "from-blue-400 to-blue-600",
			features: [t("organizeEvents"), t("buildConnections"), t("representValues")],
		},
		{
			id: "digital-activist",
			title: t("digitalActivist"),
			description: t("digitalActivistDesc"),
			icon: "📱",
			color: "bg-purple-300",
			gradient: "from-purple-400 to-purple-600",
			features: [t("manageSocialMedia"), t("createContent"), t("driveEngagement")],
		},
		{
			id: "policy-contributor",
			title: t("policyContributor"),
			description: t("policyContributorDesc"),
			icon: "📋",
			color: "bg-indigo-300",
			gradient: "from-indigo-400 to-indigo-600",
			features: t.raw("policyContributorFeatures"),
		},
	];

	return (
		<div className=" bg-brand/5">
			{/* Hero Section with Animated Background */}
			<div className="relative overflow-hidden bg-gradient-to-b from-transparent to-brand/20 text-gray-700 pt-16 pb-32">
				<div className="absolute inset-0 opacity-20">
					<div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
					<div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
				</div>

				<div className="relative max-w-6xl mx-auto px-4 py-4 md:py-8 text-center">
					<h1 className="text-2xl md:text-3xl font-bold md:my-6 animate-fade-in">{t("title")}</h1>
					<p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">{t("hero")}</p>
					<div className="flex justify-center gap-4">
						<Link href="/opportunities" className="px-4 md:px-6 py-2 bg-gray-50 text-brand rounded-full font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg">
							{t("opportunities")}
						</Link>
						<Link href="#volunteer" className="px-4 md:px-6 py-2 bg-transparent border-2 border-white text-gray-600 rounded-full font-semibold hover:bg-gray-50 hover:text-brand transition-all transform hover:scale-105">
							{t("volunteering")}
						</Link>
					</div>
				</div>
			</div>

			{/* Impact Stats Section */}
			<div className="max-w-6xl mx-auto px-4 -mt-24 md:-mt-20 relative z-10">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
					<StatCard number="100+" label={t("activeMembers")} icon="👥" delay="0s" />
					<StatCard number="20+" label={t("eventsOrganized")} icon="📅" delay="0.1s" />
					<StatCard number="30+" label={t("citiesReached")} icon="🌍" delay="0.2s" />
					<StatCard number="1000+" label={t("livesImpacted")} icon="❤️" delay="0.3s" />
				</div>
			</div>

			{/* Ways to Get Involved Section */}
			<div id="ways" className="max-w-6xl mx-auto px-4 pt-16 md:pt-24">
				<h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-1 md:mb-4">{t("waysTitle")}</h2>
				<p className="text-xl text-gray-600 text-center mb-12 md:mb-16 max-w-3xl mx-auto">{t("waysDesc")}</p>

				<div className="grid md:grid-cols-3 gap-8">
					{opportunities.map((opp, index) => (
						<OpportunityCard key={index} {...opp} index={index} isHovered={hoveredCard === index} onHover={() => setHoveredCard(index)} onLeave={() => setHoveredCard(null)} />
					))}
				</div>
				<div id="volunteer"></div>
			</div>

			{/* Volunteer Form Section */}
			<div className="md:bg-gray-50 md:py-20 py-6">
				<div className="max-w-6xl mx-auto px-4">
					<div className="bg-white rounded-xl md:shadow-md overflow-hidden">
						<div className="grid md:grid-cols-2">
							{/* Left Side - Info */}
							<div className="bg-brand p-8 md:py-12 text-white">
								<h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-6">{t("becomeVolunteer")}</h2>
								<p className="text-blue-100 md:mb-8 text-lg">{t("volunteerDesc")}</p>

								<div className="hidden md:block space-y-6">
									<FeatureItem icon="🎯" title={t("flexibleCommitment")} description={t("flexibleCommitmentDesc")} />
									<FeatureItem icon="🤝" title={t("skillDevelopment")} description={t("skillDevelopmentDesc")} />
									<FeatureItem icon="🌟" title={t("makeRealImpact")} description={t("makeRealImpactDesc")} />
									<FeatureItem icon="🎓" title={t("trainingProvided")} description={t("trainingProvidedDesc")} />
								</div>
							</div>

							{/* Right Side - Form */}
							<div className="p-12">
								<VolunteerForm />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Testimonials Section */}
			<div className="max-w-6xl mx-auto px-4 py-12">
				<h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-6 md:mb-12">{t("voices_of_change")}</h2>
				<div className="grid md:grid-cols-3 gap-4 md:gap-8">
					{testimonials.map((testimonial, index) => (
						<TestimonialCard key={index} {...testimonial} />
					))}
				</div>
			</div>

			{/* Call to Action */}
			<div className="bg-brand text-white py-12 md:py-20">
				<div className="max-w-4xl mx-auto px-4 text-center">
					<h2 className="text-xl md:text-2xl font-bold mb-6">{t("readyToMakeHistory")}</h2>
					<p className="text-xl text-white mb-8">{t("joinRSP")}</p>
					<div className="flex justify-center gap-4">
						<Link href="/membership" className="px-4 md:px-6 py-2 bg-white text-brand rounded-full font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl">
							{t("becomeMember")}
						</Link>
						<Link href="/contact" className="px-4 md:px-6 py-2 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-brand transition-all transform hover:scale-105">
							{t("contact")}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

function StatCard({ number, label, icon, delay }: { number: string; label: string; icon: string; delay: string }) {
	return (
		<div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2" style={{ animation: `slideUp 0.6s ease-out ${delay} both` }}>
			<div className="text-4xl mb-3">{icon}</div>
			<div className="text-3xl font-bold text-brand mb-2">{number}</div>
			<div className="text-gray-600 font-medium">{label}</div>
		</div>
	);
}

type OpportunityCardProps = {
	id: string;
	title: string;
	description: string;
	icon: string;
	color: string;
	gradient: string;
	features: string[];
	index: number;
	onHover: () => void;
	onLeave: () => void;
	isHovered?: boolean;
};

function OpportunityCard({ id, title, description, icon, color, gradient, features, index, onHover, onLeave }: OpportunityCardProps) {
	return (
		<div className="relative bg-white rounded-2xl md:shadow-lg shadow-sm md:hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform md:hover:-translate-y-2" onMouseEnter={onHover} onMouseLeave={onLeave} style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}>
			<div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
			<div className="p-8">
				<div className={`w-12 md:w-16 h-12 md:h-16 ${color} rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>{icon}</div>
				<h3 className="text-lg md:text-xl font-bold text-gray-700 mb-4">{title}</h3>
				<p className="text-gray-600 mb-6">{description}</p>
				<ul className="space-y-3 mb-6">
					{features.map((feature: string, idx: number) => (
						<li key={idx} className="flex items-start text-gray-700">
							<svg className="w-5 h-5 text-brand mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							{feature}
						</li>
					))}
				</ul>
				<Link href={{ pathname: "/opportunities", query: { id: id || "community-organizer" } }} className={`inline-flex text-gray-500 hover:text-gray-700 items-center text-sm group-hover:gap-2 transition-all bg-transparent`}>
					Learn More
					<svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
					</svg>
				</Link>
			</div>
		</div>
	);
}

function VolunteerForm() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		interests: [] as string[],
	});
	const t = useTranslations("getInvolved");
	const interests = [t("events"), t("socialMedia"), t("fundraising"), t("outreach"), t("research"), t("design")];

	const handleSubmit = () => {
		console.log("Volunteer form submitted:", formData);
		alert("Thank you for your interest! We will contact you soon.");
	};
	return (
		<div className="space-y-6">
			<div>
				<label className="block text-sm font-semibold text-gray-700 mb-3">{t("fullName")}</label>
				<input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder={t("fullName_ph")} />
			</div>
			<div>
				<label className="block text-sm font-semibold text-gray-700 mb-3">{t("email")}</label>
				<input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder={t("email")} />
			</div>
			<div>
				<label className="block text-sm font-semibold text-gray-700 mb-3">{t("phone")}</label>
				<input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="+47 XXX XX XXX" />
			</div>

			<div>
				<label className="block text-sm font-semibold text-gray-700 mb-3">{t("areasOfInterest")}</label>
				<div className="grid grid-cols-2 gap-2">
					{interests.map((interest) => (
						<label key={interest} className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
							<input
								type="checkbox"
								checked={formData.interests.includes(interest)}
								onChange={(e) => {
									if (e.target.checked) {
										setFormData({ ...formData, interests: [...formData.interests, interest] });
									} else {
										setFormData({ ...formData, interests: formData.interests.filter((i) => i !== interest) });
									}
								}}
								className="w-4 h-4 text-blue-600 rounded"
							/>
							<span className="ml-2 text-sm font-medium text-gray-700">{interest}</span>
						</label>
					))}
				</div>
			</div>

			<button onClick={handleSubmit} className="w-full bg-brand text-white py-2 md:py-4 rounded-xl font-bold text-lg hover:bg-brand/80 transition-all transform hover:scale-105 shadow-lg">
				{t("submitApplication")}
			</button>
		</div>
	);
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
	return (
		<div className="flex items-start">
			<div className="textxl md:text-2xl mr-4">{icon}</div>
			<div>
				<h4 className="font-semibold text-md mb-1">{title}</h4>
				<p className="text-blue-100 text-sm">{description}</p>
			</div>
		</div>
	);
}

type TestimonialCardProps = {
	name: string;
	role: string;
	quote: string;
	location: string;
};

function TestimonialCard({ name, role, quote, location }: TestimonialCardProps) {
	return (
		<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
			<div className="flex items-center mb-6">
				<div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-brand rounded-full flex items-center justify-center text-white text-2xl font-bold">{name.charAt(0)}</div>
				<div className="ml-4">
					<h4 className="font-bold text-gray-900">{name}</h4>
					<p className="text-sm text-gray-600">{role}</p>
					<p className="text-xs text-gray-500">{location}</p>
				</div>
			</div>
			<p className="text-gray-700 italic leading-relaxed">&quot;{quote}&quot;</p>
		</div>
	);
}

const testimonials = [
	{
		name: "Prabin Sharma",
		role: "Community Organizer",
		location: "Oslo",
		quote: "Being part of RSP Norway has given me a platform to contribute meaningfully to Nepal's future while staying connected to my roots.",
	},

	{
		name: "Rajesh Thapa",
		role: "Digital Activist",
		location: "Trondheim",
		quote: "RSP gives me the opportunity to use my skills for something bigger than myself. It's about building the Nepal we all dream of.",
	},
	{
		name: "Sita Gurung",
		role: "Policy Contributor",
		location: "Bergen",
		quote: "The energy and commitment of RSP members inspires me every day. Together, we are bringing real change for Nepal.",
	},
];
