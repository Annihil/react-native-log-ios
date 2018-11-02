const fs = require("fs");

describe("react-native-log-ios", () => {
  it("verifies that the bin file exists", () => {
    fs.statSync("./bin/log.js");
  });
});
