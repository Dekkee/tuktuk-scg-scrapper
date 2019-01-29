import * as sinon from 'sinon';
import * as api from './index';

function mockApiResponse (body = {}) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-type': 'application/json' }
    });
}

const fakeJson = {
    json: async () => Promise.resolve({})
};

describe('api', () => {
    const sandbox = sinon.createSandbox();
    let clock: sinon.SinonFakeTimers;

    const oneSecPromise = () => new Promise((resolve) => setTimeout(() => { resolve(fakeJson); }, 1000));

    beforeEach(() => {
        clock = sandbox.useFakeTimers();
    });

    afterEach(() => sandbox.restore());

    it('normal usage', (done) => {
        sandbox.stub(window, 'fetch').returns(oneSecPromise() as any);
        const promise = api.searchByName('name', false);
        promise.then(() => done(), (e) => console.error(e));
        clock.tick(2000);
    });

    it('double usage', (done) => {
        sandbox.stub(window, 'fetch').returns(oneSecPromise() as any);
        const promise1 = api.searchByName('name', false);
        promise1.then(() => { throw new Error('called!') }, (e) => console.error(e));
        clock.tick(500);
        const promise2 = api.searchByName('name', false);
        promise2.then(() => done(), (e) => console.error(e));
        clock.tick(2000);
    });

});
