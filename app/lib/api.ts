import { initClient, initContract, tsRestFetchApi } from "@ts-rest/core";
import { userManager } from "./oidc-client";
import { z } from "zod";
import { getPublicEnvVar } from "./env";

const c = initContract();

const contract = c.router({
	test: c.router({
		testAuth: {
			method: "GET",
			path: "/api/test",
			responses: {
				200: z.any(),
			},
		},
	}),
});

export const apiClient = initClient(contract, {
	baseUrl: getPublicEnvVar("API_URI"),
	baseHeaders: {},
	api: async (args) => {
		const user = await userManager.getUser();

		if (user) {
			const token = user.access_token || null;
			args.headers["Authorization"] = `Bearer ${token}`;
		}

		return tsRestFetchApi(args);
	},
});
