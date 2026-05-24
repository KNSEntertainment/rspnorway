
import MessagesClient from "./MessagesClient";

export const metadata = {
	title: "Messages | PNSB-Norway",
	description: "View and manage your messages",
};

export default async function MessagesPage() {
	return <MessagesClient />;
}
