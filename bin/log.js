#!/usr/bin/env node

const args = process.argv.splice(process.execArgv.length + 2);
const projectName = args[0];

const {spawn} = require('child_process');

const logArgs = [
    'stream',
    '--predicate', `(processImagePath contains "${projectName}") and senderImageUUID == processImageUUID`,
    '--style', 'json'
];

const lg = spawn('log', logArgs);

console.log('React Native iOS Logger started for XCode project', projectName);

lg.stdout.on('data', data => {
    const str = data.toString();

    // Assumption: { is always at the end of a line, } at the start of line.
    const m = str.match(/\{$[\s\S]+?^\}/mg);
    if (m === null) return;

    const all = m.map(str => JSON.parse(str));

    all.forEach(({timestamp, eventMessage}) => {
        const time = new Date(timestamp).toLocaleTimeString([], {hour12: false});
        console.log([time, eventMessage].join(', '));
    });

});

lg.stderr.on('data', data => {
    console.log(`stderr: ${data}`);
});

lg.on('close', code => {
    console.log(`child process exited with code ${code}`);
});
