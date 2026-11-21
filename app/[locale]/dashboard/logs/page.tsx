import { Metadata } from "next";
import LogsClient from "./LogsClient";

export const metadata: Metadata = {
	title: "Activity & Security Logs | PNSB-Norway Admin",
	description: "Monitor user logins, membership activities, page visits, and system audit logs.",
};

export default function LogsPage() {
	return <LogsClient />;
}
