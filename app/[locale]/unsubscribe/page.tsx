import { Metadata } from 'next';
import UnsubscribeClient from './UnsubscribeClient';

export const metadata: Metadata = {
	title: 'Unsubscribe | PNSB-Norway',
	description: 'Manage your email preferences',
};

export default async function UnsubscribePage({
	searchParams,
}: {
	searchParams: Promise<{ email?: string; token?: string }>;
}) {
	const { email } = await searchParams;
	return <UnsubscribeClient email={email} />;
}
