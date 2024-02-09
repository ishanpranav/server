// http-server.mjs
// Copyright (c) 2024 Ishan Pranav
// Licensed under the MIT license.

import { access, constants, readFile, stat } from 'fs';
import { createServer } from 'net';
import { join, sep } from 'path';
import { Request } from './request.mjs';
import { Response } from './response.mjs';
import { getMIMEType } from './web-lib.mjs';

function safeJoin(rootDirectory, untrustedPath) {
    return join(rootDirectory, join(sep, untrustedPath));
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

        if (Object.hasOwn(this.redirects, request.path)) {
            const redirect = this.redirects[request.path];
            const response = new Response(socket, 308);

            response.setHeader('Location', redirect);
            response.setHeader('Content-Type', getMIMEType(redirect));
            response.send();

            return;
        }

        const fullPath = safeJoin(this.rootDirectory, request.path);

        access(fullPath, constants.F_OK, err => {
            if (err) {
                const response = new Response(socket, 404);

                response.setHeader('Content-Type', 'text/plain');
                response.send();

                return;
            }

            stat(fullPath, (err, stats) => {
                if (err) {
                    new Response(socket, 500).send();

                    return;
                }

                if (stats.isDirectory()) {
                    new Response(socket, 500).send();

                    return;
                }

                if (stats.isFile()) {
                    readFile(fullPath, (err, data) => {
                        const response = new Response(socket);

                        if (err) {
                            response.status(500).send();
                            
                            return;
                        }

                        response.status(200).send(data);
                    });
                }
            });
        });
    }
}
