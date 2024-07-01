# Setup Dapr CLI

## Install a specific version of Dapr CLI on a GitHub Actions runner

Acceptable values are any semantic version string like 1.13.0. Use this action in workflow to define which version of Dapr CLI will be used.

```yaml
- name: Setup Dapr CLI specific version
  uses: dapr/setup-dapr@v1
  with:
    version: "1.13.0"
  id: install
```

The cached Dapr CLI path is added to the PATH environment variable as well as stored in the dapr-path output variable.
Refer to the action metadata file for details about all the inputs <https://github.com/dapr/setup-dapr/blob/main/action.yml>

This action does not initialize the Dapr Runtime.  To do this add another step to initialize like this and remember that Dapr CLI and Dapr Runtime versions may differ:

```yaml
- name: Initialize Dapr
  if: ${{ matrix.os == 'ubuntu-latest'}}
  run: |
    export GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}
    dapr init --runtime-version=1.13.0
    dapr --version
```

For a complete example see [./.github/workflows/test.yaml](./.github/workflows/test.yml)

## Code of Conduct

Please refer to our [Dapr Community Code of Conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md)
