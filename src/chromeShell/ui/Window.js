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
    
    
    
    var states = {
        MAXIMIZED: "windowstate-maximized",
        MINIMIZED: "windowstate-minimized",
        NORMAL:    "windowstate-normal"
    };
    
    var currentWindow = chrome.app.window.current();
    var $exports = $(exports);
    
    
    function getState() {
        if (currentWindow.isMaximized()) {
            return states.MAXIMIZED;
        } else if (currentWindow.isMinimized()) {
            return states.MINIMIZED;
        } else {
            return states.NORMAL;
        }
    }
    
    
    function _htmlSetState() {
        var currentState = getState();
        var $html = $(document.body);
        
        [
            states.MAXIMIZED,
            states.MINIMIZED,
            states.NORMAL
        ].forEach(function (state) {
            if (state === currentState) {
                $html.addClass(state);
            } else {
                $html.removeClass(state);
            }
        });
    }
    
    function maximize() {
        currentWindow.maximize();
    }
    
    function minimize() {
        currentWindow.minimize();
    }
    
    function restore() {
        currentWindow.restore();
    }
    
    currentWindow.onMaximized.addListener(_htmlSetState);
    currentWindow.onMinimized.addListener(_htmlSetState);
    currentWindow.onRestored.addListener(_htmlSetState);
    _htmlSetState();
    
    var _onBeforeCloseHandlers = [];
    
    function onBeforeClose(handler) {
        var i;
        for (i = 0; i < arguments.length; i++) {
            _onBeforeCloseHandlers.push(arguments[i]);
        }
    }
    
    function close() {
        var promises = [];
        _onBeforeCloseHandlers.forEach(function (handler) {
            promises.push(handler());
        });
        
        $.when.apply(window, promises).always(function () {
            currentWindow.close();
        });
    }
    
    
    
    var $minimizeButton = $("#window-controls .minimize"),
        $maximizeButton = $("#window-controls .maximize"),
        $restoreButton  = $("#window-controls .restore"),
        $closeButton    = $("#window-controls .close");
    
    
    $minimizeButton.on("click", minimize);
    $maximizeButton.on("click", maximize);
    $restoreButton.on("click", restore);
    $closeButton.on("click", close);
    
    
    
    var $title = $("#title-bar .title");
    
    function setTitle(title) {
        $title.text(title);
    }
    
    
    
    
    exports.getState      = getState;
    exports.maximize      = maximize;
    exports.minimize      = minimize;
    exports.restore       = restore;
    exports.close         = close;
    exports.onBeforeClose = onBeforeClose;
    exports.setTitle = setTitle;
    
    exports.MAXIMIZED     = states.MAXIMIZED;
    exports.MINIMIZED     = states.MINIMIZED;
    exports.NORMAL        = states.NORMAL;
    
});
