const util = require('util');
const exec = util.promisify(require('child_process').exec);
const packageJson = require('../package.json');

const dockerPackageName = 'registry.dekker.gdn/tuktuk-scg-scrapper';

const images = ['frontend', 'proxy', 'scg-provider', 'storage'];

async function applyTags() {
    const { version } = packageJson;
    const commitHash = (await exec(`git rev-parse HEAD`)).stdout.slice(0, 6);
    const buildNumber = process.env.BUILD_NUMBER || commitHash || 'local';

    const fullVersion = `${version}-${buildNumber}`;

    console.log(`setting tag: ${fullVersion}`);
    // await exec(`git tag ${fullVersion}`);
    // await exec(`git push origin ${fullVersion}`);
    images.forEach(async (image) => {
        const imageName = `${dockerPackageName}-${image}`;
        await exec(`docker tag ${imageName}:latest ${imageName}:stable`);
        await exec(`docker push ${imageName}:stable`);
        await exec(`docker tag ${imageName}:latest ${imageName}:${fullVersion}`);
        await exec(`docker push ${imageName}:${fullVersion}`);
        console.log(`tag ${fullVersion} pushed`);
    });
}

applyTags().catch((e) => {
    console.error('Failed to push tags', e);
    process.exit(1);
});
