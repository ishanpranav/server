// server.mjs
// Copyright (c) 2024 Ishan Pranav
// Licensed under the MIT license.

import { readFile } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { HTTPServer } from './http-server.mjs';

const fileName = fileURLToPath(import.meta.url);
const directoryName = dirname(fileName); 

readFile(join(directoryName, 'config.json'), (err, data) => {
    if (err) {
        throw err;
    }

    const config = JSON.parse(data);
    
    const httpServer = new HTTPServer(
        join(directoryName, '..', config['root_directory']),
        config['redirect_map']);

    httpServer.listen(3000, 'localhost');
});
