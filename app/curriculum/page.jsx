import React from "react";

const curriculumData = {
	title: "Our Curriculum",
	introduction: "Our curriculum in Nepal focuses on early childhood development through interactive learning, play, and cultural engagement.",
	subjects: [
		{ name: "Language (Nepali & English)", description: "Basic alphabets, simple words, and storytelling." },
		{ name: "Mathematics", description: "Counting, shapes, and simple arithmetic." },
		{ name: "Science & Environment", description: "Nature, weather, and basic science concepts." },
		{ name: "Arts & Crafts", description: "Drawing, coloring, and creative projects." },
		{ name: "Physical Activities", description: "Yoga, basic exercises, and outdoor games." },
		{ name: "Moral Education & Culture", description: "Nepalese traditions, festivals, and ethical values." },
	],
	activities: ["Storytelling & Rhymes", "Interactive Learning Games", "Field Trips & Nature Walks", "Group Activities & Role Play", "Cultural Celebrations"],
};

const Curriculum = () => {
	return (
		<div className="container mx-auto pt-32 p-6 max-w-4xl">
			<h1 className="text-3xl font-bold text-center mb-6">{curriculumData.title}</h1>
			<p className="text-lg text-gray-700 mb-4">{curriculumData.introduction}</p>
			<div className="w-24 h-1 bg-[#0094da] mx-auto mb-6 md:mb-12 rounded-full"></div>

			<h2 className="text-2xl font-semibold mt-6 mb-4">Subjects</h2>
			<ul className="space-y-4">
				{curriculumData.subjects.map((subject, index) => (
					<li key={index} className="p-4 border rounded-lg shadow-sm">
						<h3 className="text-xl font-medium">{subject.name}</h3>
						<p className="text-gray-600">{subject.description}</p>
					</li>
				))}
			</ul>

			<h2 className="text-2xl font-semibold mt-6 mb-4">Activities</h2>
			<ul className="list-disc pl-6 space-y-2">
				{curriculumData.activities.map((activity, index) => (
					<li key={index} className="text-lg text-gray-700">
						{activity}
					</li>
				))}
			</ul>
		</div>
	);
};

export default Curriculum;
