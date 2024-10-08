import {preferredCharsets} from './lib/charset.js';
import {preferredEncodings} from "./lib/encoding.js";
import {preferredLanguages} from "./lib/language.js";
import {preferredMediaTypes} from "./lib/mediaType.js";

export interface Headers {
    [key: string]: string | string[] | undefined;
}

export class Negotiator {
    constructor(private readonly request: { headers: Headers }) {
    }

    charset(available?: string[]) {
        const set = this.charsets(available);
        return set && set[0];
    }

    charsets(available?: string[]) {
        return preferredCharsets(this.request.headers['accept-charset'] as any, available);
    }

    encoding(available?: string[], opts?: unknown) {
        const set = this.encodings(available, opts);
        return set && set[0];
    }

    encodings(available?: string[], options?: unknown) {
        const opts: any = options || {};
        return preferredEncodings(this.request.headers['accept-encoding'] as any, available, opts.preferred);
    }

    language(available?: string[]) {
        const set = this.languages(available);
        return set && set[0];
    }

    languages(available?: string[]) {
        return preferredLanguages(this.request.headers['accept-language'] as any, available);
    }

    mediaType(available?: string[]) {
        var set = this.mediaTypes(available);
        return set && set[0];
    }

    mediaTypes(available?: string[]) {
        return preferredMediaTypes(this.request.headers.accept as any, available);
    }
}
