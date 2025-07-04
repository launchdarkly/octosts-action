import * as crypto from "node:crypto";
import * as core from "@actions/core"
import {getActionsEnvVars, getInputs} from "./inputs";
import {Agent, fetch, setGlobalDispatcher} from "undici";

interface GHRep {
    value: string;
}

interface OctoStsRep {
    token?: string;
    message?: string;
}

export async function run(): Promise<void> {
    try {
        const agent = new Agent({ allowH2: true })
        setGlobalDispatcher(agent)
        const {actionsToken, actionsUrl} = getActionsEnvVars();
        const { domain, scope, identity } = getInputs();


        const ghRep = await fetch(`${actionsUrl}&audience=${domain}`, {
            headers: {
                authorization: `Bearer ${actionsToken}`,
            }
        })
        const ghRepJson = await ghRep.json() as GHRep
        if (ghRepJson.value !== null) {
            core.setSecret(ghRepJson.value)
        }
        core.debug(JSON.stringify(ghRepJson))

        core.debug(`Creating token for ${identity} using ${scope} against ${domain}`)
        const octoStsRep = await fetch(
            `https://${domain}/sts/exchange?scope=${scope}&identity=${identity}`, {
            headers: {
                authorization: `Bearer ${ghRepJson.value}`
            }
        })
        const octoStsRepJson = await octoStsRep.json() as OctoStsRep

        if (!octoStsRepJson?.token) {
            return core.setFailed(octoStsRepJson?.message as string)
        }

        const tokHash = crypto
            .createHash('sha256')
            .update(octoStsRepJson?.token as string)
            .digest('hex')

        core.setSecret(octoStsRepJson?.token as string)
        core.setOutput('token', octoStsRepJson?.token)
        core.saveState('token', octoStsRepJson?.token)
        return core.info(`Created token with hash: ${tokHash}`)
    } catch (error) {
        core.debug(JSON.stringify(error))
        return core.setFailed((error as Error).message)
    }
}