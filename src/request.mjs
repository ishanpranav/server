// request.mjs
// Copyright (c) 2024 Ishan Pranav
// Licensed under the MIT license.

export class Request {
    constructor(value) {
        [this.method, this.path] = value.split(' ');
    }
}
