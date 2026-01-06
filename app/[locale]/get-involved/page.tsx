"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function GetInvolvedPage() {
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
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
		@keyframes slideUp {
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

	return (
		<div className="min-h-screen mt-20 md:mt-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
			{/* Hero Section with Animated Background */}
			<div className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-brand text-white pt-24 pb-48">
				<div className="absolute inset-0 opacity-20">
					<div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
					<div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
				</div>

				<div className="relative max-w-6xl mx-auto px-4 text-center">
					<h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">Get Involved</h1>
					<p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">Your participation can transform Nepal. Join thousands of committed individuals working towards a progressive, corruption-free nation.</p>
					<div className="flex justify-center gap-4">
						<Link href="/opportunities" className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg">
							See Opportunities
						</Link>
						<Link href="#volunteer" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105">
							Volunteering
						</Link>
					</div>
				</div>
			</div>

			{/* Impact Stats Section */}
			<div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
					<StatCard number="100+" label="Active Members" icon="👥" delay="0s" />
					<StatCard number="20+" label="Events Organized" icon="📅" delay="0.1s" />
					<StatCard number="30+" label="Cities Reached" icon="🌍" delay="0.2s" />
					<StatCard number="1000+" label="Lives Impacted" icon="❤️" delay="0.3s" />
				</div>
			</div>

			{/* Ways to Get Involved Section */}
			<div id="ways" className="max-w-6xl mx-auto px-4 pt-20 pb-4 md:pb-20">
				<h2 className="text-3xl md:text-5xl font-bold text-gray-900 text-center mb-4">Ways to Make a Difference</h2>
				<p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">Choose how you want to contribute to building a better Nepal</p>

				<div className="grid md:grid-cols-3 gap-8">
					{opportunities.map((opp, index) => (
						<OpportunityCard key={index} {...opp} index={index} isHovered={hoveredCard === index} onHover={() => setHoveredCard(index)} onLeave={() => setHoveredCard(null)} />
					))}
				</div>
			</div>

			{/* Volunteer Form Section */}
			<div id="volunteer" className="bg-blue-200 md:py-20 py-4">
				<div className="max-w-6xl mx-auto px-4">
					<div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
						<div className="grid md:grid-cols-2">
							{/* Left Side - Info */}
							<div className="bg-brand p-12 text-white">
								<h2 className="text-3xl md:text-4xl font-bold mb-6">Become a Volunteer</h2>
								<p className="text-blue-100 mb-8 text-lg">Join our dedicated team of volunteers and be the change you want to see in Nepal.</p>

								<div className="space-y-6">
									<FeatureItem icon="🎯" title="Flexible Commitment" description="Choose activities that fit your schedule" />
									<FeatureItem icon="🤝" title="Skill Development" description="Gain valuable experience in community organizing" />
									<FeatureItem icon="🌟" title="Make Real Impact" description="See the direct results of your contributions" />
									<FeatureItem icon="🎓" title="Training Provided" description="We'll equip you with everything you need" />
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
			<div className="max-w-6xl mx-auto px-4 py-20">
				<h2 className="text-3xl font-bold text-gray-900 text-center mb-12 md:mb-16">Voices of Change</h2>
				<div className="grid md:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<TestimonialCard key={index} {...testimonial} />
					))}
				</div>
			</div>

			{/* Call to Action */}
			<div className="bg-gradient-to-b from-blue-600 to-brand text-white py-20">
				<div className="max-w-4xl mx-auto px-4 text-center">
					<h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Make History?</h2>
					<p className="text-xl text-blue-100 mb-8">Join RSP Norway today and be part of Nepal&apos;s transformation story</p>
					<div className="flex justify-center gap-4">
						<Link href="/membership" className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl">
							Become Member
						</Link>
						<Link href="/contact" className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105">
							Contact
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
			<div className="text-3xl font-bold text-blue-600 mb-2">{number}</div>
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
		<div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-2" onMouseEnter={onHover} onMouseLeave={onLeave} style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}>
			<div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
			<div className="p-8">
				<div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-3xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>{icon}</div>
				<h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
				<p className="text-gray-600 mb-6">{description}</p>
				<ul className="space-y-3 mb-6">
					{features.map((feature: string, idx: number) => (
						<li key={idx} className="flex items-start text-gray-700">
							<svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							{feature}
						</li>
					))}
				</ul>
				<Link href={{ pathname: "/opportunities", query: { id: id || "community-organizer" } }} className={`inline-flex items-center font-semibold ${color.replace("bg-", "text-")} group-hover:gap-2 transition-all`}>
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

	const handleSubmit = () => {
		console.log("Volunteer form submitted:", formData);
		alert("Thank you for your interest! We will contact you soon.");
	};

	const interests = ["Events", "Social Media", "Fundraising", "Outreach", "Research", "Design"];

	return (
		<div className="space-y-6">
			<div>
				<label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
				<input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Your name" />
			</div>

			<div>
				<label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
				<input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="your.email@example.com" />
			</div>

			<div>
				<label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
				<input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="+47 XXX XX XXX" />
			</div>

			<div>
				<label className="block text-sm font-semibold text-gray-700 mb-3">Areas of Interest</label>
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

			<button onClick={handleSubmit} className="w-full bg-gradient-to-b from-blue-600 to-brand text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-brand transition-all transform hover:scale-105 shadow-lg">
				Submit Application
			</button>
		</div>
	);
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
	return (
		<div className="flex items-start">
			<div className="text-3xl mr-4">{icon}</div>
			<div>
				<h4 className="font-semibold text-lg mb-1">{title}</h4>
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
				<div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">{name.charAt(0)}</div>
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

const opportunities = [
	{
		id: "community-organizer",
		title: "Community Organizer",
		description: "Lead local initiatives and bring Nepalis together in your city",
		icon: "🎪",
		color: "bg-blue-500",
		gradient: "from-blue-400 to-blue-600",
		features: ["Organize local events and meetups", "Build community connections", "Represent RSP values locally"],
	},
	{
		id: "digital-activist",
		title: "Digital Activist",
		description: "Amplify our message through social media and online campaigns",
		icon: "📱",
		color: "bg-purple-500",
		gradient: "from-purple-400 to-purple-600",
		features: ["Manage social media presence", "Create engaging content", "Drive online engagement"],
	},
	{
		id: "policy-contributor",
		title: "Policy Contributor",
		description: "Help shape RSP's policies and strategic direction",
		icon: "📋",
		color: "bg-indigo-500",
		gradient: "from-indigo-400 to-indigo-600",
		features: ["Research policy issues", "Contribute to discussions", "Provide expert insights"],
	},
	{
		id: "fundraising-team",
		title: "Fundraising Team",
		description: "Support our mission through creative fundraising initiatives",
		icon: "💰",
		color: "bg-green-500",
		gradient: "from-green-400 to-green-600",
		features: ["Plan fundraising events", "Build donor relationships", "Manage campaigns"],
	},
	{
		id: "youth-ambassador",
		title: "Youth Ambassador",
		description: "Engage young Nepalis and drive youth participation",
		icon: "🎓",
		color: "bg-orange-500",
		gradient: "from-orange-400 to-orange-600",
		features: ["Connect with youth networks", "Organize campus activities", "Lead youth initiatives"],
	},
	{
		id: "creative-team",
		title: "Creative Team",
		description: "Design visual content and creative materials",
		icon: "🎨",
		color: "bg-pink-500",
		gradient: "from-pink-400 to-pink-600",
		features: ["Create graphics and videos", "Design campaign materials", "Manage visual identity"],
	},
];

const testimonials = [
	{
		name: "Prabin Sharma",
		role: "Community Organizer",
		location: "Oslo",
		quote: "Being part of RSP Norway has given me a platform to contribute meaningfully to Nepal's future while staying connected to my roots.",
	},
	// {
	// 		       {opportunities.map((opp, index) => (
	// 			       <OpportunityCard key={index} {...opp} index={index} isHovered={hoveredCard === index} onHover={() => setHoveredCard(index)} onLeave={() => setHoveredCard(null)} />
	// 		       ))}
	// 	quote: "The energy and commitment of RSP members inspire me every day. Together, we're creating real change for Nepal.",
	// },
	{
		name: "Rajesh Thapa",
		role: "Digital Activist",
		location: "Trondheim",
		quote: "RSP gives me the opportunity to use my skills for something bigger than myself. It's about building the Nepal we all dream of.",
	},
];
