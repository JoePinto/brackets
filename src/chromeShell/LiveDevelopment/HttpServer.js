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
/*global $, brackets, define, window, chrome */

define(function (require, exports, module) {
    "use strict";
    
    
    //Create HTTP Server
    var socket = chrome.socket;

  
    var stringToUint8Array = function (string) {

        var buffer = new window.ArrayBuffer(string.length);
        var view = new window.Uint8Array(buffer);
        var i;
        for (i = 0; i < string.length; i++) {
            view[i] = string.charCodeAt(i);
        }
        return view;
    };

    var arrayBufferToString = function (buffer) {
 
        var str = '';
        var uArrayVal = new window.Uint8Array(buffer);
        var s;
        for (s = 0; s < uArrayVal.length; s++) {
            str += String.fromCharCode(uArrayVal[s]);
        }
        return str;
    };
    
    
    
    function HttpServer(filesystem) {
        this.fs = filesystem;
        this.socketId = null;
        
        var _this = this;
        
        
    }
    
    
    //Listen on Server
    HttpServer.prototype.onAccept = function (acceptInfo) {
        var _this = this;
        
        if (acceptInfo.resultCode < 0) {
            socket.destroy(acceptInfo.socketId);
            socket.accept(_this.serverSocketId, _this.onAccept.bind(_this));
            return;
        }
        
        // This is a request that the system is processing. 
        // Read the data.
        socket.read(acceptInfo.socketId, function (readInfo) {
            if (readInfo.resultCode < 0) {
                socket.destroy(acceptInfo.socketId);
                socket.accept(_this.serverSocketId, _this.onAccept.bind(_this));
                return;
            }
            
            // Parse the request.
            var request = arrayBufferToString(readInfo.data).split("\n")[0];
            console.log("Request: " + request);
            var parts = request.split(" ");
            var requesttype = parts[0];
            var requestfile = parts[1];
            
            if (requesttype === "GET") {
            
                requestfile = decodeURI(requestfile);
            
                _this.fs.readFile(requestfile, null, function (error, result) {
                    if (error.code) {
                        _this.writeResponse(acceptInfo.socketId, false, "404 Not Found", "text/html", "", true);
                    } else {
                        _this.writeResponse(acceptInfo.socketId, false, "200 OK", "text/html", result, true);
                    }
                });
        
            } else {
                socket.destroy(acceptInfo.socketId);
                socket.accept(_this.serverSocketId, _this.onAccept.bind(_this));
            }
       
        });
    };
    
    
    HttpServer.prototype.writeResponse = function (socketId, keepAlive, responsecode, contenttype, data, headers) {
        var newdata = stringToUint8Array(data);
        var header;
        if (headers === true) {
            header =
                "HTTP/1.0 " + responsecode + "\r\n" +
                "Content-length: " + newdata.byteLength + "\r\n" +
                "Content-type:" + contenttype + "\r\n" +
                "\r\n" +
                data;
        } else {
            header = data;
        }
        header = stringToUint8Array(header);
      
        var outputBuffer = new window.ArrayBuffer(header.byteLength);
        var view = new window.Uint8Array(outputBuffer);
        view.set(header, 0);
       
        var _this = this;
    
        socket.write(socketId, outputBuffer, function (writeInfo) {
            if (writeInfo.resultCode < 0) {
                console.error("write error: " + writeInfo.resultCode);
                return;
            }
          
            console.log("Written " + writeInfo.bytesWritten + " bytes");
            
            socket.destroy(socketId);
            socket.accept(_this.serverSocketId, _this.onAccept.bind(_this));
      
        });
    };
    

    
    
    HttpServer.prototype.listen = function (address, port) {
        var _this = this;
        socket.create("tcp", {}, function (socketInfo) {
            console.log("HTTP Server Created");
            _this.serverSocketId = socketInfo.socketId;
            socket.listen(_this.serverSocketId, address, port, 20, function (result) {
                //Accept the first response
                socket.accept(_this.serverSocketId, _this.onAccept.bind(_this));
                console.log("listening on " + address + ":" + port);
            });
        });
    };
    
    module.exports = HttpServer;
    
    
});