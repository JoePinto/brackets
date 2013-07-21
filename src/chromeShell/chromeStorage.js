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
/*global define, window, chrome */
define(function (require, exports, module) {
    "use strict";
    
    var chrome = require("chrome");
    
    var _db = {};
    
    
    
    function _saveDb() {
        return chrome.storage.local.set({
            localStorageDb: _db
        });
    }
    
    
    
    function getItem(key) {
        var value = _db[key];
        if (typeof value === "undefined") {
            return null;
        }
        return value;
    }
    
    function setItem(key, value) {
        _db[key] = value;
        _saveDb();
    }
    
    function removeItem(key) {
        delete _db[key];
        _saveDb();
    }
    
    var localStorage = {
        getItem: getItem,
        setItem: setItem,
        removeItem: removeItem
    };
    
    
    
    
    function initialize() {
        return chrome.storage.local.get({
            localStorageDb: _db
        }).pipe(function (items) {
            _db = items.localStorageDb;
            return localStorage;
        });
    }
    
    exports.initialize = initialize;
    
});
