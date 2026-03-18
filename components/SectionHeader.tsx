import React from "react";

interface SectionHeaderProps {
	heading: string;
	className?: string;
	underlineClassName?: string;
}

export default function SectionHeader({ heading, className = "", underlineClassName = "" }: SectionHeaderProps) {
	// const words = heading.split(" ");
	return (
		<div className="pt-8 md:pt-12 pb-4 md:pb-6">
			<div className="relative mx-auto max-w-3xl text-center">
				<div className="mx-auto mb-3 h-1 w-10 rounded-full bg-brand/70" />
				<h2 className={`text-2xl md:text-4xl text-center font-bold tracking-tight mb-2 md:mb-4 ${className}`}>
					<span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-green-400 bg-clip-text text-transparent">{heading}</span>
				</h2>
				<div className={`mx-auto mt-3 h-[3px] w-28 rounded-full bg-gradient-to-r from-blue-600 via-emerald-500 to-green-400 ${underlineClassName}`} />
				<div className="mx-auto mt-2 h-px w-36 bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
			</div>
		</div>
	);
}
