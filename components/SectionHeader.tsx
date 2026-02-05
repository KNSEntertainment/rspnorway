import React from "react";

interface SectionHeaderProps {
	heading: string;
	className?: string;
	underlineClassName?: string;
}

export default function SectionHeader({ heading, className = "", underlineClassName = "" }: SectionHeaderProps) {
	const words = heading.split(" ");
	return (
		<div className="pt-12">
			<h2 className={`text-2xl md:text-3xl text-center font-bold mb-2 md:mb-6 ${className}`}>
				{words[0]} <span className="mx-auto text-brand">{words.slice(1).join(" ")}</span>
			</h2>
			<div className={`w-24 h-1 mx-auto bg-brand mb-8 rounded-full ${underlineClassName}`}></div>
		</div>
	);
}
