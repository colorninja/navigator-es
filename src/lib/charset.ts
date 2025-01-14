const simpleCharsetRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;

type PossiblyParsedCharset = (ParsedCharset | string)[];

function parseAcceptCharset(accept: string): PossiblyParsedCharset[] {
  const accepts: any = accept.split(',');

  for (var i = 0, j = 0; i < accepts.length; i++) {
    const charset = parseCharset(accepts[i].trim(), i);

    if (charset) {
      accepts[j++] = charset;
    }
  }

  // trim accepts
  accepts.length = j;

  return accepts as any;
}

/**
 * Parse a charset from the Accept-Charset header.
 * @private
 */
interface ParsedCharset {
  charset: string;
  q: number;
  i: number;
}

function parseCharset(str: string, i: number): ParsedCharset | null {
  const match = simpleCharsetRegExp.exec(str);
  if (!match) return null;

  const charset = match[1];
  let q = 1;
  if (match[2]) {
    const params = match[2].split(';')
    for (let j = 0; j < params.length; j++) {
      const p = params[j].trim().split('=');
      if (p[0] === 'q') {
        q = parseFloat(p[1]);
        break;
      }
    }
  }

  return {
    charset: charset,
    q: q,
    i: i
  };
}

/**
 * Get the priority of a charset.
 * @private
 */

function getCharsetPriority(charset: string, accepted: ParsedCharset[], index: number) {
  let priority = {o: -1, q: 0, s: 0};

  for (let i = 0; i < accepted.length; i++) {
    const spec = specify(charset, accepted[i], index);

    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }

  return priority;
}

/**
 * Get the specificity of the charset.
 * @private
 */

interface Specificity {
  i: number;
  o: number;
  q: number;
  s: number;
}

function specify(charset: string, spec: ParsedCharset, index: number): Specificity | null {
  let s = 0;
  if(spec.charset.toLowerCase() === charset.toLowerCase()){
    s |= 1;
  } else if (spec.charset !== '*' ) {
    return null
  }

  return {
    i: index,
    o: spec.i,
    q: spec.q,
    s: s
  }
}

/**
 * Get the preferred charsets from an Accept-Charset header.
 * @public
 */

export function preferredCharsets(accept?: string, provided?: string[]) {
  // RFC 2616 sec 14.2: no header = *
  const accepts = parseAcceptCharset(accept === undefined ? '*' : accept || '') as any;

  if (!provided) {
    // sorted list of all charsets
    return accepts
      .filter(isQuality)
      .sort(compareSpecs)
      .map(getFullCharset);
  }

  const priorities = provided.map(function getPriority(type, index) {
    return getCharsetPriority(type, accepts, index);
  }) as any;

  // sorted list of accepted charsets
  return priorities.filter(isQuality).sort(compareSpecs).map(function getCharset(priority: any) {
    return provided[priorities.indexOf(priority)];
  });
}

/**
 * Compare two specs.
 * @private
 */

function compareSpecs(a: Specificity, b: Specificity) {
  return (b.q - a.q) || (b.s - a.s) || (a.o - b.o) || (a.i - b.i) || 0;
}

/**
 * Get full charset string.
 * @private
 */

function getFullCharset(spec: ParsedCharset) {
  return spec.charset;
}

/**
 * Check if a spec has any quality.
 * @private
 */

function isQuality(spec: Specificity) {
  return spec.q > 0;
}

export default preferredCharsets;
