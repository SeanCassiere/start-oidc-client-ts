import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import type {
	AsyncStorage,
	OidcClientSettings,
	StateStore,
} from "oidc-client-ts";
import { createServerFn } from "@tanstack/start";

import { getPublicEnvVar } from "./env";

const asyncStoreLengthFn = createServerFn("GET", async (_): Promise<number> => {
	const useAppSession = await import("./session").then((m) => m.useAppSession);
	const session = await useAppSession();
	const store = session.data.authAsyncStore ?? {};
	return Object.getOwnPropertyNames(store).length;
});
const asyncStoreClearFn = createServerFn("POST", async (_): Promise<void> => {
	const useAppSession = await import("./session").then((m) => m.useAppSession);
	const session = await useAppSession();
	await session.update((old) => ({ ...old, authAsyncStore: {} }));
	return;
});
const asyncStoreGetItemFn = createServerFn(
	"GET",
	async (key: string): Promise<string | null> => {
		const useAppSession = await import("./session").then(
			(m) => m.useAppSession
		);
		const session = await useAppSession();
		const store = session.data.authAsyncStore ?? {};
		return store[key] ?? null;
	}
);
const asyncStoreKeyFn = createServerFn(
	"GET",
	async (index: number): Promise<string | null> => {
		const useAppSession = await import("./session").then(
			(m) => m.useAppSession
		);
		const session = await useAppSession();
		const store = session.data.authAsyncStore ?? {};
		return Object.getOwnPropertyNames(store)[index] ?? null;
	}
);
const asyncStoreRemoveItemFn = createServerFn(
	"POST",
	async (key: string): Promise<void> => {
		const useAppSession = await import("./session").then(
			(m) => m.useAppSession
		);
		const session = await useAppSession();
		await session.update((old) => {
			const authStore = { ...old.authAsyncStore };
			delete authStore[key];
			return { ...old, authAsyncStore: authStore };
		});
		return;
	}
);
const asyncStoreSetItemFn = createServerFn(
	"POST",
	async ({ key, value }: { key: string; value: string }): Promise<void> => {
		const useAppSession = await import("./session").then(
			(m) => m.useAppSession
		);
		const session = await useAppSession();
		await session.update((old) => {
			const authStore = { ...old.authAsyncStore };

			authStore[key] = value;

			return { ...old, authAsyncStore: authStore };
		});
		return;
	}
);

class CustomAsyncStorage implements AsyncStorage {
	public get length(): Promise<number> {
		return asyncStoreLengthFn();
	}

	clear(): Promise<void> {
		return asyncStoreClearFn();
	}
	getItem(key: string): Promise<string | null> {
		return asyncStoreGetItemFn(key);
	}
	key(index: number): Promise<string | null> {
		return asyncStoreKeyFn(index);
	}
	removeItem(key: string): Promise<void> {
		return asyncStoreRemoveItemFn(key);
	}
	setItem(key: string, value: string): Promise<void> {
		return asyncStoreSetItemFn({ key, value });
	}
}

const stateStoreSetItemFn = createServerFn(
	"POST",
	async ({ key, value }: { key: string; value: string }): Promise<void> => {
		const useAppSession = await import("./session").then(
			(m) => m.useAppSession
		);
		const session = await useAppSession();
		await session.update((old) => {
			const authStore = { ...old.authStateStore };

			authStore[key] = value;

			return { ...old, authStateStore: authStore };
		});
		return;
	}
);
const stateStoreGetItemFn = createServerFn(
	"GET",
	async (key: string): Promise<string | null> => {
		const useAppSession = await import("./session").then(
			(m) => m.useAppSession
		);
		const session = await useAppSession();
		const store = session.data.authStateStore ?? {};
		const value = store[key] ?? null;
		return value;
	}
);
const stateStoreRemoveItemFn = createServerFn(
	"POST",
	async (key: string): Promise<string | null> => {
		const useAppSession = await import("./session").then(
			(m) => m.useAppSession
		);
		const session = await useAppSession();
		let value: string | null = null;
		await session.update((old) => {
			const authStore = { ...old.authStateStore };
			value = authStore[key] || null;
			delete authStore[key];
			return { ...old, authStateStore: authStore };
		});
		return value;
	}
);
const stateStoreGetAllKeysFn = createServerFn(
	"GET",
	async (): Promise<string[]> => {
		const useAppSession = await import("./session").then(
			(m) => m.useAppSession
		);
		const session = await useAppSession();
		const store = session.data.authStateStore ?? {};
		return Object.getOwnPropertyNames(store);
	}
);

class CustomStateStore implements StateStore {
	set(key: string, value: string): Promise<void> {
		return stateStoreSetItemFn({ key, value });
	}
	get(key: string): Promise<string | null> {
		return stateStoreGetItemFn(key);
	}
	remove(key: string): Promise<string | null> {
		return stateStoreRemoveItemFn(key);
	}
	getAllKeys(): Promise<string[]> {
		return stateStoreGetAllKeysFn();
	}
}

const asyncStorage = new CustomAsyncStorage();
const userStore = new WebStorageStateStore({ store: asyncStorage });
const stateStore = new CustomStateStore();

const OIDC_AUTHORITY = getPublicEnvVar("AUTH_AUTHORITY");
const OIDC_CLIENT_ID = getPublicEnvVar("AUTH_CLIENT_ID");
const OIDC_REDIRECT_URI = getPublicEnvVar("AUTH_REDIRECT_URI");
const OIDC_SILENT_REDIRECT_URI = getPublicEnvVar("AUTH_SILENT_REDIRECT_URI");
const OIDC_POST_LOGOUT_REDIRECT_URI = getPublicEnvVar(
	"AUTH_POST_LOGOUT_REDIRECT_URI"
);

const oidcClientSettings: OidcClientSettings = {
	authority: OIDC_AUTHORITY,
	metadataUrl: `${OIDC_AUTHORITY}/.well-known/openid-configuration`,
	client_id: OIDC_CLIENT_ID,
	redirect_uri: OIDC_REDIRECT_URI,
	post_logout_redirect_uri: OIDC_POST_LOGOUT_REDIRECT_URI,
	response_type: "code",
	response_mode: "query" as const,
	// scope: "openid profile Api email",
	scope: "openid profile email",
	loadUserInfo: true,
};

export const userManager = new UserManager({
	...oidcClientSettings,
	silent_redirect_uri: OIDC_SILENT_REDIRECT_URI,
	automaticSilentRenew: true,
	monitorSession: true,
	userStore,
	stateStore,
});
