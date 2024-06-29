# Setup Dapr CLI

## Install a specific version of Dapr CLI on a GitHub Actions runner

Acceptable values are any semantic version string like 1.13.0. Use this action in workflow to define which version of Dapr CLI will be used.

```yaml
- uses: dapr/setup-dapr@v1
  with:
    version: "<version>" # e.g. "1.13.0"
  id: install
```

The cached Dapr CLI path is added to the PATH environment variable as well as stored in the dapr-path output variable.
Refer to the action metadata file for details about all the inputs <https://github.com/dapr/setup-dapr/blob/main/action.yml>

## Code of Conduct

Please refer to our [Dapr Community Code of Conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md)
