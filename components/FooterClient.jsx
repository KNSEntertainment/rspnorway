// "use client";
// import { MapPin, Mail, Phone, Facebook, Instagram } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";

// export default function FooterClient({ settings, t }) {
// 	return (
// 		<footer className="bg-gradient-to-t to-blue-50 from-transparent text-black pt-12 pb-8">
// 			{/* Main Footer Content */}
// 			<div className="container mx-auto px-4">
// 				{/* Four Column Layout */}
// 				<div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-6">
// 					{/* About Column */}
// 					<div className="space-y-4">
// 						<h3 className="text-xl font-semibold relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-brand">{t.about_us}</h3>
// 						<p className="leading-relaxed">{t.about_description}</p>
// 					</div>
// 					{/* Logo and Tagline */}
// 					<div className="flex flex-col w-full justify-center">
// 						<div className="flex flex-col w-full justify-center items-start md:items-center">
// 							<Image src={settings?.[0]?.companyLogo || "/rsp-norway-logo.png"} alt={t.logo_alt} width={100} height={100} className="w-24 object-cover mb-4" />
// 							<h2 className="text-2xl font-bold text-center">{t.logo_head}</h2>
// 							<p className="text-center max-w-md">{t.tagline}</p>
// 						</div>
// 					</div>

// 					{/* Contact Column */}
// 					<div className="space-y-8">
// 						<h3 className="text-xl font-semibold relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-brand">{t.contact_details}</h3>
// 						<div className="space-y-3">
// 							<div className="flex items-start space-x-3 group">
// 								<MapPin className="h-5 w-5 text-brand mt-1 flex-shrink-0 group-hover:text-black" />
// 								<p className=" hover:text-brand transition-colors">{t.address}</p>
// 							</div>

// 							<div className="flex items-center space-x-3 group">
// 								<Mail className="h-5 w-5 text-brand flex-shrink-0 group-hover:text-black" />
// 								<a href={`mailto:${settings?.[0]?.email}`} className=" hover:text-brand transition-colors">
// 									{settings?.[0]?.email}
// 								</a>
// 							</div>

// 							<div className="flex items-center space-x-3 group">
// 								<Phone className="h-5 w-5 text-brand flex-shrink-0 group-hover:text-black" />
// 								<a href="#" className=" hover:text-brand transition-colors">
// 									{t.phone}
// 								</a>
// 							</div>
// 							<div className="flex items-center space-x-3 group">
// 								<Facebook className="h-5 w-5 text-brand flex-shrink-0 group-hover:text-black" />
// 								<a href={settings?.[0]?.facebook} target="_blank" rel="noopener noreferrer" className=" hover:text-brand transition-colors underline" aria-label="Facebook">
// 									{t.facebook}
// 								</a>
// 							</div>
// 							<div className="flex items-center space-x-3 group">
// 								<Instagram className="h-5 w-5 text-brand flex-shrink-0 group-hover:text-black" />
// 								<a href={settings?.[0]?.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brand group-hover:text-brand transition-colors underline" aria-label="Instagram">
// 									{t.instagram}
// 								</a>
// 							</div>
// 						</div>
// 					</div>
// 				</div>

// 				{/* Links Row */}
// 				<nav className=" flex flex-col md:flex-row md:justify-between border-t border-neutral-200 pt-1">
// 					<ul className="flex space-x-4 justify-between mb-4 md:mb-0">
// 						<li className="text-neutral-500 hover:text-brand transition-colors text-sm">
// 							<Link href="/en/terms-and-conditions">{t.terms}</Link>
// 						</li>
// 						<li className="text-neutral-500 hover:text-brand transition-colors text-sm">
// 							<Link href="/en/privacy-policy">{t.privacy}</Link>
// 						</li>
// 					</ul>
// 					<div className="text-neutral-500 text-sm">{t.copyright || `© ${new Date().getFullYear()} RSP Norway. All rights reserved.`}</div>
// 					<div className="text-neutral-500 text-sm">
// 						<span>{t.developed_by}</span>
// 						<a href="https://harisanjel.com.np" target="_blank" rel="noopener noreferrer" className="font-semibold ml-1">
// 							{t.developer}
// 						</a>
// 					</div>
// 				</nav>
// 			</div>
// 		</footer>
// 	);
// }

