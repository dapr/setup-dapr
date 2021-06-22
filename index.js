const os = require("os");
const action = require("./action");
const core = require("@actions/core");

/*
This is how the action is used:

- uses: dapr/setup-dapr@v1
  with:
    version: '<version>' # default is 1.2.0
  id: install

*/
async function run() {
  try {
    // Get the users input of the with
    const version = core.getInput("version");
    core.info(`Installing Dapr version ${version}...`);

    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.debug(new Date().toTimeString());

    // run the action code
    await action.run(os.type(), version);

    core.info(new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
