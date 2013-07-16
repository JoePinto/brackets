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
    
    var Window         = require("ui/Window"),
        AppFrame       = require("ui/AppFrame"),
        HtmlFileSystem = require("HtmlFileSystem"),
        localStorage   = require("localStorage"),
        NativeApp      = require("liveDevelopment/NativeApp"),
        HttpServer     = require("liveDevelopment/HttpServer");
    
    
    // create the global object
    window.brackets = {
        app: {
            quit: Window.close,
            addMenu: function () {
                console.log("adding menu");
            },
            addMenuItem: function () {
                console.log("adding menu item");
            },
            getNodeState: function () {
                console.error("node not supported");
            },
            openLiveBrowser: NativeApp.openLiveBrowser,
            closeLiveBrowser: NativeApp.closeLiveBrowser,
            closeAllLiveBrowsers: NativeApp.closeAllLiveBrowsers,
            openURLInDefaultBrowser: NativeApp.openURLInDefaultBrowser
        }
    };

    // Initialize APIs before loading brackets
    $.when(
        HtmlFileSystem.initialize(),
        localStorage.initialize()
    ).done(function (fs, localStorage) {
        window.brackets.fs = fs;
        window.brackets.localStorage = localStorage;
        console.log("shell initialized");
        AppFrame.load();
        
        var server = new HttpServer(fs);
        var tcpport = Math.floor(Math.random() * (25000 - 20000 + 1)) +  20000;
        server.listen("127.0.0.1", tcpport);
        window.brackets.fs.tcpport = tcpport;
        
    });
    
    function executeCloseCommand() {
        window.brackets.shellAPI.executeCommand("file.close_window");
    }
    
    Window.onBeforeClose(
        executeCloseCommand,
        localStorage.terminate
    );
    
    $(AppFrame).on("titleChanged", function (event, title) {
        Window.setTitle(title);
    });
    
});