"use client";
import { MapPin, Mail, Phone, Facebook, Instagram } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function FooterClient({ settings, t }) {
	return (
		<footer className="bg-gradient-to-b from-gray-50 to-white text-neutral-800 pt-12 pb-6">
			<div className="container mx-auto px-4">
				{/* Logo Section - Mobile First */}
				<div className="flex flex-col items-center text-center mb-10 md:hidden">
					<Image src={settings?.[0]?.companyLogo || "/rsp-norway-logo.png"} alt={t.logo_alt} width={100} height={100} className="w-20 h-20 object-contain mb-4" />
					<h2 className="text-xl font-bold text-neutral-900 mb-2">{t.logo_head}</h2>
					<p className="text-sm text-neutral-600 max-w-xs leading-relaxed">{t.tagline}</p>
				</div>

				{/* Main Footer Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
					{/* About Column */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
							<span className="w-1 h-5 bg-brand rounded-full"></span>
							{t.about_us}
						</h3>
						<p className="text-sm text-neutral-600 leading-relaxed">{t.about_description}</p>
					</div>

					{/* Logo Column - Desktop Only */}
					<div className="hidden md:flex flex-col items-center justify-start text-center">
						<Image src={settings?.[0]?.companyLogo || "/rsp-norway-logo.png"} alt={t.logo_alt} width={100} height={100} className="w-24 h-24 object-contain mb-4" />
						<h2 className="text-2xl font-bold text-neutral-900 mb-2">{t.logo_head}</h2>
						<p className="text-sm text-neutral-600 max-w-md leading-relaxed">{t.tagline}</p>
					</div>

					{/* Contact Column */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
							<span className="w-1 h-5 bg-brand rounded-full"></span>
							{t.contact_details}
						</h3>
						<div className="space-y-3">
							{/* Address */}
							<div className="flex items-start gap-3 group">
								<MapPin className="h-4 w-4 text-brand mt-0.5 flex-shrink-0 transition-transform group-hover:scale-110" />
								<p className="text-sm text-neutral-600 leading-relaxed">{t.address}</p>
							</div>

							{/* Email */}
							<a href={`mailto:${settings?.[0]?.email}`} className="flex items-center gap-3 group hover:translate-x-1 transition-transform">
								<Mail className="h-4 w-4 text-brand flex-shrink-0 transition-transform group-hover:scale-110" />
								<span className="text-sm text-neutral-600 hover:text-brand transition-colors">{settings?.[0]?.email}</span>
							</a>

							{/* Phone */}
							<a href={`tel:${t.phone}`} className="flex items-center gap-3 group hover:translate-x-1 transition-transform">
								<Phone className="h-4 w-4 text-brand flex-shrink-0 transition-transform group-hover:scale-110" />
								<span className="text-sm text-neutral-600 hover:text-brand transition-colors">{t.phone}</span>
							</a>

							{/* Social Media */}
							<div className="pt-2 border-t border-neutral-200">
								<p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Follow Us</p>
								<div className="flex gap-4">
									{settings?.[0]?.facebook && (
										<a href={settings[0].facebook} target="_blank" rel="noopener noreferrer" className="group" aria-label="Facebook">
											<div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center group-hover:bg-brand transition-colors">
												<Facebook className="h-4 w-4 text-brand group-hover:text-white transition-colors" />
											</div>
										</a>
									)}
									{settings?.[0]?.instagram && (
										<a href={settings[0].instagram} target="_blank" rel="noopener noreferrer" className="group" aria-label="Instagram">
											<div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center group-hover:bg-brand transition-colors">
												<Instagram className="h-4 w-4 text-brand group-hover:text-white transition-colors" />
											</div>
										</a>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-neutral-200 pt-6 mt-8">
					{/* Links - Mobile Stacked, Desktop Row */}
					<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
						<nav className="flex flex-wrap gap-4 justify-center md:justify-start">
							<Link href="/en/terms-and-conditions" className="text-xs text-neutral-500 hover:text-brand transition-colors">
								{t.terms}
							</Link>
							<span className="text-neutral-300 hidden md:inline">•</span>
							<Link href="/en/privacy-policy" className="text-xs text-neutral-500 hover:text-brand transition-colors">
								{t.privacy}
							</Link>
						</nav>

						<div className="text-xs text-neutral-500 text-center md:text-right">{t.copyright || `© ${new Date().getFullYear()} RSP Norway. All rights reserved.`}</div>
					</div>

					{/* Developer Credit */}
					<div className="text-xs text-neutral-500 text-center md:text-right">
						<span>{t.developed_by} </span>
						<a href="https://harisanjel.com.np" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline transition-all">
							{t.developer}
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
