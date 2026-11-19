# Setup Dapr CLI

[Dapr](https://dapr.io) is a portable runtime for building distributed applications; this action installs the [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/) on a GitHub Actions runner.

## Install a specific version of Dapr CLI on a GitHub Actions runner

Acceptable values are any semantic version string like 1.19.1. If `version` is not set, the action installs the default from [action.yml](./action.yml), currently `1.13.0`.

```yaml
- name: Setup Dapr CLI specific version
  uses: dapr/setup-dapr@v2
  with:
    version: "1.19.1"
  id: install
```

The cached Dapr CLI path is added to the PATH environment variable as well as stored in the dapr-path output variable.
Refer to the action metadata file for details about all the inputs <https://github.com/dapr/setup-dapr/blob/main/action.yml>

This action does not initialize the Dapr Runtime. To do this add another step to initialize like this and remember that Dapr CLI and Dapr Runtime versions may differ:

```yaml
- name: Initialize Dapr
  run: |
    export GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}
    dapr init --runtime-version=1.19.1
    dapr --version
```

`dapr init` needs Docker, which GitHub-hosted runners provide only on Linux, so the test workflow runs this step only when `matrix.os == 'ubuntu-latest'`.

For a complete example see [./.github/workflows/test.yml](./.github/workflows/test.yml)

## Code of Conduct

Please refer to our [Dapr Community Code of Conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md)
