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
    
    var errorCodes = {
        NO_ERROR                 : 0,
        ERR_UNKNOWN              : 1,
        ERR_INVALID_PARAMS       : 2,
        ERR_NOT_FOUND            : 3,
        ERR_CANT_READ            : 4,
        ERR_UNSUPPORTED_ENCODING : 5,
        ERR_CANT_WRITE           : 6,
        ERR_OUT_OF_SPACE         : 7,
        ERR_NOT_FILE             : 8,
        ERR_NOT_DIRECTORY        : 9,
        ERR_FILE_EXISTS          : 10
    };
    
    function mapError(error) {
        return errorCodes.NO_ERROR;
    }
    
    function createErrorHandler(callback) {
        return function handler(error) {
            var msg = '';
            
            switch (error.code) {
            case window.FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case window.FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case window.FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case window.FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case window.FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
            }
            
            console.error('Error: ' + msg);
            
            if (typeof callback === "function") {
                callback(error, null);
            }
        };
    }
    
    
    function readdir(path, callback) {
        console.log("READ DIR: " + path);
        
        var errorHandler = createErrorHandler(callback);

        if (path === "/") {
            var dirReader = fs.root.createReader();
            dirReader.readEntries(function (results) {
                var entries = [],
                    i;
                for (i = 0; i < results.length; i++) {
                    entries[i] = results[i].name;
                }
                callback(errorCodes.NO_ERROR, entries);
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
                    callback(errorCodes.NO_ERROR, results);
                }, errorHandler);
            }, errorHandler);
        }
    }
    
    function makedir(path, mode, callback) {
        console.log('makedir ' + path);
        
        var errorHandler = createErrorHandler(callback);
        
        fs.root.getDirectory(path, {create: true}, function () {
            callback(errorCodes.NO_ERROR);
        }, errorHandler);
    }
	
	
	
	
    
    function stat(path, callback) {
        console.log("STAT:" + path);
        
        var errorHandler = createErrorHandler(callback);
	   
        if (path === "/") {
            callback(errorCodes.NO_ERROR, {
                isFile: function () {
                    return false;
                },
                isDirectory: function () {
                    return true;
                },
                mtime: 0
            });
        } else {
	  
            if (path.indexOf(".") !== -1) {
                fs.root.getFile(path, {create : false}, function () {
                    callback(errorCodes.NO_ERROR, {
                        isFile: function () {
                            return true;
                        },
                        isDirectory: function () {
                            return false;
                        },
                        mtime: 0
                    });

                }, function () {
                    callback(errorCodes.ERR_NOT_FOUND, {});
                });
 
            } else {
                
                fs.root.getDirectory(path, {create : false}, function () {
                    callback(errorCodes.NO_ERROR, {
                        isFile: function () {
                            return false;
                        },
                        isDirectory: function () {
                            return true;
                        },
                        mtime: 0
                    });
                    
                }, function () {
                    callback(errorCodes.ERR_NOT_FOUND, {});
                });
            }
	  
	   
        }
    }
    
    function readFile(path, encoding, callback) {
        
        var errorHandler = createErrorHandler(callback);
        
        fs.root.getFile(path, {}, function (fileEntry) {

            // Get a File object representing the file,
            // then use FileReader to read its contents.
            fileEntry.file(function (file) {
                var reader = new window.FileReader();
        
                reader.onloadend = function (e) {
                    var result = e.target.result;
                    callback(errorCodes.NO_ERROR, result);
                };
        
                reader.readAsText(file);
            }, errorHandler);
        
        }, errorHandler);
    }
    
    function writeFile(path, data, encoding, callback) {
        
        var errorHandler = createErrorHandler(callback);
        
        fs.root.getFile(path, {create: true}, function (fileEntry) {

            // Create a FileWriter object for our FileEntry (log.txt).
            fileEntry.createWriter(function (fileWriter) {

                fileWriter.onwriteend = function (e) {

                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.truncate(blob.size);
                        fileWriter.onwriteend = function (e) {
                            console.log('Write completed.');
                            callback(errorCodes.NO_ERROR);
                        };
                    });
                    
                };
    
                fileWriter.onerror = function (e) {
                    console.log('Write failed: ' + e.toString());
                };
    
                // Create a new Blob and write it to log.txt.
                var blob = new window.Blob([data], {type: 'text/plain'});
    
                fileWriter.write(blob);
    
            }, errorHandler);
    
        }, errorHandler);
    }
    
    function rename(oldPath, newPath, callback) {
        console.log("RENAME: " + oldPath);
        
        var errorHandler = createErrorHandler(callback);
        
        var newDirName = newPath.substr(0, newPath.lastIndexOf("/") + 1),
            newFileName = newPath.substr(newPath.lastIndexOf("/") + 1);
        
        fs.root.getFile(oldPath, {create: false}, function (fileEntry) {
            if (newDirName === "/") {
                fileEntry.moveTo(fs.root, newFileName, function () {
                    callback(errorCodes.NO_ERROR);
                }, callback);
            } else {
            
                fs.root.getDirectory(newDirName, {create: true}, function (dirEntry) {
                    fileEntry.moveTo(dirEntry, newFileName, function () {
                        callback(errorCodes.NO_ERROR);
                    }, callback);
                }, callback);
                
            }
        }, callback);
    
    }
	
    function unlink(path, callback) {
        console.log("DELETE: " + path);
        
        var errorHandler = createErrorHandler(callback);
        
        if (path.indexOf(".") !== -1) {
            fs.root.getFile(path, {create: false}, function (fileEntry) {

                fileEntry.remove(function () {
                    callback(errorCodes.NO_ERROR);
                }, errorHandler);

            }, errorHandler);
	
        } else {
	
            fs.root.getDirectory(path, {}, function (dirEntry) {

                dirEntry.removeRecursively(function () {
                    callback(errorCodes.NO_ERROR);
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
            NO_ERROR                 : errorCodes.NO_ERROR,
            ERR_UNKNOWN              : errorCodes.ERR_UNKNOWN,
            ERR_INVALID_PARAMS       : errorCodes.ERR_INVALID_PARAMS,
            ERR_NOT_FOUND            : errorCodes.ERR_NOT_FOUND,
            ERR_CANT_READ            : errorCodes.ERR_CANT_READ,
            ERR_UNSUPPORTED_ENCODING : errorCodes.ERR_UNSUPPORTED_ENCODING,
            ERR_CANT_WRITE           : errorCodes.ERR_CANT_WRITE,
            ERR_OUT_OF_SPACE         : errorCodes.ERR_OUT_OF_SPACE,
            ERR_NOT_FILE             : errorCodes.ERR_NOT_FILE,
            ERR_NOT_DIRECTORY        : errorCodes.ERR_NOT_DIRECTORY,
            ERR_FILE_EXISTS          : errorCodes.ERR_FILE_EXISTS
        };
    }



    
    function initialize() {
        var result = new $.Deferred();
        window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024 * 1024 * 1024, function (htmlFileSystem) {
            var fs = onInitFs(htmlFileSystem);
            result.resolve(fs);
        }, function (err) {
            console.error("error while initializing fs");
            result.reject(err);
        });
        return result.promise();
    }
    
    exports.initialize = initialize;
    
});
