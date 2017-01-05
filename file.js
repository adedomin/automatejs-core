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

module.exports = (tree, cb, template) => {
    var actualdest = tree.destination
    if (tree.destination.slice(-1) == '/')
        actualdest = `${tree.destination}${path.basename(tree.source)}`

    waterfall([(next) => {
        if (!tree.mkdir) return next()
        mkdirp(path.dirname(actualdest), next)
    }, (next) => {
        var fpipe
        if (!tree.mode || !parseInt(tree.mode, 8)) {
            fpipe = fs.createReadStream(
                path.join(__dirname, 'files', tree.source)
            ).pipe(
                fs.createWriteStream(actualdest)
            )
        }
        else if (template) {
            template.pipe(
                fs.createWriteStream(actualdest),
                { mode: parseInt(tree.mode, 8) }
            )
        }
        else {
            fpipe = fs.createReadStream(
                path.join(__dirname, 'files', tree.source)
            ).pipe(
                fs.createWriteStream(actualdest),
                { mode: parseInt(tree.mode, 8) }
            )
        }
        fpipe.on('error', next)
        fpipe.on('finish', next)
    }, (next) => {
        if (!tree.owner) return next()
        if (!+tree.owner) return next('must provide a uid, username is not supported')
        fs.chown(actualdest, +tree.owner, 0, next)
    }], (err) => {
        if (err) cb(err, { status: 'ERROR', exception: err })
        cb(null, { status: 'file copied' })
    })


}
