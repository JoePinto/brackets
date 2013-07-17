
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global $, define, chrome, window */

define(function (require, exports, module) {
    "use strict";
    
    var HtmlFileSystem = require("HtmlFileSystem"),
        chromeStorage  = require("chromeStorage"),
        HttpServer     = require("LiveDevelopment/HttpServer"),
        NativeApp      = require("LiveDevelopment/NativeApp");
    
    // so far limited to one window, we need to create a specific global object for each
    // window if we want to support more windows.
    var _bracketsWindow = null;
    
    
    // create the global object
    window.brackets = {
        app: {
            quit: function () {
                _bracketsWindow.close();
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
    var initPromise = $.when(
        HtmlFileSystem.get(),
        chromeStorage.initialize()
    ).done(function (fs, chromeStorage) {
        window.brackets.fs = fs;
        window.brackets.localStorage = chromeStorage;
        console.log("shell initialized");
           
        var server = new HttpServer(fs);
        var tcpport = Math.floor(Math.random() * (25000 - 20000 + 1)) +  20000;
        server.listen("127.0.0.1", tcpport);
        window.brackets.fs.tcpport = tcpport;

    }).promise();
    

    function openApp() {
        chrome.app.window.create("index.html", {
            id: "brackets"
        }, function (bracketsWindow) {
            _bracketsWindow = bracketsWindow;
            bracketsWindow.onClosed.addListener(function () {
                _bracketsWindow.contentWindow.brackets.shellAPI.executeCommand("file.close_window");
            });
        });
    }

    chrome.app.runtime.onLaunched.addListener(openApp);

    
});
