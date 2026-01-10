import Gallery from "@/components/Gallery";
import GlobalLoading from "@/components/GlobalLoading";
import React, { Suspense } from "react";

const page = () => {
	return (
		<Suspense fallback={<GlobalLoading />}>
			<Gallery />
		</Suspense>
	);
};
export default page;
