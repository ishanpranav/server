// response.mjs
// Copyright (c) 2024 Ishan Pranav
// Licensed under the MIT license.

import { mimeTypes } from './web-lib.mjs';

const statusCodes = {
    '200': "OK",
    '308': "Permanent Redirect",
    '404': "Page Not Found",
    '500': "Internal Server Error"
};

/** Represents an HTTP response. */
export class Response {
    /**
     * Initializes a new instance of the `Response` class.
     * 
     * @param {Socket} socket     the TCP/IP socket.
     * @param {Number} statusCode the HTTP status code.
     * @param {String} version    the HTTP protocol version.
     */
    constructor(socket, statusCode = 200, version = 'HTTP/1.1') {
        this.socket = socket;
        this.statusCode = statusCode;
        this.version = version;
        this.headers = new Map();
        this.body = null;
    }

    /**
     * Sets an HTTP response header, or adds it if it does not already exist.
     * 
     * @param {String} name  the header name.
     * @param {String} value the header content.
     */
    setHeader(name, value) {
        this.headers.set(name, value);
    }

    /**
     * Sets the HTTP status and returns the current instance.
     * 
     * @param {String} statusCode the HTTP status code.
     * @returns {Response} A reference the current instance.
     */
    status(statusCode) {
        this.statusCode = statusCode;

        return this;
    }

    /**
     * Sends the HTTP response.
     * 
     * @param {*} body the raw response body.
     */
    send(body) {
        if (body) {
            this.body = body;
        }

        if (!this.headers.has('Content-Type')) {
            this.headers.set('Content-Type', mimeTypes.html);
        }

        const tokens = [
            this.version, ' ',
            this.statusCode, ' ',
            statusCodes[this.statusCode], '\r\n'
        ];

        for (const [name, value] of this.headers.entries()) {
            tokens.push(name, ': ', value, '\r\n');
        }

        tokens.push('\r\n');
        this.socket.write(tokens.join(""));
        this.socket.write(this.body ?? "");
        this.socket.end();
    }
}
