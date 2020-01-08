import { prepareUrl } from './index';

const testCases = [
    { input: 'Jace, the Mind Sculptor', output: 'Jace, the Mind+Sculptor' },
    { input: 'Life from the Loam', output: 'Life from the+Loam' },
    { input: 'Smothering Tithe', output: 'Smothering+Tithe' },
    { input: 'Defence of the Heart', output: 'Defence of the+Heart' },
    { input: 'The Omnisence', output: 'The+Omnisence' },
    { input: 'Daxos of the Melethis', output: 'Daxos of the+Melethis' },
    { input: 'Force of Will', output: 'Force of Will' },
    { input: 'Escape to the Wilds', output: 'Escape to the+Wilds' },
    { input: 'Quest for Ancient Secrets', output: 'Quest for Ancient+Secrets' },
    { input: 'Yawgmoth\'s Will', output: 'Yawgmoth\'s Will' },
    { input: 'Nissa\'s Triumph', output: 'Nissa\'s+Triumph' },
    { input: 'O1ona, Queen of the Fae', output: 'Oona, Queen of the+Fae' },
];

describe('urlPreparation', () => {
    testCases.forEach((testCase) => {
        it(`${testCase.input} -> ${testCase.output}`, () => {
            expect(prepareUrl(testCase.input)).toEqual(testCase.output);
        });
    });
});
