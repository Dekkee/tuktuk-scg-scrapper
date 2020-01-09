const util = require('util');
const exec = util.promisify(require('child_process').exec);
const packageJson = require('../package.json');

async function applyTags() {
    const { version } = packageJson;
    const commitHash = (await exec(`git rev-parse HEAD`)).stdout.slice(0, 6);
    const buildNumber = process.env.BUILD_NUMBER || commitHash || 'local';

    console.log(`setting tag: ${version}-${buildNumber}`);
    // await exec(`git tag ${version}-${buildNumber}`);
    // await exec(`git push origin ${version}-${buildNumber}`);
    await exec(
        `docker tag registry.dekker.gdn/tuktuk-scg-scrapper:latest registry.dekker.gdn/tuktuk-scg-scrapper:stable`
    );
    await exec(`docker push registry.dekker.gdn/tuktuk-scg-scrapper:stable`);
    await exec(
        `docker tag registry.dekker.gdn/tuktuk-scg-scrapper:latest registry.dekker.gdn/tuktuk-scg-scrapper:${version}-${buildNumber}`
    );
    await exec(`docker push registry.dekker.gdn/tuktuk-scg-scrapper:${version}-${buildNumber}`);
    console.log(`tag ${version}-${buildNumber} pushed`);
}

applyTags().catch(e => {
    console.error('Failed to push tags', e);
    process.exit(1);
});
