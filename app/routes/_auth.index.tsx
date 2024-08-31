import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";

export const Route = createFileRoute("/_auth/")({
	component: Home,
	meta: () => [{ title: "Index page" }],
});

function Home() {
	const auth = useAuth();
	const user = auth.user || null;
	return (
		<div className='px-2'>
			<h1 className='text-2xl'>Index route</h1>
			<p>Foo</p>
			<pre className='overflow-x-auto'>{JSON.stringify(user, null, 2)}</pre>
		</div>
	);
}
