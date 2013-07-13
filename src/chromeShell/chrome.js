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
/*global $, define, window, chrome */

/**
 * Shims for deferred chrome APIs
 */
define(function (require, exports, module) {
    "use strict";

    function StorageArea(area) {
        this.area = area;
    }
    
    StorageArea.prototype.get = function (keys) {
        var deferred = new $.Deferred();
        this.area.get(keys, function (items) {
            if (chrome.runtime.lastError) {
                deferred.reject(chrome.runtime.lastError);
            } else {
                deferred.resolve(items);
            }
        });
        return deferred.promise();
    };
    
    StorageArea.prototype.getBytesInUse = function (keys) {
        var deferred = new $.Deferred();
        this.area.getBytesInUse(keys, function (bytesInUse) {
            if (chrome.runtime.lastError) {
                deferred.reject(chrome.runtime.lastError);
            } else {
                deferred.resolve(bytesInUse);
            }
        });
        return deferred.promise();
    };
    
    StorageArea.prototype.set = function (items) {
        var deferred = new $.Deferred();
        this.area.set(items, function () {
            if (chrome.runtime.lastError) {
                deferred.reject(chrome.runtime.lastError);
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise();
    };
    
    StorageArea.prototype.remove = function (keys) {
        var deferred = new $.Deferred();
        this.area.remove(keys, function () {
            if (chrome.runtime.lastError) {
                deferred.reject(chrome.runtime.lastError);
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise();
    };
    
    StorageArea.prototype.clear = function () {
        var deferred = new $.Deferred();
        this.area.clear(function () {
            if (chrome.runtime.lastError) {
                deferred.reject(chrome.runtime.lastError);
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise();
    };
    
    var storage = {};
    storage.local = new StorageArea(chrome.storage.local);
    storage.sync  = new StorageArea(chrome.storage.sync);
    
    exports.storage = storage;
    
});
