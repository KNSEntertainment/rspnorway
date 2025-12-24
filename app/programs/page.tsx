"use client";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

const programs = [
	{
		id: "early-childhood",
		title: "Early Childhood Development",
		ageGroup: "2-4 years",
		description: "Focuses on sensory activities, motor skills, and basic socialization.",
		detailedDescription: "Our Early Childhood Development program is specifically designed for children aged 2-4 years, focusing on crucial developmental milestones during these formative years. Through carefully structured sensory activities, we help children explore their environment safely while building essential motor skills. The program emphasizes basic socialization skills, teaching children how to interact with peers, share, and communicate effectively. Our experienced educators use play-based learning approaches that encourage curiosity, creativity, and emotional development. Daily activities include sensory play, music and movement, simple arts and crafts, and structured outdoor time that promotes physical development and social interaction.",
		curriculum: ["Sensory exploration and development", "Fine and gross motor skill building", "Basic communication and language skills", "Social interaction and sharing", "Emotional regulation and self-expression", "Creative arts and music appreciation"],
		dailySchedule: ["8:00 AM - Arrival and free play", "9:00 AM - Circle time and songs", "9:30 AM - Sensory activities", "10:30 AM - Snack time", "11:00 AM - Outdoor play", "12:00 PM - Lunch", "1:00 PM - Quiet time/nap", "2:30 PM - Creative activities", "3:30 PM - Story time and departure"],
		image: "/ec.avif",
		color: "bg-blue-50",
	},
	{
		id: "preschool-learning",
		title: "Preschool Learning",
		ageGroup: "4-5 years",
		description: "Introduces letters, numbers, storytelling, and creative play.",
		detailedDescription: "The Preschool Learning program bridges the gap between early childhood and formal education, introducing children aged 4-5 years to foundational academic concepts through engaging, age-appropriate activities. Our curriculum introduces letters, numbers, and basic literacy skills while maintaining a strong emphasis on creative play and imagination. Children develop pre-reading skills through storytelling, phonics games, and interactive reading sessions. Mathematical concepts are introduced through hands-on activities, counting games, and pattern recognition. The program also focuses on developing independence, following instructions, and preparing children for more structured learning environments.",
		curriculum: ["Letter recognition and phonics", "Number concepts and basic math", "Storytelling and listening skills", "Creative arts and dramatic play", "Science exploration and discovery", "Social skills and cooperation"],
		dailySchedule: ["8:00 AM - Arrival and morning activities", "9:00 AM - Circle time and calendar", "9:30 AM - Literacy activities", "10:30 AM - Snack and social time", "11:00 AM - Math and science exploration", "12:00 PM - Lunch", "1:00 PM - Rest time", "2:00 PM - Creative arts and crafts", "3:00 PM - Story time and free play", "4:00 PM - Departure"],
		image: "/ps.avif",
		color: "bg-[#0094da]",
	},
	{
		id: "RSP Norway-readiness",
		title: "RSP Norway Readiness",
		ageGroup: "5-6 years",
		description: "Prepares children for primary school with structured learning and problem-solving skills.",
		detailedDescription: "Our RSP Norway Readiness program is specifically designed to ensure children aged 5-6 years are fully prepared for the transition to primary school. This comprehensive program combines structured learning with problem-solving activities that develop critical thinking skills. Children learn to follow multi-step instructions, work independently, and collaborate effectively with peers. The curriculum includes advanced literacy skills, mathematical reasoning, and scientific inquiry. We focus heavily on developing executive function skills such as attention, working memory, and cognitive flexibility that are essential for academic success.",
		curriculum: ["Advanced reading and writing skills", "Mathematical reasoning and problem solving", "Scientific inquiry and experimentation", "Critical thinking and logic", "Independence and self-management", "Collaborative learning and teamwork"],
		dailySchedule: ["8:00 AM - Arrival and independent reading", "9:00 AM - Morning meeting and planning", "9:30 AM - Literacy workshop", "10:45 AM - Math exploration", "11:30 AM - Outdoor education", "12:30 PM - Lunch", "1:30 PM - Science and discovery", "2:30 PM - Project-based learning", "3:30 PM - Reflection and dismissal"],
		image: "/kg.avif",
		color: "bg-indigo-50",
	},
];

const ViewPrograms = () => {
	const router = useRouter();

	const handleLearnMore = (programId: string) => {
		router.push(`/programs/${programId}`);
	};

	return (
		<div className="container mx-auto pt-32 p-6 max-w-7xl">
			<h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Our Programs</h1>
			<div className="w-24 h-1 bg-[#0094da] mx-auto mb-6 md:mb-12 rounded-full"></div>
			<div className="mt-16">
				{programs.map((program, index) => (
					<div key={index} className={`flex flex-col lg:flex-row items-center mb-16 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
						{/* Image container */}
						<div className={`w-full lg:w-1/2 p-4 ${program.color} rounded-lg transition-all duration-300 hover:shadow-lg`}>
							<div className="relative">
								<Image src={program.image} alt={program.title} width={400} height={400} className="w-full h-96 object-cover rounded-lg shadow-md" />
							</div>
						</div>
						{/* Content container */}
						<div className="w-full lg:w-1/2 p-8 md:p-12">
							<h3 className="text-2xl font-semibold mb-3 text-gray-800">{program.title}</h3>
							<div className="inline-block bg-[#0094da] text-white rounded-md px-4 py-1 mb-4 font-medium text-sm">Age Group: {program.ageGroup}</div>
							<p className="text-gray-700 text-lg leading-relaxed bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#0094da]">{program.description}</p>
							{/* Button */}
							<button onClick={() => handleLearnMore(program.id)} className="mt-4 bg-[#0094da] hover:bg-[#0094da] text-white rounded-md px-5 py-2 font-medium transition-all duration-300 flex items-center">
								Learn More
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ViewPrograms;
