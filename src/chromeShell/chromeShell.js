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
/*global $, define, chrome, document, window */

define(function (require, exports, module) {
    "use strict";

    var currentShell   = chrome.app.window.current(),
        appFrame       = document.getElementById("app-frame"),
        HtmlFileSystem = require("HtmlFileSystem"),
        localStorage   = require("localStorage");
    

    function getBrackets() {
        return appFrame.contentWindow.brackets;
    }

    function quitBrackets() {
        var brackets = getBrackets();
        
        $.when(
            brackets.shellAPI.executeCommand("file.close_window"),
            localStorage.terminate()
        ).always(function () {
            currentShell.close();
        });
    }

    document.getElementById("close-button").addEventListener("click", quitBrackets, false);

    document.getElementById("maximize-button").addEventListener("click", function () {
        if (currentShell.isMaximized()) {
            currentShell.restore();
        } else {
            currentShell.maximize();
        }
    }, false);

    document.getElementById("minimize-button").addEventListener("click", function () {
        currentShell.minimize();
    }, false);
    
    
    
    function loadBrackets() {
        appFrame.src = "/index.html";
    }
    
    // create the global object
    var brackets = {
        app: {
            quit: quitBrackets,
            addMenu: function () {
                console.log("adding menu");
            },
            addMenuItem: function () {
                console.log("adding menu item");
            }
        }
    };
    
    // Initialize APIs before loading brackets
    $.when(
        HtmlFileSystem.initialize(),
        localStorage.initialize()
    ).done(function (fs, localStorage) {
        brackets.fs = fs;
        brackets.localStorage = localStorage;
        console.log("shell initialized");
        loadBrackets();
    });

    appFrame.addEventListener("load", function () {
        appFrame.contentWindow.brackets = brackets;
    });

});
