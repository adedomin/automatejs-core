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

var spawn = require('child_process').exec

module.exports = (args, cb) => {

    if (typeof args === 'string') {
        args = {
            command: args
        }
    }

    var out = '', 
        err = '',
        timedout = false,
        timeout = 30
    if (!args.command) return cb('no command to execute', {
        status: 'nothing to execute'
    })
    if (args.timeout) timeout = args.timeout 

    var cmd = spawn(args.command)
    var timeout_timer = setTimeout(() => {
        timedout = true
        cmd.kill()
    }, 1000 * timeout)

    cmd.stdout.on('data', (data) => {
        out += data
    })

    cmd.stderr.on('data', (data) => {
        err += data
    })

    cmd.on('error', (error) => {
        clearTimeout(timeout)
        cb(error, {
            status: 'error occured',
            exception: error,
            stdout: out,
            stderr: err
        })
    })

    cmd.on('close', (code) => {
        clearTimeout(timeout_timer)
        if (timedout) cb('timed out', {
            status: 'timed out, took too long to exec',
            code: code,
            stdout: out,
            stderr: err
        })
        else if (code > 0) cb('exit code is greater than zero', {
            status: 'potential failure, exit code greater than zero',
            code: code,
            stdout: out,
            stderr: err
        })
        else cb(null, {
            status: 'executed successfully',
            code: code,
            stdout: out,
            stderr: err
        })
    })
}
