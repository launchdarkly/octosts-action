<!-- action-docs-description source="action.yml" -->
## Description

This action exchanges the workflow's identity token for a GitHub App Token from the OctoSTS service,
in accordance with the configured trust policy at the repo, or organisation, level.
<!-- action-docs-description source="action.yml" -->

<!-- action-docs-inputs source="action.yml" -->
## Inputs

| name | description | required | default |
| --- | --- | --- | --- |
| `domain` | <p>The domain of the OctoSTS instance to federate against.</p> | `false` | `octo-sts.dev` |
| `scope` | <p>The org, and optionally repo, of the repository which contains the trust policy.</p> | `true` | `""` |
| `identity` | <p>The name of the trust policy to load from the target repository provided in the scope input. The trust policy is loaded from the provided scope repository, and the filepath .github/chainguard/{identity}.sts.yaml</p> | `true` | `""` |
<!-- action-docs-inputs source="action.yml" -->

<!-- action-docs-outputs source="action.yml" -->
## Outputs

| name | description |
| --- | --- |
| `token` | <p>The federated token to use for authentication</p> |
<!-- action-docs-outputs source="action.yml" -->

<!-- action-docs-runs source="action.yml" -->
## Runs

This action is a `node20` action.
<!-- action-docs-runs source="action.yml" -->
