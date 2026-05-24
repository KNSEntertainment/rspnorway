import VerifyEmailClient from "./VerifyEmailClient";
import { getTranslations } from "next-intl/server";

export const metadata = {
	title: "Verify Email | PNSB-Norway",
	description: "Verify your email address to complete your registration",
};

export default async function VerifyEmailPage() {
	const t = await getTranslations("verifyEmail");

	const translations = {
		title: t("title"),
		subtitle: t("subtitle"),
		verifying: t("verifying"),
		success: t("success"),
		successMessage: t("successMessage"),
		error: t("error"),
		invalidToken: t("invalidToken"),
		expiredToken: t("expiredToken"),
		redirecting: t("redirecting"),
		goToLogin: t("goToLogin"),
		goToMembership: t("goToMembership"),
	};

	return <VerifyEmailClient translations={translations} />;
}
