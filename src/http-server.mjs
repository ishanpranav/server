// http-server.mjs
// Copyright (c) 2024 Ishan Pranav
// Licensed under the MIT license.

import { createServer } from 'net';
import * as path from 'path';
import { Request } from './request.mjs';
import { Response } from './response.mjs';
import { getMIMEType } from './web-lib.mjs';

function safeJoin(rootDirectory, untrustedPath) {
    return path.join(rootDirectory, path.join(path.sep, untrustedPath));
}

/** Represents an HTTP server. */
export class HTTPServer {
    /**
     * Initializes a new instance of the `HTTPServer` class.
     * 
     * @param {String} rootDirectory the full path to the server root directory.
     * @param {*}      redirects     an object that maps paths to redirects.
    */
    constructor(rootDirectory, redirects) {
        this.rootDirectory = rootDirectory;
        this.redirects = redirects;
        this.server = createServer(this.handleConnection.bind(this));
    }

    /** 
     * Starts listening for connections.
     * 
     * @param {Number} port the port number.
     * @param {String} host the hostname.
     */
    listen(port, host) {
        this.server.listen(port, host);
    }

    /**
     * Handles a new connection.
     * 
     * @param {Socket} socket the TCP/IP socket.
     */
    handleConnection(socket) {
        socket.on('data', data => this.handleRequest(socket, data));
    }

    /**
     * Handles a new request.
     * 
     * @param {Socket} socket the TCP/IP socket.
     * @param {*}      data   the raw request data.
     */
    handleRequest(socket, data) {
        const request = new Request(data.toString());
        const response = new Response(socket);

        if (Object.hasOwn(this.redirects, request.path)) {
            const redirect = this.redirects[request.path];

            response.setHeader('Location', redirect);
            response.setHeader('Content-Type', getMIMEType(redirect));
            response.status(308).send();

            return;
        }

        const fullPath = safeJoin(this.rootDirectory, request.path);

        response.status(200).send("<html>" + fullPath + "</html>");

        // TODO: (see homework specification for details)
        // 0. implementation can start here, but other classes / methods can be modified or added
        // 1. handle redirects first
        // 2. if not a redirect and file/dir does not exist send back not found
        // 3. if file, serve file
        // 4. if dir, generate page that lists files and dirs contained in dir
        // 5. if markdown, compile and send back html
    }
}
