import {strict as assert} from 'node:assert';
import {describe, it} from 'node:test';
import {Negotiator} from '../dist/esm/index.js';

describe('negotiator.encoding()', function () {
  whenAcceptEncoding(undefined, function (negotiator) {
    it('should return identity', function () {
      assert.strictEqual(negotiator.encoding(), 'identity')
    })
  })

  whenAcceptEncoding('*', function (negotiator) {
    it('should return *', function () {
      assert.strictEqual(negotiator.encoding(), '*')
    })
  })

  whenAcceptEncoding('*, gzip', function (negotiator) {
    it('should return *', function () {
      assert.strictEqual(negotiator.encoding(), '*')
    })
  })

  whenAcceptEncoding('*, gzip;q=0', function (negotiator) {
    it('should return *', function () {
      assert.strictEqual(negotiator.encoding(), '*')
    })
  })

  whenAcceptEncoding('*;q=0', function (negotiator) {
    it('should return undefined', function () {
      assert.strictEqual(negotiator.encoding(), undefined)
    })
  })

  whenAcceptEncoding('*;q=0, identity;q=1', function (negotiator) {
    it('should return identity', function () {
      assert.strictEqual(negotiator.encoding(), 'identity')
    })
  })

  whenAcceptEncoding('identity', function (negotiator) {
    it('should return identity', function () {
      assert.strictEqual(negotiator.encoding(), 'identity')
    })
  })

  whenAcceptEncoding('identity;q=0', function (negotiator) {
    it('should return undefined', function () {
      assert.strictEqual(negotiator.encoding(), undefined)
    })
  })

  whenAcceptEncoding('gzip', function (negotiator) {
    it('should return gzip', function () {
      assert.strictEqual(negotiator.encoding(), 'gzip')
    })
  })

  whenAcceptEncoding('gzip, compress;q=0', function (negotiator) {
    it('should return gzip', function () {
      assert.strictEqual(negotiator.encoding(), 'gzip')
    })
  })

  whenAcceptEncoding('gzip, deflate', function (negotiator) {
    it('should return gzip', function () {
      assert.strictEqual(negotiator.encoding(), 'gzip')
    })
  })

  whenAcceptEncoding('gzip;q=0.8, deflate', function (negotiator) {
    it('should return deflate', function () {
      assert.strictEqual(negotiator.encoding(), 'deflate')
    })
  })

  whenAcceptEncoding('gzip;q=0.8, identity;q=0.5, *;q=0.3', function (negotiator) {
    it('should return gzip', function () {
      assert.strictEqual(negotiator.encoding(), 'gzip')
    })
  })
})

