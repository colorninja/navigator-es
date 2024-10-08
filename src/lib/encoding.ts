/**
 * Module variables.
 * @private
 */

const simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;

/**
 * Parse the Accept-Encoding header.
 * @private
 */

function parseAcceptEncoding(accept?: any) {
  var accepts = accept.split(',');
  let hasIdentity: any = false;
  var minQuality = 1;

  for (var i = 0, j = 0; i < accepts.length; i++) {
    var encoding = parseEncoding(accepts[i].trim(), i);

    if (encoding) {
      accepts[j++] = encoding;
      hasIdentity = hasIdentity || specify('identity', encoding);
      minQuality = Math.min(minQuality, encoding.q || 1);
    }
  }

  if (!hasIdentity) {
    /*
     * If identity doesn't explicitly appear in the accept-encoding header,
     * it's added to the list of acceptable encoding with the lowest q
     */
    accepts[j++] = {
      encoding: 'identity',
      q: minQuality,
      i: i
    };
  }

  // trim accepts
  accepts.length = j;

  return accepts;
}

/**
 * Parse an encoding from the Accept-Encoding header.
 * @private
 */

function parseEncoding(str: string, i: number) {
  var match = simpleEncodingRegExp.exec(str);
  if (!match) return null;

  var encoding = match[1];
  var q = 1;
  if (match[2]) {
    var params = match[2].split(';');
    for (var j = 0; j < params.length; j++) {
      var p = params[j].trim().split('=');
      if (p[0] === 'q') {
        q = parseFloat(p[1]);
        break;
      }
    }
  }

  return {
    encoding: encoding,
    q: q,
    i: i
  };
}

/**
 * Get the priority of an encoding.
 * @private
 */

function getEncodingPriority(encoding: string, accepted: any[], index: number) {
  var priority = {encoding: encoding, o: -1, q: 0, s: 0};

  for (var i = 0; i < accepted.length; i++) {
    var spec = specify(encoding, accepted[i], index);

    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }

  return priority;
}

/**
 * Get the specificity of the encoding.
 * @private
 */

function specify(encoding: string, spec: any, index?: number) {
  var s = 0;
  if(spec.encoding.toLowerCase() === encoding.toLowerCase()){
    s |= 1;
  } else if (spec.encoding !== '*' ) {
    return null
  }

  return {
    encoding: encoding,
    i: index,
    o: spec.i,
    q: spec.q,
    s: s
  }
}

/**
 * Get the preferred encodings from an Accept-Encoding header.
 * @public
 */

export function preferredEncodings(accept: string, provided?: string[], preferred?: any[]) {
  var accepts = parseAcceptEncoding(accept || '');

  var comparator = preferred ? function comparator (a: any, b: any) {
    if (a.q !== b.q) {
      return b.q - a.q // higher quality first
    }

    var aPreferred = preferred.indexOf(a.encoding)
    var bPreferred = preferred.indexOf(b.encoding)

    if (aPreferred === -1 && bPreferred === -1) {
      // consider the original specifity/order
      return (b.s - a.s) || (a.o - b.o) || (a.i - b.i)
    }

    if (aPreferred !== -1 && bPreferred !== -1) {
      return aPreferred - bPreferred // consider the preferred order
    }

    return aPreferred === -1 ? 1 : -1 // preferred first
  } : compareSpecs;

  if (!provided) {
    // sorted list of all encodings
    return accepts
      .filter(isQuality)
      .sort(comparator)
      .map(getFullEncoding);
  }

  var priorities = provided.map(function getPriority(type, index) {
    return getEncodingPriority(type, accepts, index);
  });

  // sorted list of accepted encodings
  return priorities.filter(isQuality).sort(comparator).map(function getEncoding(priority) {
    return provided[priorities.indexOf(priority)];
  });
}

/**
 * Compare two specs.
 * @private
 */

function compareSpecs(a: any, b: any) {
  return (b.q - a.q) || (b.s - a.s) || (a.o - b.o) || (a.i - b.i);
}

/**
 * Get full encoding string.
 * @private
 */

function getFullEncoding(spec: any) {
  return spec.encoding;
}

/**
 * Check if a spec has any quality.
 * @private
 */

function isQuality(spec: any) {
  return spec.q > 0;
}
