// http-server.mjs
// Copyright (c) 2024 Ishan Pranav
// Licensed under the MIT license.

import { access, constants, readdir, readFile, stat } from 'fs';
import { createServer } from 'net';
import { extname, join, sep } from 'path';
import { Request } from './request.mjs';
import { Response } from './response.mjs';
import { mimeTypes } from './web-lib.mjs';
import MarkdownIt from 'markdown-it';

const convertMarkdownToHTML = data => {
    return new MarkdownIt({ html: true }).render(data.toString());
};

const postprocessors = {
    'md': convertMarkdownToHTML,
    'markdown': convertMarkdownToHTML
};

function safeJoin(rootDirectory, untrustedPath) {
    return join(rootDirectory, join(sep, untrustedPath));
}

function generateIndex(directoryName, entries) {
    const tokens = [
        `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Index of `, directoryName, `</title>
</head>
<!-- Licensed under the MIT License. -->
<body>`];

    for (const entry of entries) {
        tokens.push('    <a href="', entry.name);

        if (entry.isDirectory()) {
            tokens.push('/');
        }

        tokens.push('">', entry.name, '</a><br/>');
    }

    tokens.push('</body>\n</html>');

    return tokens.join("");
}

function getMIMEType(fileName) {
    const ext = extname(fileName);

    if (ext.length) {
        return mimeTypes[ext.substring(1)];
    }

    return null;
}

function getExtension(fileName) {
    const formatPath = extname(fileName).toLowerCase();

    if (formatPath.startsWith('.')) {
        return formatPath.substring(1);
    }

    return formatPath;
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
                    const options = {
                        withFileTypes: true
                    };

                    readdir(fullPath, options, (err, entries) => {
                        const response = new Response(socket);

                        if (err) {
                            response.status(500).send();

                            return;
                        }

                        response
                            .status(200)
                            .send(generateIndex(fullPath, entries));
                    });

                    return;
                }

                if (stats.isFile()) {
                    readFile(fullPath, (err, data) => {
                        const response = new Response(socket);

                        if (err) {
                            response.status(500).send();

                            return;
                        }

                        const contentType = getMIMEType(fullPath);
                        const extension = getExtension(fullPath);

                        if (Object.hasOwn(postprocessors, extension)) {
                            data = postprocessors[extension](data);
                        }

                        response.setHeader('Content-Type', contentType);
                        response.status(200).send(data);
                    });

                    return;
                }

                new Response(socket, 500).send();
            });
        });
    }
}
