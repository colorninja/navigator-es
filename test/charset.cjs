const {strict: assert} = require('node:assert');
const {describe, it} = require('node:test');
const Negotiator = require('../dist/cjs').Negotiator;


describe('CommonJS Module', function () {
    it('should properly export', function () {
        const negotiator = new Negotiator(createRequest({'Accept-Charset': undefined}));

        assert.strictEqual(negotiator.charset(), '*')
    })
});

function createRequest(headers) {
    const request = {
        headers: {}
    }

    if (headers) {
        Object.keys(headers).forEach(function (key) {
            request.headers[key.toLowerCase()] = headers[key]
        })
    }

    return request
}
