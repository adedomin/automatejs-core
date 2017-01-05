/*
 * Copyright (c) 2016 prussian <genunrest@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var stream = require('stream').Readable,
    file = require('./file.js'),
    path = require('path').join

module.exports = (tree, cb) => {
    var template, rstream
    try {
        template = require(
            path(__dirname, 'templates', tree.source)
        )(tree.variables)
    }
    catch (err) {
        return cb(err, {
            status: 'failed to template, may be a syntax error',
            exception: err
        })
    }

    rstream = new stream()
    rstream._read = () => {}
    rstream.push(template)
    rstream.push()
    file(tree, (err) => {
        if (err) return cb(err, { status: 'error', exception: err }) 
        cb(null, { status: 'successfully wrote template to file' })
    }, rstream)
}
