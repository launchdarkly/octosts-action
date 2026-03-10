import * as crypto from "node:crypto";
import {
	debug,
	info,
	saveState,
	setFailed,
	setOutput,
	setSecret,
	warning,
} from "@actions/core";
import { exec } from "@actions/exec";
import { Agent, fetch, setGlobalDispatcher } from "undici";
import { getActionsEnvVars, getInputs } from "./inputs";

const MAX_RETRIES = 3;

interface GHRep {
	value: string;
}

interface OctoStsRep {
	token?: string;
	message?: string;
}

async function fetchWithRetry(
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

export async function run(): Promise<void> {
	try {
		const agent = new Agent({ allowH2: true });
		setGlobalDispatcher(agent);
		const { actionsToken, actionsUrl } = getActionsEnvVars();
		const { domain, scope, identity, configureGit } = getInputs();

		const ghRep = await fetchWithRetry("GitHub Actions OIDC token fetch", () =>
			fetch(`${actionsUrl}&audience=${domain}`, {
				headers: {
					authorization: `Bearer ${actionsToken}`,
				},
			}),
		);
		if (!ghRep.ok) {
			const errorText = await ghRep.text();
			return setFailed(`Failed to get installation token: ${errorText}`);
		}

		const ghRepJson = (await ghRep.json()) as GHRep;
		if (ghRepJson.value === null) {
			return setFailed(`Failed to get installation token: body was null`);
		}
		setSecret(ghRepJson.value);
		debug(JSON.stringify(ghRepJson));

		const scopes = [scope];
		const scopesParam = scopes.join(",");

		debug(`Creating token for ${identity} using ${scope} against ${domain}`);
		const octoStsRep = await fetchWithRetry("OctoSTS token fetch", () =>
			fetch(
				`https://${domain}/sts/exchange?scope=${scope}&scopes=${scopesParam}&identity=${identity}`,
				{
					headers: {
						authorization: `Bearer ${ghRepJson.value}`,
					},
				},
			),
		);

		if (!octoStsRep.ok) {
			const errorText = await octoStsRep.text();
			return setFailed(`Failed to fetch from OctoSTS: ${errorText}`);
		}
		const octoStsRepJson = (await octoStsRep.json()) as OctoStsRep;

		if (!octoStsRepJson?.token) {
			return setFailed(octoStsRepJson?.message as string);
		}

		const tokHash = crypto
			.createHash("sha256")
			.update(octoStsRepJson?.token as string)
			.digest("hex");

		setSecret(octoStsRepJson?.token as string);
		setOutput("token", octoStsRepJson?.token);
		saveState("token", octoStsRepJson?.token);
		info(`Created token with hash: ${tokHash}`);

		if (configureGit) {
			const b64Token = Buffer.from(
				`x-access-token:${octoStsRepJson?.token as string}`,
			).toString("base64");
			try {
				await exec("git", [
					"config",
					"--global",
					"--unset-all",
					"http.https://github.com/.extraheader",
					"^AUTHORIZATION: basic",
				]);
			} catch (_error) {
				// Ignore the error if the config key doesn't exist
				debug("No existing extraheader to unset");
			}

			// Set the token as a git credential
			await exec("git", [
				"config",
				"--global",
				"http.https://github.com/.extraheader",
				`AUTHORIZATION: basic ${b64Token}`,
			]);
			await exec("git", [
				"config",
				"--global",
				"url.https://github.com/.insteadOf",
				`git@github.com`,
			]);

			await exec("git", ["config", "--global", "user.name", "octosts"]);
			await exec("git", [
				"config",
				"--global",
				"user.email",
				"octosts@users.noreply.github.com",
			]);
		}

		return;
	} catch (error) {
		debug(JSON.stringify(error));
		return setFailed((error as Error).message);
	}
}
