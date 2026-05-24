import SendMessagesClient from "./SendMessagesClient";

export const metadata = {
	title: "Send Messages | PNSB-Norway Admin",
	description: "Send messages to PNSB-Norway members",
};

export default async function SendMessagesPage() {
	return <SendMessagesClient />;
}
