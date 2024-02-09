// request.mjs
// Copyright (c) 2024 Ishan Pranav
// Licensed under the MIT license.

/** Represents an HTTP resquest. */
export class Request {
    /**
     * Initializes a new instance of the `Request` class.
     * 
     * @param {String} value the plain-text HTTP request.
     */
    constructor(value) {
        [this.method, this.path] = value.split(' ');
    }
}
