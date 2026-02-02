> [!NOTE]
> This action is maintained by LaunchDarkly for use across our repositories.
> It sets many defaults which may not be compatible with your environment and is not intended for direct use.

<!-- action-docs-description source="action.yml" -->
## Description

Exchanges the workflow's identity token for a GitHub token from the OctoSTS service, using a configured trust policy.
<!-- action-docs-description source="action.yml" -->

<!-- action-docs-inputs source="action.yml" -->
## Inputs

| name | description | required | default |
| --- | --- | --- | --- |
| `domain` | <p>The domain of the OctoSTS instance to federate against.</p> | `false` | `octosts.shd.ldinfra.net` |
| `scope` | <p>The org, and optionally repo, of the repository which contains the trust policy.</p> | `true` | `""` |
| `identity` | <p>The name of the trust policy to load from the target repository provided in the scope input. The trust policy is loaded from the provided scope repository, and the filepath .github/chainguard/{identity}.sts.yaml</p> | `true` | `""` |
| `configure-git` | <p>Whether to configure git to use the federated token for authentication.</p> | `false` | `false` |
<!-- action-docs-inputs source="action.yml" -->

<!-- action-docs-outputs source="action.yml" -->
## Outputs

| name | description |
| --- | --- |
| `token` | <p>The federated token to use for authentication</p> |
<!-- action-docs-outputs source="action.yml" -->

<!-- action-docs-runs source="action.yml" -->
## Runs

This action is a `node24` action.
<!-- action-docs-runs source="action.yml" -->
