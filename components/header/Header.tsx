import HeaderScrollWrapper from "@/components/header/HeaderScrollWrapper";
import TopBar from "@/components/header/TopBar";
import MainHeader from "@/components/header/MainHeader";

export default function Header() {
	return (
		<HeaderScrollWrapper>
			<TopBar />
			<MainHeader />
		</HeaderScrollWrapper>
	);
}
