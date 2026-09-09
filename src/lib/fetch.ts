import { warning } from "@actions/core";

const MAX_RETRIES = 3;

export async function fetchWithRetry(
	label: string,
	fn: () => Promise<Response>,
): Promise<Response> {
	let lastError: unknown;
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			const response = await fn();
			if (response.ok || attempt === MAX_RETRIES) {
				return response;
			}
			const errorText = await response.text();
			warning(
				`${label} attempt ${attempt}/${MAX_RETRIES} failed with status ${response.status}: ${errorText}`,
			);
		} catch (error) {
			lastError = error;
			warning(
				`${label} attempt ${attempt}/${MAX_RETRIES} threw: ${(error as Error).message}`,
			);
			if (attempt === MAX_RETRIES) {
				throw lastError;
			}
		}
	}
	// Unreachable, but satisfies TypeScript
	throw lastError;
}
