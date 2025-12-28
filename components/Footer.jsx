"use client";
import { Facebook, Instagram, MapPin, Mail, Phone } from "lucide-react";
import useFetchData from "@/hooks/useFetchData";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
	const { data: settings, loading } = useFetchData("/api/settings", "settings");

	if (loading) return <p>Loading...</p>;

	return (
		<footer className="bg-gradient-to-b to-blue-50 from-transparent text-black py-8">
			{/* Main Footer Content */}
			<div className="container mx-auto px-6">
				{/* Logo and Tagline */}
				<div className="flex flex-col items-center mb-12">
					<div className=" shadow-lg mb-4">
						<Image src={settings?.[0]?.companyLogo || "/magicchalklogo.png"} alt="Event Experience" width={100} height={100} className="rounded-lg shadow-xl w-[150px] h-auto object-cover" />
					</div>
					<h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{settings?.[0]?.name}</h2>
					<p className="text-center max-w-md">Together we can</p>
				</div>

				{/* Three Column Layout */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
					{/* About Column */}
					<div className="space-y-4">
						<h3 className="text-xl font-semibold relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#0094da]">About Us</h3>
						<p className="leading-relaxed">राष्ट्रिय स्वतन्त्र पार्टी (रास्वपा) सबै नेपालीको समतामूलक उन्नतिप्रति कटिवद्ध सामाजिक न्यायसहितको उदार अर्थतन्त्रमा विश्वास गर्ने बहुलवादी लोकतान्त्रिक पार्टी हो। यसको ध्येय वैयक्तिक स्वतन्त्रता र मौलिक हकको प्रत्याभूतिपूर्वक पूर्ण लोकतान्त्रिक गणतन्त्रात्मक शासन प्रणाली भित्र विधिमा आधारित जवाफदेहीपूर्ण असल शासन मार्फत समन्यायिक समावेशी समाज निर्माण गर्नु हो।</p>
					</div>

					{/* Social Links Column */}
					<div className="space-y-4">
						<h3 className="text-xl font-semibold relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#0094da]">Follow Us</h3>
						<div className="flex space-x-3">
							<a href={settings?.[0]?.facebook} target="_blank" className="bg-gray-100 hover:bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300">
								<Facebook className="h-5 w-5" />
							</a>
							<a href={settings?.[0]?.instagram} target="_blank" className="bg-gray-100 hover:bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300">
								<Instagram className="h-5 w-5" />
							</a>
						</div>
					</div>

					{/* Contact Column */}
					<div className="space-y-4">
						<h3 className="text-xl font-semibold relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#0094da]">Contact Details</h3>
						<div className="space-y-3">
							<div className="flex items-start space-x-3">
								<MapPin className="h-5 w-5 text-[#0094da] mt-1 flex-shrink-0" />
								<p className="">{settings?.[0]?.address}</p>
							</div>

							<div className="flex items-center space-x-3">
								<Mail className="h-5 w-5 text-[#0094da] flex-shrink-0" />
								<a href={`mailto:${settings?.[0]?.email}`} className=" hover:text-[#0094da] transition-colors">
									{settings?.[0]?.email}
								</a>
							</div>

							<div className="flex items-center space-x-3">
								<Phone className="h-5 w-5 text-[#0094da] flex-shrink-0" />
								<a href={`tel:${settings?.[0]?.phone}`} className=" hover:text-[#0094da] transition-colors">
									{settings?.[0]?.phone}
								</a>
							</div>
						</div>
					</div>
				</div>

				{/* Links Row */}
				<div className="pt-2 md:pt-8 border-t border-gray-800">
					<nav className="mb-2 md:mb-4">
						<ul className="flex flex-wrap gap-x-8 gap-y-3 justify-center">
							<li className="text-gray-400 hover:text-black transition-colors text-sm">
								<Link href="#">Terms And Conditions</Link>
							</li>
							<li className="text-gray-400 hover:text-black transition-colors text-sm">
								<Link href="#">Privacy Policy</Link>
							</li>
						</ul>
					</nav>

					{/* Copyright */}
					<div className="text-center text-gray-500 text-sm">&copy; {new Date().getFullYear()} RSP Norway. All rights reserved.</div>
				</div>
			</div>
		</footer>
	);
}
