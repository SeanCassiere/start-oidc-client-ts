import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";

const loaderFn = createServerFn("POST", async () => {
	const userAppSession = await import("~/lib/session").then(
		(m) => m.useAppSession
	);
	const session = await userAppSession();
	const redirectUrl = session.data.redirectUrl || "/";
	return redirectUrl;
});

export const Route = createFileRoute("/oidc-callback")({
	loader: async ({ context, location }) => {
		if (!location.searchStr) {
			throw redirect({ to: "/" });
		}

		const user = await context.userManager.signinCallback(location.href);
		if (user) {
			await context.userManager.storeUser(user);
		}
		const redirectUrl = await loaderFn();
		throw redirect({ to: redirectUrl });
	},
	component: () => <div>Hello /oidc-callback!</div>,
});
