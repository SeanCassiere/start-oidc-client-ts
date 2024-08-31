import {
	createFileRoute,
	Navigate,
	Outlet,
	redirect,
	useLocation,
	useRouter,
} from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";

export const Route = createFileRoute("/_auth")({
	component: Auth,
	loader: async ({ context, location }) => {
		const user = await context.userManager.getUser();

		// if user is expired, remove user and redirect to login
		if (user && user.expired) {
			await context.userManager.removeUser();
			throw redirect({ to: "/login", search: { redirect_url: location.href } });
		}

		// expires in 5 minutes
		if (
			typeof window !== "undefined" &&
			user &&
			user.expires_at &&
			user.expires_at - Date.now() < 5 * 60 * 1000
		) {
			await context.userManager.signinSilent();
		}

		return {
			userLoadPromise: user,
		};
	},
});

function Auth() {
	const userLoadPromise = Route.useLoaderData({
		select: (s) => s.userLoadPromise,
	});
	const location = useLocation();
	const auth = useAuth();
	const router = useRouter();

	return userLoadPromise ? (
		<>
			<ul className='px-2'>
				<li>
					<button
						onClick={() => {
							console.log("Remove user clicked");
							void auth.removeUser().then(router.invalidate);
						}}
					>
						Remove user
					</button>
				</li>
				<li>
					<button
						onClick={() => {
							console.log("Remove user clicked");
							void auth.signoutRedirect();
						}}
					>
						Sign out
					</button>
				</li>
			</ul>
			<Outlet />
		</>
	) : (
		<Navigate
			to='/login'
			search={{ redirect_url: location.href }}
			replace={true}
		/>
	);
}
