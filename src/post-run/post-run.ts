import * as core from "@actions/core"
import * as httm from "@actions/http-client"

export async function postRun(): Promise<void> {
    try {
        const token = core.getState('token')

        const httpClient = new httm.HttpClient('octosts-action')

        const rep = await httpClient.del('https://api.github.com/installation/token', {
            authorization: `Bearer ${token}`,
            accept: 'application/vnd.github+json'
        })

        if (rep.message.statusCode == 204) {
            core.info('Successfully deleted token')
        } else {
            core.setFailed(`Failed to delete token: ${rep.message.statusCode} ${rep.message.statusMessage}`)
        }
    } catch (error) {
        core.setFailed((error as Error).message)
    }
}