import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { apiClient } from "~/lib/api";

const testAuthOptions = () =>
	queryOptions({
		queryKey: ["test-auth"],
		queryFn: async () => {
			return await apiClient.test
				.testAuth()
				.then((res) => ({ ...res, headers: null }));
		},
	});

export const Route = createFileRoute("/_auth/about")({
	component: About,
	meta: () => [{ title: "About page" }],
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(testAuthOptions());
	},
});

function About() {
	const query = useSuspenseQuery(testAuthOptions());
	return (
		<div className='px-2'>
			<h1 className='text-2xl'>About route</h1>
			<p>Bar</p>
			<pre>{JSON.stringify(query.data.body, null, 2)}</pre>
		</div>
	);
}
