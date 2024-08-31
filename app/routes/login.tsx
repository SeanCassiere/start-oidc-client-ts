import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { useAuth } from "react-oidc-context";

const setRedirectFn = createServerFn("POST", async (url: string) => {
	const useAppSession = await import("~/lib/session").then(
		(m) => m.useAppSession
	);
	const session = await useAppSession();
	await session.update((old) => ({ ...old, redirectUrl: url }));
	return;
});

export const Route = createFileRoute("/login")({
	component: Login,
	beforeLoad: ({ search }) => {
		return {
			redirectUrl: (search as any).redirect_url as string | undefined,
		};
	},
	loader: async ({ context }) => {
		await setRedirectFn(context.redirectUrl || "/");
	},
});

function Login() {
	const auth = useAuth();

	return (
		<div>
			<h1>Login</h1>
			<p>Log in here</p>
			<button
				className='px-2 py-1 bg-blue-500 text-white'
				onClick={() => {
					void auth.signinRedirect();
				}}
			>
				Sign in
			</button>
		</div>
	);
}
