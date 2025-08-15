# Contributing to the OctoSTS Action

## Submitting bug reports and feature requests

The LaunchDarkly team monitors the [issue tracker](https://github.com/launchdarkly/octosts-action/issues) in the repository. Bug reports and feature requests should be filed in this issue tracker.

## Submitting pull requests

We encourage pull requests and other contributions from the community. Before submitting pull requests, ensure that all temporary or unintended code is removed. Don't worry about adding reviewers to the pull request; the LaunchDarkly team will add themselves.

## Git Hooks

To install the repo's git hooks, run `pre-commit install`.

**pre-commit**

The pre-commit hooks check that relevant project files are formatted with `biome`, that all files end with a newline,
and that the README is up to date with the latest configuration in `action.yml`.`
