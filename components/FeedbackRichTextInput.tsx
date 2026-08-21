"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

function EditorLoading() {
	const t = useTranslations("eventFeedback");
	return <div className="p-2 text-gray-400 border rounded">{t("loadingEditor")}</div>;
}

const FeedbackEditorContent = dynamic(() => import("./FeedbackEditorContent"), {
	ssr: false,
	loading: EditorLoading,
});

interface FeedbackRichTextInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export default function FeedbackRichTextInput({ value, onChange, placeholder }: FeedbackRichTextInputProps) {
	const isSettingContent = useRef(false);
	return <FeedbackEditorContent value={value} onChange={onChange} placeholder={placeholder} isSettingContent={isSettingContent} />;
}
