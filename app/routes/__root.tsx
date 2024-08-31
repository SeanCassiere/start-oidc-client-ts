import * as React from "react";
import { createRootRouteWithContext, Link } from "@tanstack/react-router";
import { Outlet, ScrollRestoration } from "@tanstack/react-router";
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start";
import appCss from "~/styles/app.css?url";

import type { QueryClient } from "@tanstack/react-query";
import type { UserManager } from "oidc-client-ts";

export interface RootRouteContext {
	queryClient: QueryClient;
	userManager: UserManager;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
	meta: () => [
		{
			charSet: "utf-8",
		},
		{
			name: "viewport",
			content: "width=device-width, initial-scale=1",
		},
		{
			title: "TanStack Start Starter",
		},
	],
	links: () => [{ rel: "stylesheet", href: appCss }],
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<Html>
			<Head>
				<Meta />
			</Head>
			<Body>
				<nav className='p-2'>
					<ul className='flex gap-2'>
						<li>
							<Link
								to='/'
								activeOptions={{
									exact: true,
									includeHash: false,
									includeSearch: false,
								}}
								activeProps={{ className: "underline" }}
							>
								Home
							</Link>
						</li>
						<li>
							<Link to='/about' activeProps={{ className: "underline" }}>
								About
							</Link>
						</li>
					</ul>
				</nav>
				{children}
				<ScrollRestoration />
				<Scripts />
			</Body>
		</Html>
	);
}
