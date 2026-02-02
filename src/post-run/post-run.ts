import { getState, info, setFailed } from "@actions/core";
import { Agent, fetch, setGlobalDispatcher } from "undici";

export async function postRun(): Promise<void> {
	try {
		const agent = new Agent({ allowH2: true });
		setGlobalDispatcher(agent);

		const token = getState("token");

		const rep = await fetch("https://api.github.com/installation/token", {
			method: "DELETE",
			headers: {
				authorization: `Bearer ${token}`,
				accept: "application/vnd.github+json",
			},
		});

		if (rep.status === 204) {
			info("Successfully deleted token");
		} else {
			return setFailed(
				`Failed to delete token: ${rep.status} ${rep.statusText}`,
			);
		}
	} catch (error) {
		return setFailed((error as Error).message);
	}
}
