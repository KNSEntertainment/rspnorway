"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";

// Dynamic import for the entire editor content
const EditorContent = dynamic(() => import("./EditorContent"), {
	ssr: false,
	loading: () => <div className="p-2 text-gray-400">Loading editor...</div>
});

// ✅ Props type
interface EditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export default function Editor({ value, onChange, placeholder }: EditorProps) {
	const isSettingContent = useRef(false);

	return (
		<EditorContent
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			isSettingContent={isSettingContent}
		/>
	);
}
