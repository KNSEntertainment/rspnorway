"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useEditor, EditorContent as TiptapEditorContent, Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface FeedbackEditorContentProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	isSettingContent: React.MutableRefObject<boolean>;
}

export default function FeedbackEditorContent({ value, onChange, placeholder, isSettingContent }: FeedbackEditorContentProps) {
	const t = useTranslations("eventFeedback");
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: false,
				bulletList: false,
				orderedList: false,
				listItem: false,
				blockquote: false,
				codeBlock: false,
				horizontalRule: false,
				strike: false,
				code: false,
			}),
			Placeholder.configure({
				placeholder: placeholder || "Share your feedback...",
			}),
		],
		content: value || "",
		onUpdate: ({ editor }) => {
			if (isSettingContent.current) return;
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: "prose prose-sm focus:outline-none w-full p-2 min-h-[120px]",
			},
		},
	});

	// Sync external value safely
	useEffect(() => {
		if (!editor) return;

		const current = editor.getHTML();
		if (value !== current) {
			isSettingContent.current = true;
			editor.commands.setContent(value || "", false);
			isSettingContent.current = false;
		}
	}, [value, editor, isSettingContent]);

	// Cleanup
	useEffect(() => {
		return () => {
			editor?.destroy();
		};
	}, [editor]);

	if (!editor) {
		return <div className="p-2 text-gray-400">{t("loadingEditor")}</div>;
	}

	return (
		<div className="border rounded overflow-hidden">
			<Toolbar editor={editor} />
			<TiptapEditorContent editor={editor} className="border-t" />
		</div>
	);
}

function Toolbar({ editor }: { editor: TiptapEditor }) {
	return (
		<div className="border-b p-2 flex flex-wrap gap-1 bg-light">
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={`w-8 h-8 rounded font-bold ${editor.isActive("bold") ? "bg-brand text-white" : "hover:bg-gray-200"}`}
			>
				B
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={`w-8 h-8 rounded italic ${editor.isActive("italic") ? "bg-brand text-white" : "hover:bg-gray-200"}`}
			>
				I
			</button>
		</div>
	);
}
