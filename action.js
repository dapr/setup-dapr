const fs = require("fs");
const util = require("util");
const path = require("path");
const core = require("@actions/core");
const tc = require("@actions/tool-cache");

// The name of the tool we are installing with this action.
const toolName = "dapr";

// Base form of the the URL to download the release archives. As long as this
// does not change this will be able to download any version the CLI.
const baseURL = "https://github.com/dapr/cli/releases/download/v";

// Returns the URL used to download a specific version of the Dapr CLI for a
// specific platform.
function getDaprDownloadURL(currentOs, version) {
  var file = "";
  switch (currentOs) {
    case "Linux":
      file = "dapr_linux_amd64.tar.gz";
      break;

    case "Darwin":
      file = "dapr_darwin_amd64.tar.gz";
      break;

    case "Windows_NT":
    default:
      file = "dapr_windows_amd64.zip";
      break;
  }

  return util.format("%s%s/%s", baseURL, version, file);
}

// Downloads and extracts the archive to the runner and returns the path.
async function downloadDapr(currentOs, version) {
  // See if we have cached this tool already
  let cachedToolPath = tc.find(toolName, version);

  // If we did not find the tool in the cache download it now.
  if (!cachedToolPath) {
    let downloadPath;
    let downloadUrl = getDaprDownloadURL(currentOs, version);
    try {
      core.info(`Downloading Dapr from ${downloadUrl}...`);
      downloadPath = await tc.downloadTool(downloadUrl);
    } catch (exception) {
      throw new Error(
        util.format("Failed to download Dapr from location", downloadUrl)
      );
    }

    // (chmod a+rwx) sets permissions so that, User / owner can read, can
    // write and can execute. Group can read, can write and can execute.
    // Others can read, can write and can execute.
    fs.chmodSync(downloadPath, "777");

    // Stores the path where the archive was extracted
    let installedToolPath;
    if (currentOs === "Windows_NT") {
      installedToolPath = await tc.extractZip(downloadPath);
    } else {
      // Both Linux and macOS use a .tar.gz file
      installedToolPath = await tc.extractTar(downloadPath);
    }

    // Cache to tool so we do not have to download multiple times
    cachedToolPath = await tc.cacheDir(installedToolPath, toolName, version);
  }

  // Get the full path to the executable
  const toolPath = findTool(currentOs, cachedToolPath);
  if (!toolPath) {
    throw new Error(
      util.format("Dapr executable not found in path", cachedToolPath)
    );
  }

  core.info(`Dapr installed to ${toolPath}...`);

  // (chmod a+rwx) sets permissions so that, User / owner can read, can
  // write and can execute. Group can read, can write and can execute.
  // Others can read, can write and can execute.
  fs.chmodSync(toolPath, "777");

  return toolPath;
}

// Returns a install path of the desired tool
function findTool(currentOs, rootFolder) {
  fs.chmodSync(rootFolder, "777");

  // Holds all the paths. The tool might be installed in multiple locations.
  var fileList;

  // walkSync is recursive which is why we pass in fileList and assign it the
  // return value of this function.
  fileList = walkSync(
    rootFolder,
    fileList,
    toolName + getExecutableExtension(currentOs)
  );

  if (!fileList || fileList.length == 0) {
    throw new Error(
      util.format("Dapr executable not found in path", rootFolder)
    );
  } else {
    // Return the first one we find.
    return fileList[0];
  }
}

// Returns the full name of the executable with extension if any. On Linux and
// macOS the executable does not have an extension but on Windows it does.
function getExecutableExtension(currentOs) {
  return currentOs.match(/^Win/) ? ".exe" : "";
}

// Returns a list of path to the fileToFind in the dir provided.
function walkSync(dir, fileList, fileToFind) {
  var files = fs.readdirSync(dir);

  fileList = fileList || [];
  files.forEach(function (file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      fileList = walkSync(path.join(dir, file), fileList, fileToFind);
    } else {
      core.debug(file);
      if (file == fileToFind) {
        fileList.push(path.join(dir, file));
      }
    }
  });

  return fileList;
}

// The main function of this action. After the archive is downloaded and
// extracted this function adds it location to the path. This will make sure
// other steps in your workflow will be able to call the Dapr CLI.
async function run(currentOs, version) {
  let cachedPath = await downloadDapr(currentOs, version);

  if (!process.env["PATH"].startsWith(path.dirname(cachedPath))) {
    core.addPath(path.dirname(cachedPath));
  }

  console.log(
    `Dapr CLI version: '${version}' has been cached at ${cachedPath}`
  );

  // set a an output of this action incase future steps need the path to the tool.
  core.setOutput("dapr-path", cachedPath);
}

module.exports = {
  run: run,
  downloadDapr: downloadDapr,
  getDaprDownloadURL: getDaprDownloadURL,
};
