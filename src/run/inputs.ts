import { getBooleanInput, getInput, setFailed } from "@actions/core";

type Inputs = {
	domain: string;
	scope: string;
	identity: string;
	configureGit: boolean;
};

export function getInputs(): Inputs {
	const domain = getInput("domain");
	const scope = getInput("scope");
	const identity = getInput("identity");
	const configureGit = getBooleanInput("configure-git");

	return {
		domain,
		scope,
		identity,
		configureGit,
	};
}

export function getActionsEnvVars(): {
	actionsToken: string;
	actionsUrl: string;
} {
	const actionsToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
	const actionsUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;

	if (!actionsToken || !actionsUrl) {
		setFailed(
			"Missing required environment variables - have you set 'id-token: write' in your workflow?",
		);
	}

	return {
		actionsToken: actionsToken as string,
		actionsUrl: actionsUrl as string,
	};
}
