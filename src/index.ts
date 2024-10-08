import {preferredCharsets} from './lib/charset';

// var preferredEncodings = require('./lib/encoding')
// var preferredLanguages = require('./lib/language')
// var preferredMediaTypes = require('./lib/mediaType')

export interface Headers {
    [key: string]: string | string[] | undefined;
}

export class Negotiator {
    constructor(private readonly request: { headers: Headers }) {
    }

    charset(available?: string[]) {
        var set = this.charsets(available);
        return set && set[0];
    }

    charsets(available?: string[]) {
        return preferredCharsets(this.request.headers['accept-charset'], available);
    }

    // encoding(available?: string[], opts?: unknown) {
    //     var set = this.encodings(available, opts);
    //     return set && set[0];
    // }
    //
    // encodings(available?: string[], options?: unknown) {
    //     var opts = options || {};
    //     return preferredEncodings(this.request.headers['accept-encoding'], available, opts.preferred);
    // }
    //
    // language(available?: string[]) {
    //     var set = this.languages(available);
    //     return set && set[0];
    // }
    //
    // languages(available?: string[]) {
    //     return preferredLanguages(this.request.headers['accept-language'], available);
    // }
    //
    // mediaType(available?: string[]) {
    //     var set = this.mediaTypes(available);
    //     return set && set[0];
    // }
    //
    // mediaTypes(available?: string[]) {
    //     return preferredMediaTypes(this.request.headers.accept, available);
    // }
}
