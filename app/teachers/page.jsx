import React from "react";
import Image from "next/image";

const teachers = [
	{
		name: "Suneeta Shah",
		subject: "Language Arts",
		experience: "10 years",
		bio: "Passionate about making langauge fun and engaging for young learners.",
		image: "/sunita.jpeg",
	},
	{
		name: "Swostika Tuladhar",
		subject: "English",
		experience: "4 years",
		bio: "Dedicated to helping children develop strong language skills.",
		image: "/swostika.jpeg",
	},
	{
		name: "Anjali Karki",
		subject: "Arts & Crafts",
		experience: "6 years",
		bio: "Encourages creativity through various artistic activities.",
		image: "/kiran.jpeg",
	},
	{
		name: "Sita Sharma",
		subject: "Mathematics",
		experience: "10 years",
		bio: "Passionate about making numbers fun and engaging for young learners.",
		image: "/sunita.jpeg",
	},
	{
		name: "Rajesh Thapa",
		subject: "English",
		experience: "8 years",
		bio: "Dedicated to helping children develop strong language skills.",
		image: "/swostika.jpeg",
	},
	{
		name: "Anjali Karki",
		subject: "Arts & Crafts",
		experience: "6 years",
		bio: "Encourages creativity through various artistic activities.",
		image: "/kiran.jpeg",
	},
];

const Teachers = () => {
	return (
		<div className="container mx-auto py-32 p-6 max-w-5xl min-h-screen">
			<h1 className="text-3xl font-bold text-center mb-8">Our Team</h1>
			<div className="w-24 h-1 bg-[#0094da] mx-auto mb-6 md:mb-12 rounded-full"></div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{teachers.map((teacher, index) => (
					<div key={index} className="relative group overflow-hidden rounded-xl shadow-lg bg-white cursor-pointer">
						<Image src={teacher.image} alt={teacher.name} width={300} height={300} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" />
						<div className="p-4 text-center">
							<h3 className="text-xl font-semibold">{teacher.name}</h3>
							<p className="text-gray-600">{teacher.subject}</p>
						</div>
						<div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
							<h3 className="text-xl font-semibold">{teacher.name}</h3>
							<p className="text-sm">
								{teacher.subject} - {teacher.experience} experience
							</p>
							<p className="mt-2 text-center text-sm">{teacher.bio}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Teachers;
