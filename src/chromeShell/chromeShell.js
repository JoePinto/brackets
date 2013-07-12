/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global chrome, document */

(function () {
    "use strict";

    var shell    = chrome.app.window.current(),
        appFrame = document.getElementById('app-frame');

    function getBrackets() {
        return appFrame.contentWindow.brackets;
    }

    function quitBrackets() {
        var brackets = getBrackets();

        brackets.shellAPI.executeCommand("file.close_window").always(function () {
            shell.close();
        });
    }

    document.getElementById('close-button').addEventListener('click', quitBrackets, false);

    document.getElementById('maximize-button').addEventListener('click', function (event) {
        if (shell.isMaximized()) {
            shell.restore();
        } else {
            shell.maximize();
        }
    }, false);

    document.getElementById('minimize-button').addEventListener('click', function (event) {
        shell.minimize();
    }, false);


    appFrame.addEventListener('load', function () {
        if (!appFrame.contentWindow.brackets) {
            appFrame.contentWindow.brackets = {};
        }

        var brackets = appFrame.contentWindow.brackets;
        brackets.app = {
            quit: quitBrackets,
            addMenu: function () {
                console.log('adding menu');
            },
            addMenuItem: function () {
                console.log('adding menu item');
            }
        };
    });

}());
