import * as core from "@actions/core";

type Inputs = {
	domain: string;
	scope: string;
	identity: string;
	configureGit: boolean;
};

export function getInputs(): Inputs {
	const domain = core.getInput("domain");
	const scope = core.getInput("scope");
	const identity = core.getInput("identity");
	const configureGit = core.getBooleanInput("configure-git");

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
		core.setFailed(
			"Missing required environment variables - have you set 'id-token: write' in your workflow?",
		);
	}

	return {
		actionsToken: actionsToken as string,
		actionsUrl: actionsUrl as string,
	};
}
