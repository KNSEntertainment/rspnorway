import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function HomeVideo() {
	return (
		<div className="flex items-center justify-center">
			<ReactPlayer url="https://www.youtube.com/watch?v=zszbr8MptTA" controls width="100%" height="400px" />
		</div>
	);
}