describe('negotiator.encoding(array)', function () {
  whenAcceptEncoding(undefined, function (negotiator) {
    it('should return undefined for empty list', function () {
      assert.strictEqual(negotiator.encoding([]), undefined)
    })

    it('should only match identity', function () {
      assert.strictEqual(negotiator.encoding(['identity']), 'identity')
      assert.strictEqual(negotiator.encoding(['gzip']), undefined)
    })
  })

  whenAcceptEncoding('*', function (negotiator) {
    it('should return undefined for empty list', function () {
      assert.strictEqual(negotiator.encoding([]), undefined)
    })

    it('should return first item in list', function () {
      assert.strictEqual(negotiator.encoding(['identity']), 'identity')
      assert.strictEqual(negotiator.encoding(['gzip']), 'gzip')
      assert.strictEqual(negotiator.encoding(['gzip', 'identity']), 'gzip')
    })
  })

  whenAcceptEncoding('*, gzip', function (negotiator) {
    it('should prefer gzip', function () {
      assert.strictEqual(negotiator.encoding(['identity']), 'identity')
      assert.strictEqual(negotiator.encoding(['gzip']), 'gzip')
      assert.strictEqual(negotiator.encoding(['compress', 'gzip']), 'gzip')
    })
  })

  whenAcceptEncoding('*, gzip;q=0', function (negotiator) {
    it('should exclude gzip', function () {
      assert.strictEqual(negotiator.encoding(['identity']), 'identity')
      assert.strictEqual(negotiator.encoding(['gzip']), undefined)
      assert.strictEqual(negotiator.encoding(['gzip', 'compress']), 'compress')
    })
  })

  whenAcceptEncoding('*;q=0', function (negotiator) {
    it('should return undefined for empty list', function () {
      assert.strictEqual(negotiator.encoding([]), undefined)
    })

    it('should match nothing', function () {
      assert.strictEqual(negotiator.encoding(['identity']), undefined)
      assert.strictEqual(negotiator.encoding(['gzip']), undefined)
    })
  })

  whenAcceptEncoding('*;q=0, identity;q=1', function (negotiator) {
    it('should return undefined for empty list', function () {
      assert.strictEqual(negotiator.encoding([]), undefined)
    })

    it('should still match identity', function () {
      assert.strictEqual(negotiator.encoding(['identity']), 'identity')
      assert.strictEqual(negotiator.encoding(['gzip']), undefined)
    })
  })

  whenAcceptEncoding('identity', function (negotiator) {
    it('should return undefined for empty list', function () {
      assert.strictEqual(negotiator.encoding([]), undefined)
    })

    it('should only match identity', function () {
      assert.strictEqual(negotiator.encoding(['identity']), 'identity')
      assert.strictEqual(negotiator.encoding(['gzip']), undefined)
    })
  })

  whenAcceptEncoding('identity;q=0', function (negotiator) {
    it('should return undefined for empty list', function () {
      assert.strictEqual(negotiator.encoding([]), undefined)
    })

    it('should match nothing', function () {
      assert.strictEqual(negotiator.encoding(['identity']), undefined)
      assert.strictEqual(negotiator.encoding(['gzip']), undefined)
    })
  })

  whenAcceptEncoding('gzip', function (negotiator) {
    it('should return undefined for empty list', function () {
      assert.strictEqual(negotiator.encoding([]), undefined)
    })

    it('should return client-preferred encodings', function () {
      assert.strictEqual(negotiator.encoding(['gzip']), 'gzip')
      assert.strictEqual(negotiator.encoding(['identity', 'gzip']), 'gzip')
      assert.strictEqual(negotiator.encoding(['identity']), 'identity')
    })
  })

  whenAcceptEncoding('gzip, compress;q=0', function (negotiator) {
    it('should not return compress', function () {
      assert.strictEqual(negotiator.encoding(['compress']), undefined)
      assert.strictEqual(negotiator.encoding(['deflate', 'compress']), undefined)
      assert.strictEqual(negotiator.encoding(['gzip', 'compress']), 'gzip')
    })
  })

  whenAcceptEncoding('gzip, deflate', function (negotiator) {
    it('should return first client-preferred encoding', function () {
      assert.strictEqual(negotiator.encoding(['deflate', 'compress']), 'deflate')
    })

    it('should return developer-preferred encodings', function () {
      assert.strictEqual(negotiator.encoding(['gzip', 'deflate'], { preferred: ['deflate'] }), 'deflate')
      assert.strictEqual(negotiator.encoding(['deflate', 'gzip'], { preferred: ['deflate'] }), 'deflate')
      assert.strictEqual(negotiator.encoding(['gzip', 'deflate'], { preferred: ['gzip'] }), 'gzip')
      assert.strictEqual(negotiator.encoding(['deflate', 'gzip'], { preferred: ['gzip'] }), 'gzip')
      assert.strictEqual(negotiator.encoding(['gzip'], { preferred: ['gzip'] }), 'gzip')
    })
  })

  whenAcceptEncoding('gzip;q=0.8, deflate', function (negotiator) {
    it('should return most client-preferred encoding', function () {
      assert.strictEqual(negotiator.encoding(['gzip']), 'gzip')
      assert.strictEqual(negotiator.encoding(['deflate']), 'deflate')
      assert.strictEqual(negotiator.encoding(['deflate', 'gzip']), 'deflate')
    })
  })

  whenAcceptEncoding('gzip;q=0.8, identity;q=0.5, *;q=0.3', function (negotiator) {
    it('should return most client-preferred encoding', function () {
      assert.strictEqual(negotiator.encoding(['gzip']), 'gzip')
      assert.strictEqual(negotiator.encoding(['compress', 'identity']), 'identity')
    })

    it('should return developer-preferred encodings', function () {
      assert.strictEqual(negotiator.encoding(['gzip', 'deflate'], { preferred: ['gzip'] }), 'gzip')
      assert.strictEqual(negotiator.encoding(['deflate', 'gzip'], { preferred: ['gzip'] }), 'gzip')
      assert.strictEqual(negotiator.encoding(['gzip'], { preferred: ['gzip'] }), 'gzip')
    })
  })
})

