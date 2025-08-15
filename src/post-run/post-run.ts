import * as core from "@actions/core";
import { Agent, fetch, setGlobalDispatcher } from "undici";

export async function postRun(): Promise<void> {
	try {
		const agent = new Agent({ allowH2: true });
		setGlobalDispatcher(agent);

		const token = core.getState("token");

		const rep = await fetch("https://api.github.com/installation/token", {
			method: "DELETE",
			headers: {
				authorization: `Bearer ${token}`,
				accept: "application/vnd.github+json",
			},
		});

		if (rep.status === 204) {
			core.info("Successfully deleted token");
		} else {
			return core.setFailed(
				`Failed to delete token: ${rep.status} ${rep.statusText}`,
			);
		}
	} catch (error) {
		return core.setFailed((error as Error).message);
	}
}
