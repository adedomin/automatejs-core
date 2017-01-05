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

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    waterfall = require('async.waterfall')

module.exports = (tree, cb) => {
    var template, rstream
    try {
        template = require(
            path.join(__dirname, 'templates', tree.source)
        )(tree.variables)
    }
    catch (err) {
        return cb(err, {
            status: 'failed to template, may be a syntax error',
            exception: err
        })
    }

    rstream.push(template)

    waterfall([(next) => {
        if (!tree.mkdir) return next()
        mkdirp(path.dirname(tree.destination), next)
    }, (next) => {
        var fpipe
        fpipe = fs.createWriteStream(
            tree.destination,
            { mode: parseInt(tree.mode, 8) }
        ).write(template)
        fpipe.on('error', next)
        fpipe.on('finish', next)
    }, (next) => {
        if (!tree.owner) return next()
        if (!+tree.owner) return next('must provide a uid, username is not supported')
        fs.chown(tree.destination, +tree.owner, 0, next)
    }], (err) => {
        if (err) return cb(err, { status: 'ERROR', exception: err })
        cb(null, { status: 'template written to file' })
    })
}
