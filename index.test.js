const fs = require("fs");
const path = require("path");
const action = require("./action");
const tc = require("@actions/tool-cache");

describe("run", () => {
  test("should unzip Windows zip", async () => {
    // Arrange
    jest.spyOn(tc, "find").mockReturnValue();
    jest.spyOn(tc, "cacheDir").mockReturnValue("/dapr/");
    let extractZip = jest.spyOn(tc, "extractZip").mockReturnValue();
    jest.spyOn(tc, "downloadTool").mockReturnValue("dapr_darwin_amd64.tar.gz");

    jest.spyOn(fs, "chmodSync").mockReturnValue();
    jest.spyOn(fs, "readdirSync").mockReturnValue(["dapr.exe"]);
    jest.spyOn(fs, "statSync").mockReturnValue({
      isDirectory: () => {
        false;
      },
    });

    // Act
    await action.run("Windows_NT", "1.0.0");

    // Restore mocks so the testing framework can use the fs functions
    jest.restoreAllMocks();

    // Assert
    expect(extractZip).toHaveBeenCalledTimes(1);
  });
});

describe("getDaprDownloadURL", () => {
  test("should download the Windows version", () => {
    // Act
    let url = action.getDaprDownloadURL("Windows_NT", "1.0.0");

    // Assert
    expect(url).toEqual(
      "https://github.com/dapr/cli/releases/download/v1.0.0/dapr_windows_amd64.zip"
    );
  });

  test("should download the Linux version", () => {
    // Act
    let url = action.getDaprDownloadURL("Linux", "1.0.0");

    // Assert
    expect(url).toEqual(
      "https://github.com/dapr/cli/releases/download/v1.0.0/dapr_linux_amd64.tar.gz"
    );
  });

  test("should download the Darwin version", () => {
    // Act
    let url = action.getDaprDownloadURL("Darwin", "1.0.0");

    // Assert
    expect(url).toEqual(
      "https://github.com/dapr/cli/releases/download/v1.0.0/dapr_darwin_amd64.tar.gz"
    );
  });
});

describe("downloadDapr", () => {
  test("should return toolPath", async () => {
    // Arrange
    jest.spyOn(tc, "find").mockReturnValue("/dapr/");

    jest.spyOn(path, "join").mockReturnValue("/dapr/dapr.exe");

    jest.spyOn(fs, "chmodSync").mockReturnValue();
    jest.spyOn(fs, "readdirSync").mockReturnValue(["dapr.exe"]);
    jest.spyOn(fs, "statSync").mockReturnValue({
      isDirectory: () => {
        return false;
      },
    });

    // Act
    let actual = await action.downloadDapr("Windows_NT", "1.1.0");

    // Assert
    // Restore mocks so the testing framework can use the fs functions
    jest.restoreAllMocks();
    expect(actual).toBe("/dapr/dapr.exe");
  });

  test("should throw if Dapr can't be found", async () => {
    // Arrange
    // If 3 assertions are not tested that means the exception
    // was not thrown
    expect.assertions(3);

    jest.spyOn(tc, "find").mockReturnValue("/dapr/");
    jest.spyOn(tc, "cacheDir").mockReturnValue("/dapr/");
    let extractTar = jest.spyOn(tc, "extractTar").mockReturnValue();
    jest.spyOn(tc, "downloadTool").mockReturnValue("dapr_darwin_amd64.tar.gz");

    jest.spyOn(path, "join").mockReturnValue("");

    jest.spyOn(fs, "chmodSync").mockReturnValue();
    jest
      .spyOn(fs, "readdirSync")
      .mockReturnValueOnce(["etc"])
      .mockReturnValueOnce(["dapr"]);

    jest
      .spyOn(fs, "statSync")
      .mockReturnValueOnce({
        isDirectory: () => {
          return true;
        },
      })
      .mockReturnValueOnce({
        isDirectory: () => {
          return false;
        },
      });

    try {
      // Act
      await action.downloadDapr("Darwin", "1.0.0");
    } catch (error) {
      // Restore mocks so the testing framework can use the fs functions
      jest.restoreAllMocks();

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty(
        "message",
        "Dapr executable not found in path /dapr/"
      );

      // Number of calls should be zero because of the error
      expect(extractTar).toHaveBeenCalledTimes(0);
    }
  });

  test("should throw if fileList is empty", async () => {
    // Arrange
    expect.assertions(3);

    jest.spyOn(tc, "find").mockReturnValue();
    jest.spyOn(tc, "cacheDir").mockReturnValue("/dapr/");
    let extractTar = jest.spyOn(tc, "extractTar").mockReturnValue();
    jest.spyOn(tc, "downloadTool").mockReturnValue("dapr_darwin_amd64.tar.gz");

    jest.spyOn(fs, "chmodSync").mockReturnValue();
    jest.spyOn(fs, "readdirSync").mockReturnValue([]);

    try {
      // Act
      await action.downloadDapr("Darwin", "1.0.0");
    } catch (error) {
      // Restore mocks so the testing framework can use the fs functions
      jest.restoreAllMocks();

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty(
        "message",
        "Dapr executable not found in path /dapr/"
      );

      expect(extractTar).toHaveBeenCalledTimes(1);
    }
  });

  test("should throw on download failure", async () => {
    // Arrange
    expect.assertions(2);

    jest.spyOn(tc, "find").mockReturnValue();
    jest.spyOn(tc, "downloadTool").mockImplementation(() => {
      throw "error";
    });

    try {
      // Act
      await action.downloadDapr("Darwin", "1.0.0");
    } catch (error) {
      // Restore mocks so the testing framework can use the fs functions
      jest.restoreAllMocks();

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty(
        "message",
        "Failed to download Dapr from location https://github.com/dapr/cli/releases/download/v1.0.0/dapr_darwin_amd64.tar.gz"
      );
    }
  });
});
