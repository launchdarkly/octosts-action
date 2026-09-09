import { getState, info, setFailed, warning } from "@actions/core";
import { Agent, fetch, setGlobalDispatcher } from "undici";
import { fetchWithRetry } from "../lib/fetch";

export async function postRun(): Promise<void> {
	try {
		const agent = new Agent();
		setGlobalDispatcher(agent);

		const token = getState("token");

		const rep = await fetchWithRetry("Revoke issued token", () =>
			fetch("https://api.github.com/installation/token", {
				method: "DELETE",
				headers: {
					authorization: `Bearer ${token}`,
					accept: "application/vnd.github+json",
				},
			}),
		);

		if (rep.status === 204) {
			info("Successfully deleted token");
		} else {
			return warning(
				`Failed to delete token: ${rep.status} ${rep.statusText}. Token will be automatically revoked after 8 hours.`,
			);
		}
	} catch (error) {
		return setFailed((error as Error).message);
	}
}
