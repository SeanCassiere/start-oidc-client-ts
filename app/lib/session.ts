import { useSession } from "vinxi/http";
const password = process.env.COOKIE_PASSWORD;

interface SessionState {
	redirectUrl?: string;
	authAsyncStore?: Record<string, string | null>;
	authStateStore?: Record<string, string | null>;
}

export function useAppSession() {
	return useSession<SessionState>({
		password,
		name: "app-session",
	});
}