describe('negotiator.encodings()', function () {
  whenAcceptEncoding(undefined, function (negotiator) {
    it('should return identity', function () {
      assert.deepEqual(negotiator.encodings(), ['identity'])
    })
  })

  whenAcceptEncoding('*', function (negotiator) {
    it('should return *', function () {
      assert.deepEqual(negotiator.encodings(), ['*'])
    })
  })

  whenAcceptEncoding('*, gzip', function (negotiator) {
    it('should prefer gzip', function () {
      assert.deepEqual(negotiator.encodings(), ['*', 'gzip'])
    })
  })

  whenAcceptEncoding('*, gzip;q=0', function (negotiator) {
    it('should return *', function () {
      assert.deepEqual(negotiator.encodings(), ['*'])
    })
  })

  whenAcceptEncoding('*;q=0', function (negotiator) {
    it('should return an empty list', function () {
      assert.deepEqual(negotiator.encodings(), [])
    })
  })

  whenAcceptEncoding('*;q=0, identity;q=1', function (negotiator) {
    it('should return identity', function () {
      assert.deepEqual(negotiator.encodings(), ['identity'])
    })
  })

  whenAcceptEncoding('identity', function (negotiator) {
    it('should return identity', function () {
      assert.deepEqual(negotiator.encodings(), ['identity'])
    })
  })

  whenAcceptEncoding('identity;q=0', function (negotiator) {
    it('should return an empty list', function () {
      assert.deepEqual(negotiator.encodings(), [])
    })
  })

  whenAcceptEncoding('gzip', function (negotiator) {
    it('should return gzip, identity', function () {
      assert.deepEqual(negotiator.encodings(), ['gzip', 'identity'])
    })
  })

  whenAcceptEncoding('gzip, compress;q=0', function (negotiator) {
    it('should not return compress', function () {
      assert.deepEqual(negotiator.encodings(), ['gzip', 'identity'])
    })
  })

  whenAcceptEncoding('gzip, deflate', function (negotiator) {
    it('should return client-preferred encodings', function () {
      assert.deepEqual(negotiator.encodings(), ['gzip', 'deflate', 'identity'])
    })
  })

  whenAcceptEncoding('gzip;q=0.8, deflate', function (negotiator) {
    it('should return client-preferred encodings', function () {
      assert.deepEqual(negotiator.encodings(), ['deflate', 'gzip', 'identity'])
    })
  })

  whenAcceptEncoding('gzip;foo=bar;q=1, deflate;q=1', function (negotiator) {
    it('should return client-preferred encodings', function () {
      assert.deepEqual(negotiator.encodings(), ['gzip', 'deflate', 'identity'])
    })
  })

  whenAcceptEncoding('gzip;q=0.8, identity;q=0.5, *;q=0.3', function (negotiator) {
    it('should return client-preferred encodings', function () {
      assert.deepEqual(negotiator.encodings(), ['gzip', 'identity', '*'])
    })
  })
})

