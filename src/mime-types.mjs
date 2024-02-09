// mime-types.mjs
// Copyright (c) 2024 Ishan Pranav
// Licensed under the MIT license.

import * as path from 'path';

/** Specifies common MIME types. */
export const mimeTypes = {
    jpg: 'image/jpg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    html: 'text/html',
    css: 'text/css',
    txt: 'text/plain'
};

/**
 * Determines the MINE type of file from its extension.
 * 
 * @param {String} fileName a file name.
 * @return {String | undefined} the MIME type if the extension is known;
 *                              otherwise, `null`.
 */
function getMIMEType(fileName) {
    const ext = path.extname(fileName);

    if (ext.length) {
        return mimeTypes[ext.substring(1)];
    }

    return null;
}
