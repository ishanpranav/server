// response.mjs
// Copyright (c) 2024 Ishan Pranav
// Licensed under the MIT license.

import { mimeTypes } from './mime-types.mjs';

const statusCodes = {
    '200': "OK",
    '308': "Permanent Redirect",
    '404': "Page Not Found",
    '500': "Internal Server Error"
};

export class Response {
    constructor(socket, statusCode = '200', version = 'HTTP/1.1') {
        this.socket = socket;
        this.statusCode = statusCode;
        this.version = version;
        this.headers = new Map();
        this.body = null;
    }

    setHeader(name, value) {
        this.headers.set(name, value);
    }

    status(statusCode) {
        this.statusCode = statusCode;

        return this;
    }

    send(body) {
        if (!this.headers.has('Content-Type')) {
            this.headers.set('Content-Type', mimeTypes.html);
        }

        const description = statusCodes[this.statusCode];
        const headersString = Object
            .entries(this.headers)
            .reduce((s, [name, value]) => `${s}${name}: ${value} \r\n`); // sic

        this.socket.write(
            `${this.version} ${this.statusCode} ${description}\r\n`);
        this.socket.write(`${headersString}\r\n`);

        if (body) {
            this.socket.write(body);
        }

        this.socket.end();
    }
}