describe('negotiator.encodings(array)', function () {
  whenAcceptEncoding(undefined, function (negotiator) {
    it('should return empty list for empty list', function () {
      assert.deepEqual(negotiator.encodings([]), [])
    })

    it('should only match identity', function () {
      assert.deepEqual(negotiator.encodings(['identity']), ['identity'])
      assert.deepEqual(negotiator.encodings(['gzip']), [])
    })
  })

  whenAcceptEncoding('*', function (negotiator) {
    it('should return empty list for empty list', function () {
      assert.deepEqual(negotiator.encodings([]), [])
    })

    it('should return original list', function () {
      assert.deepEqual(negotiator.encodings(['identity']), ['identity'])
      assert.deepEqual(negotiator.encodings(['gzip']), ['gzip'])
      assert.deepEqual(negotiator.encodings(['gzip', 'identity']), ['gzip', 'identity'])
    })
  })

  whenAcceptEncoding('*, gzip', function (negotiator) {
    it('should prefer gzip', function () {
      assert.deepEqual(negotiator.encodings(['identity']), ['identity'])
      assert.deepEqual(negotiator.encodings(['gzip']), ['gzip'])
      assert.deepEqual(negotiator.encodings(['compress', 'gzip']), ['gzip', 'compress'])
    })
  })

  whenAcceptEncoding('*, gzip;q=0', function (negotiator) {
    it('should exclude gzip', function () {
      assert.deepEqual(negotiator.encodings(['identity']), ['identity'])
      assert.deepEqual(negotiator.encodings(['gzip']), [])
      assert.deepEqual(negotiator.encodings(['gzip', 'compress']), ['compress'])
    })
  })

  whenAcceptEncoding('*;q=0', function (negotiator) {
    it('should always return empty list', function () {
      assert.deepEqual(negotiator.encodings([]), [])
      assert.deepEqual(negotiator.encodings(['identity']), [])
      assert.deepEqual(negotiator.encodings(['gzip']), [])
    })
  })

  whenAcceptEncoding('*;q=0, identity;q=1', function (negotiator) {
    it('should still match identity', function () {
      assert.deepEqual(negotiator.encodings([]), [])
      assert.deepEqual(negotiator.encodings(['identity']), ['identity'])
      assert.deepEqual(negotiator.encodings(['gzip']), [])
    })
  })

  whenAcceptEncoding('identity', function (negotiator) {
    it('should return empty list for empty list', function () {
      assert.deepEqual(negotiator.encodings([]), [])
    })

    it('should only match identity', function () {
      assert.deepEqual(negotiator.encodings(['identity']), ['identity'])
      assert.deepEqual(negotiator.encodings(['gzip']), [])
    })
  })

  whenAcceptEncoding('identity;q=0', function (negotiator) {
    it('should always return empty list', function () {
      assert.deepEqual(negotiator.encodings([]), [])
      assert.deepEqual(negotiator.encodings(['identity']), [])
      assert.deepEqual(negotiator.encodings(['gzip']), [])
    })
  })

  whenAcceptEncoding('gzip', function (negotiator) {
    it('should return empty list for empty list', function () {
      assert.deepEqual(negotiator.encodings([]), [])
    })

    it('should be case insensitive, returning provided casing', function () {
      assert.deepEqual(negotiator.encodings(['GZIP']), ['GZIP'])
      assert.deepEqual(negotiator.encodings(['gzip', 'GZIP']), ['gzip', 'GZIP'])
      assert.deepEqual(negotiator.encodings(['GZIP', 'gzip']), ['GZIP', 'gzip'])
    })

    it('should return client-preferred encodings', function () {
      assert.deepEqual(negotiator.encodings(['gzip']), ['gzip'])
      assert.deepEqual(negotiator.encodings(['gzip', 'identity']), ['gzip', 'identity'])
      assert.deepEqual(negotiator.encodings(['identity', 'gzip']), ['gzip', 'identity'])
      assert.deepEqual(negotiator.encodings(['identity']), ['identity'])
    })
  })

  whenAcceptEncoding('gzip, compress;q=0', function (negotiator) {
    it('should not return compress', function () {
      assert.deepEqual(negotiator.encodings(['gzip', 'compress']), ['gzip'])
    })
  })

  whenAcceptEncoding('gzip, deflate', function (negotiator) {
    it('should return client-preferred encodings', function () {
      assert.deepEqual(negotiator.encodings(['gzip']), ['gzip'])
      assert.deepEqual(negotiator.encodings(['gzip', 'identity']), ['gzip', 'identity'])
      assert.deepEqual(negotiator.encodings(['deflate', 'gzip']), ['gzip', 'deflate'])
      assert.deepEqual(negotiator.encodings(['identity']), ['identity'])
    })

    it('should return developer-preferred encodings', function () {
      assert.deepEqual(negotiator.encodings(['gzip', 'deflate'], { preferred: ['deflate'] }), ['deflate', 'gzip'])
      assert.deepEqual(negotiator.encodings(['deflate', 'gzip'], { preferred: ['deflate'] }), ['deflate', 'gzip'])
      assert.deepEqual(negotiator.encodings(['gzip', 'deflate'], { preferred: ['gzip'] }), ['gzip', 'deflate'])
      assert.deepEqual(negotiator.encodings(['deflate', 'gzip'], { preferred: ['gzip'] }), ['gzip', 'deflate'])
      assert.deepEqual(negotiator.encodings(['gzip'], { preferred: ['gzip'] }), ['gzip'])
    })
  })

  whenAcceptEncoding('gzip;q=0.8, deflate', function (negotiator) {
    it('should return client-preferred encodings', function () {
      assert.deepEqual(negotiator.encodings(['gzip']), ['gzip'])
      assert.deepEqual(negotiator.encodings(['deflate']), ['deflate'])
      assert.deepEqual(negotiator.encodings(['deflate', 'gzip']), ['deflate', 'gzip'])
    })
  })

  whenAcceptEncoding('gzip;q=0.8, identity;q=0.5, *;q=0.3', function (negotiator) {
    it('should return client-preferred encodings', function () {
      assert.deepEqual(negotiator.encodings(['gzip']), ['gzip'])
      assert.deepEqual(negotiator.encodings(['identity', 'gzip', 'compress']), ['gzip', 'identity', 'compress'])
    })

    it('should return developer-preferred encodings', function () {
      assert.deepEqual(negotiator.encodings(['gzip', 'deflate'], { preferred: ['gzip'] }), ['gzip', 'deflate'])
      assert.deepEqual(negotiator.encodings(['deflate', 'gzip'], { preferred: ['gzip'] }), ['gzip', 'deflate'])
      assert.deepEqual(negotiator.encodings(['gzip'], { preferred: ['gzip'] }), ['gzip'])
    })
  })
})

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

function whenAcceptEncoding(acceptEncoding, func) {
  const description = !acceptEncoding
    ? 'when no Accept-Encoding'
    : 'when Accept-Encoding: ' + acceptEncoding

  describe(description, function () {
    func(new Negotiator(createRequest({'Accept-Encoding': acceptEncoding})))
  })
}
