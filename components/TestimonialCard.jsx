import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote, MapPin } from "lucide-react";

const TestimonialCard = ({ testimonial }) => {
	return (
		<Card className="max-w-xl bg-white hover:shadow-lg transition-shadow duration-300 flex-shrink-0 w-3/4 md:w-full md:gap-4 snap-center">
			<CardContent className="p-6">
				{/* Quote Icon Accent */}
				<div className="relative">
					<Quote className="absolute -top-1 -left-2 rotate-180 w-8 h-8 text-yellow-400/50" />
				</div>

				{/* Main Quote Content */}
				<div className="mb-6 pl-6">
					{/* Testimonial Text */}
					<p className="text-gray-700 text-lg leading-relaxed relative">{testimonial.audiencetestimony}</p>
				</div>

				{/* Divider */}
				<div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6" />

				{/* Author Section */}
				<div className="flex items-start justify-between">
					<div className="flex items-center">
						{/* Avatar with Border */}
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm opacity-50" />
							<Avatar className="h-8 w-8 sm:h-12 sm:w-12 border-2 border-white relative">
								<AvatarImage src={testimonial.audienceimage} alt={testimonial.audiencename || "alt"} className="object-cover" />
								<AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-slate-200">N/A</AvatarFallback>
							</Avatar>
						</div>

						{/* Author Details */}
						<div className="ml-4">
							<p className="font-semibold text-sm sm:text-md text-gray-900">{testimonial.audiencename}</p>
							<div className="flex items-center mt-1 text-sm text-gray-600">
								<MapPin className="w-3 h-3 mr-1" />
								<span>{testimonial.audienceaddress}</span>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default TestimonialCard;
