#!/usr/bin/env node

const program = require("commander");
const { spawn } = require("child_process");

let projectName;

program
  .version("1.0.0")
  .usage("react-native-log-ios <Xcode Project Name>")
  .arguments("<xcodeProjectName>")
  .action(xcodeProjectName => (projectName = xcodeProjectName))
  .parse(process.argv);

if (typeof projectName === "undefined") {
  program.help();
}

const logArgs = [
  "stream",
  "--predicate",
  `(processImagePath contains "${projectName}") and senderImageUUID == processImageUUID`,
  "--style",
  "json"
];

const lg = spawn("log", logArgs);

console.log("React Native iOS Logger started for Xcode project", projectName);

lg.stdout.on("data", data => {
  const str = data.toString();

  // Assumption: { is always at the end of a line, } at the start of line.
  const m = str.match(/\{$[\s\S]+?^\}/gm);
  if (m === null) return;
  
  const all = m.map(str => {
    try {
      return JSON.parse(str);
    } catch(error) {
      // Cannot parse - it can happen with certain log entries (maybe large, truncated ones)
      // In that case, ignore the error and return the plain string.
      return { timestamp: Date.now(), eventMessage: str };
    }
  });

  all.forEach(({ timestamp, eventMessage }) => {
    const time = new Date(timestamp).toLocaleTimeString([], { hour12: false });
    console.log([time, eventMessage].join(", "));
  });
});

lg.stderr.on("data", data => {
  console.log(`stderr: ${data}`);
});

lg.on("close", code => {
  console.log(`child process exited with code ${code}`);
});
