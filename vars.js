console.log('=== vars', process.env.OWNER, process.env.REPO, process.env);

const envCI = require('env-ci');
console.log('=== env', envCI());

const { exec } = require('child_process');
exec('git rev-parse --show-toplevel', (err, stdout) => console.log('=== rev-parse', stdout));
