"use client";
import Image from "next/image";
import React from "react";
import { useRouter, useParams } from "next/navigation";

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

const ProgramDetails = () => {
	const router = useRouter();
	const params = useParams();
	const programId = params.programId as string;

	const currentProgram = programs.find((p) => p.id === programId);
	const otherPrograms = programs.filter((p) => p.id !== programId);

	if (!currentProgram) {
		return (
			<div className="container mx-auto pt-32 p-6 text-center">
				<h1 className="text-2xl font-bold text-gray-800 mb-4">Program Not Found</h1>
				<button onClick={() => router.push("/programs")} className="bg-[#0094da] hover:bg-[#0094da] text-white px-6 py-2 rounded-md">
					Back to Programs
				</button>
			</div>
		);
	}

	const handleProgramClick = (programId: string) => {
		router.push(`/programs/${programId}`);
	};

	return (
		<div className="container mx-auto pt-32 p-6 max-w-7xl">
			{/* Back Button */}
			<button onClick={() => router.push("/programs")} className="flex items-center text-[#0094da] hover:text-[#0094da] mb-8 font-medium">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
				</svg>
				Back to Programs
			</button>

			<div className="grid lg:grid-cols-4 gap-8">
				{/* Main Content - Left Side (3/4 width) */}
				<div className="lg:col-span-3">
					{/* Header Section */}
					<div className={`${currentProgram.color} rounded-lg p-8 mb-8`}>
						<div className="flex flex-col md:flex-row items-center gap-8">
							<div className="w-full md:w-1/3">
								<Image src={currentProgram.image} alt={currentProgram.title} width={300} height={300} className="w-full h-64 object-cover rounded-lg shadow-md" />
							</div>
							<div className="w-full md:w-2/3">
								<h1 className="text-3xl font-bold text-gray-800 mb-4">{currentProgram.title}</h1>
								<div className="inline-block bg-[#0094da] text-white rounded-md px-4 py-2 mb-4 font-medium">Age Group: {currentProgram.ageGroup}</div>
								<p className="text-gray-700 text-lg leading-relaxed">{currentProgram.description}</p>
							</div>
						</div>
					</div>

					{/* Detailed Description */}
					<div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">Program Overview</h2>
						<p className="text-gray-700 leading-relaxed text-lg">{currentProgram.detailedDescription}</p>
					</div>

					{/* Curriculum */}
					<div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 mb-6">Curriculum Highlights</h2>
						<div className="grid md:grid-cols-2 gap-4">
							{currentProgram.curriculum.map((item, index) => (
								<div key={index} className="flex items-start">
									<div className="w-3 h-3 bg-[#0094da] rounded-full mt-2 mr-3 flex-shrink-0"></div>
									<span className="text-gray-700">{item}</span>
								</div>
							))}
						</div>
					</div>

					{/* Daily Schedule */}
					<div className="bg-white rounded-lg shadow-sm border p-8">
						<h2 className="text-2xl font-semibold text-gray-800 mb-6">Daily Schedule</h2>
						<div className="space-y-3">
							{currentProgram.dailySchedule.map((schedule, index) => (
								<div key={index} className="flex items-center border-l-4 border-[#0094da] pl-4 py-2 bg-gray-50 rounded-r">
									<span className="text-gray-700">{schedule}</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Sidebar - Right Side (1/4 width) */}
				<div className="lg:col-span-1">
					<div className="sticky top-8">
						<h3 className="text-xl font-semibold text-gray-800 mb-6">Other Programs</h3>
						<div className="space-y-6">
							{otherPrograms.map((program, index) => (
								<div key={index} className={`${program.color} rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1`} onClick={() => handleProgramClick(program.id)}>
									<Image src={program.image} alt={program.title} width={200} height={150} className="w-full h-32 object-cover rounded-lg mb-3" />
									<h4 className="text-lg font-semibold text-gray-800 mb-2">{program.title}</h4>
									<div className="inline-block bg-[#0094da] text-white rounded-md px-2 py-1 mb-2 text-xs font-medium">{program.ageGroup}</div>
									<p className="text-gray-600 text-sm leading-relaxed">{program.description}</p>
									<div className="flex items-center text-[#0094da] mt-3 text-sm font-medium">
										Learn More
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</div>
							))}
						</div>

						{/* Contact Section */}
						<div className="bg-[#0094da] rounded-lg p-6 mt-8">
							<h4 className="text-lg font-semibold text-gray-800 mb-4">Ready to Enroll?</h4>
							<p className="text-gray-600 text-sm mb-4">Contact us to learn more about our programs and schedule a visit.</p>
							<button className="w-full bg-[#0094da] hover:bg-[#0094da] text-white rounded-md px-4 py-2 font-medium transition-all duration-300">Contact Us</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProgramDetails;
