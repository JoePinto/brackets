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
/*global $, define, window */
define(function (require, exports, module) {
    "use strict";
	
    var fs = null;
    
    var NO_ERROR                 = 0,
        ERR_UNKNOWN              = 1,
        ERR_INVALID_PARAMS       = 2,
        ERR_NOT_FOUND            = 3,
        ERR_CANT_READ            = 4,
        ERR_UNSUPPORTED_ENCODING = 5,
        ERR_CANT_WRITE           = 6,
        ERR_OUT_OF_SPACE         = 7,
        ERR_NOT_FILE             = 8,
        ERR_NOT_DIRECTORY        = 9,
        ERR_FILE_EXISTS          = 10;
    
    
    // Map filesystem errors to brackets errors
    var _errorMap = {};
    _errorMap[window.FileError.ABORT_ERR]                   = ERR_UNKNOWN;
    _errorMap[window.FileError.ENCODING_ERR]                = ERR_UNSUPPORTED_ENCODING;
    _errorMap[window.FileError.INVALID_MODIFICATION_ERR]    = ERR_CANT_WRITE;
    _errorMap[window.FileError.INVALID_STATE_ERR]           = ERR_UNKNOWN;
    _errorMap[window.FileError.NOT_FOUND_ERR]               = ERR_NOT_FOUND;
    _errorMap[window.FileError.NOT_READABLE_ERR]            = ERR_CANT_READ;
    _errorMap[window.FileError.NO_MODIFICATION_ALLOWED_ERR] = ERR_CANT_WRITE;
    _errorMap[window.FileError.PATH_EXISTS_ERR]             = ERR_FILE_EXISTS;
    _errorMap[window.FileError.QUOTA_EXCEEDED_ERR]          = ERR_OUT_OF_SPACE;
    _errorMap[window.FileError.SECURITY_ERR]                = ERR_UNKNOWN;
    _errorMap[window.FileError.SYNTAX_ERR]                  = ERR_UNKNOWN;
    _errorMap[window.FileError.TYPE_MISMATCH_ERR]           = ERR_UNKNOWN;
    
    function _traceError(error, source, path) {
        var key;
        for (key in window.FileError) {
            if (window.FileError.hasOwnProperty(key)) {
                
                if (window.FileError[key] === error.code) {
                    console.error(key + " in " + source + " (path:" + path + ")");
                    return;
                }
                
            }
        }
        
        console.error("Error unknow: " + path);
    }

    function _mapFileError(error) {
        var bracketsError = _errorMap[error.code];
        if (typeof bracketsError === "undefined") {
            bracketsError = ERR_UNKNOWN;
        }
        return bracketsError;
    }
    
    
    function _createFsErrorHandler(callback, source, path) {
        return function handler(error) {
            _traceError(error, source, path);
            callback(_mapFileError(error));
        };
    }
    
    
    
    
    
    var _entryType = {
        FILE: "file",
        DIRECTORY: "directory"
    };
    
    
    function Stats(type, mtime) {
        this._type = type;
        this.mtime = mtime;
    }
    
    Stats.prototype.isFile = function () {
        return (this._type === _entryType.FILE);
    };
	
    Stats.prototype.isDirectory = function () {
        return (this._type === _entryType.DIRECTORY);
    };
    
    
    
    
    
    
    function readdir(path, callback) {
        console.log("READ DIR: " + path);
        
        var errorHandler = _createFsErrorHandler(callback, "readdir", path);

        if (path === "/") {
            var dirReader = fs.root.createReader();
            dirReader.readEntries(function (results) {
                var entries = [],
                    i;
                for (i = 0; i < results.length; i++) {
                    entries[i] = results[i].name;
                }
                callback(NO_ERROR, entries);
            }, errorHandler);
  
        } else {
            fs.root.getDirectory(path, {}, function (dirEntry) {
                var dirReader = dirEntry.createReader();
                dirReader.readEntries(function (entries) {
                    var results = [],
                        i;
                    for (i = 0; i < entries.length; i++) {
                        results[i] = entries[i].name;
                    }
                    callback(NO_ERROR, results);
                }, errorHandler);
            }, errorHandler);
        }
    }
    
    function makedir(path, mode, callback) {
        console.log('makedir ' + path);
        
        var errorHandler = _createFsErrorHandler(callback, "makedir", path);
        
        fs.root.getDirectory(path, {create: true}, function () {
            callback(NO_ERROR);
        }, errorHandler);
    }
	

    function stat(path, callback) {
        console.log("STAT:" + path);
        
        var errorHandler = _createFsErrorHandler(callback, "_getStats", path);
	   
        if (path === "/") {
            callback(NO_ERROR, new Stats(_entryType.DIRECTORY, 0));
        } else {
            var url = fs.root.toURL() + path.substring(1);
            window.webkitResolveLocalFileSystemURL(url, function (entry) {
                var entryType = null;
                if (entry.isDirectory) {
                    entryType = _entryType.DIRECTORY;
                } else if (entry.isFile) {
                    entryType = _entryType.FILE;
                }
                    
                entry.getMetadata(function (metadata) {
                    var stats = new Stats(entryType, metadata.modificationTime);
                    callback(NO_ERROR, stats);
                }, errorHandler);
            }, errorHandler);
            return;
        }
    }
    
    function readFile(path, encoding, callback) {
        console.log("READ FILE: " + path);
        
        var errorHandler = _createFsErrorHandler(callback, "readFile", path);
        
        fs.root.getFile(path, {}, function (fileEntry) {

            // Get a File object representing the file,
            // then use FileReader to read its contents.
            fileEntry.file(function (file) {
                var reader = new window.FileReader();
        
                reader.onloadend = function (e) {
                    var result = e.target.result;
                    callback(NO_ERROR, result);
                };
                
                reader.onerror = function (e) {
                    callback(ERR_CANT_READ);
                };
        
                reader.readAsText(file);
            }, errorHandler);
        
        }, errorHandler);
    }
    
    function writeFile(path, data, encoding, callback) {
        
        var errorHandler = _createFsErrorHandler(callback, "writeFile", path);
        
        fs.root.getFile(path, {create: true}, function (fileEntry) {

            // Create a FileWriter object for our FileEntry (log.txt).
            fileEntry.createWriter(function (fileWriter) {

                fileWriter.onwriteend = function (e) {
                    if (fileWriter.position < fileWriter.length) {
                        fileWriter.truncate(fileWriter.position);
                        // trucate() triggers onwriteend which can then call callback
                    } else {
                        callback(NO_ERROR);
                    }
                };
    
                fileWriter.onerror = function (e) {
                    callback(ERR_CANT_WRITE);
                };
    
                // Create a new Blob and write it to log.txt.
                var blob = new window.Blob([data], {type: 'text/plain'});
                fileWriter.write(blob);
    
            }, errorHandler);
    
        }, errorHandler);
    }
    
    function rename(oldPath, newPath, callback) {
        console.log("RENAME: " + oldPath);
        
        var errorHandler = _createFsErrorHandler(callback, "rename", oldPath + " => " + newPath);
        
        var newDirName = newPath.substr(0, newPath.lastIndexOf("/") + 1),
            newFileName = newPath.substr(newPath.lastIndexOf("/") + 1);
        
        fs.root.getFile(oldPath, {create: false}, function (fileEntry) {
            if (newDirName === "/") {
                fileEntry.moveTo(fs.root, newFileName, function () {
                    callback(NO_ERROR);
                }, errorHandler);
            } else {
            
                fs.root.getDirectory(newDirName, {create: true}, function (dirEntry) {
                    fileEntry.moveTo(dirEntry, newFileName, function () {
                        callback(NO_ERROR);
                    }, errorHandler);
                }, errorHandler);
                
            }
        }, errorHandler);
    
    }
	
    function unlink(path, callback) {
        console.log("DELETE: " + path);
        
        var errorHandler = _createFsErrorHandler(callback, "unlink", path);
        
        if (path.indexOf(".") !== -1) {
            fs.root.getFile(path, {create: false}, function (fileEntry) {

                fileEntry.remove(function () {
                    callback(NO_ERROR);
                }, errorHandler);

            }, errorHandler);
	
        } else {
	
            fs.root.getDirectory(path, {}, function (dirEntry) {

                dirEntry.removeRecursively(function () {
                    callback(NO_ERROR);
                }, errorHandler);

            }, errorHandler);
	
        }
    }

    
    function showOpenDialog(allowMultipleSelection, chooseDirectory, title, initialPath, fileTypes, callback) {
        alert("File/directory chooser not implemented yet");
        if (chooseDirectory) {
            callback(0, "/");
        } else {
            callback(1);
        }
    }
    
	
    function onInitFs(filesystem) {
        console.log('Opened file system: ' + filesystem.name);

        fs = filesystem;
        
        return {
            readdir                  : readdir,
            makedir                  : makedir,
            stat                     : stat,
            readFile                 : readFile,
            writeFile                : writeFile,
            rename                   : rename,
            moveToTrash              : unlink,
            showOpenDialog           : showOpenDialog,
            
            // Error codes
            NO_ERROR                 : NO_ERROR,
            ERR_UNKNOWN              : ERR_UNKNOWN,
            ERR_INVALID_PARAMS       : ERR_INVALID_PARAMS,
            ERR_NOT_FOUND            : ERR_NOT_FOUND,
            ERR_CANT_READ            : ERR_CANT_READ,
            ERR_UNSUPPORTED_ENCODING : ERR_UNSUPPORTED_ENCODING,
            ERR_CANT_WRITE           : ERR_CANT_WRITE,
            ERR_OUT_OF_SPACE         : ERR_OUT_OF_SPACE,
            ERR_NOT_FILE             : ERR_NOT_FILE,
            ERR_NOT_DIRECTORY        : ERR_NOT_DIRECTORY,
            ERR_FILE_EXISTS          : ERR_FILE_EXISTS
        };
    }


    var _createPromise = null;
    
    function get() {
        if (!_createPromise) {
            var deferred = new $.Deferred();
            _createPromise = deferred.promise();
            
            window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024 * 1024 * 1024, function (htmlFileSystem) {
                var fs = onInitFs(htmlFileSystem);
                deferred.resolve(fs);
            }, function (err) {
                console.error("error while initializing fs");
                deferred.reject(err);
            });
        }
        
        return _createPromise;
    }
    
    exports.get = get;
    
});
