export function getPublicEnvVar(name: string): string {
	let value = process.env[`VITE_APP_${name}`];
	if (value) {
		return value;
	}
	value = import.meta.env[`VITE_APP_${name}`];
	if (value) {
		return value;
	}
	throw new Error(`Missing environment variable: VITE_APP_${name}`);
}

export function getServerEnvVar(name: string): string {
	const value = process.env[name];
	if (value) {
		return value;
	}
	throw new Error(`Missing environment variable: ${name}`);
}
