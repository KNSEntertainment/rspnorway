import SendMessagesClient from "@/app/[locale]/dashboard/send-message/SendMessagesClient";

export const metadata = {
	title: "Send Message | Executive Portal",
	description: "Send messages to executive members individually or in bulk",
};

export default function ProfileSendMessagePage() {
	return <SendMessagesClient />;
}
