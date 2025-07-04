import * as crypto from "node:crypto";
import * as core from "@actions/core"
import * as httm from "@actions/http-client"
import {getActionsEnvVars, getInputs} from "./inputs";

interface GHRep {
    value: string;
}

interface OctoStsRep {
    token?: string;
    message?: string;
}

export async function run(): Promise<void> {
    try {
        const {actionsToken, actionsUrl} = getActionsEnvVars();
        const { domain, scope, identity } = getInputs();

        const httpClient = new httm.HttpClient('octosts-action')

        const ghRep = await httpClient.getJson<GHRep>(
            `${actionsUrl}&audience=${domain}`, {
            authorization: `Bearer ${actionsToken}`,
        })
        if (ghRep.result?.value !== null) {
            core.setSecret(ghRep.result!.value)
        }
        core.debug(JSON.stringify(ghRep))

        const octoStsRep = await httpClient.getJson<OctoStsRep>(
            `https://${domain}/sts/exchange?scope${scope}&identity=${identity}`, {
            authorization: `Bearer ${ghRep.result?.value}`
        })

        if (!octoStsRep.result?.token) {
            core.setFailed(octoStsRep.result?.message as string)
        }

        const tokHash = crypto
            .createHash('sha256')
            .update(octoStsRep.result?.token as string)
            .digest('hex')
        core.info(`Created token with hash: ${tokHash}`)

        core.setSecret(octoStsRep.result?.token as string)
        core.setOutput('token', octoStsRep.result?.token)
        core.saveState('token', octoStsRep.result?.token)
    } catch (error) {
        core.debug(JSON.stringify(error))
        core.setFailed((error as Error).message)
    }
}