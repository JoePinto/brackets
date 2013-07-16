/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global window, chrome */

(function () {
    "use strict";
    
    var _liveTabId = null;
    
    var TAB_NOT_OPEN = { message: "Live tab not opened" },
        UNKNOWN_COMMAND = { message: "Command not recognized" };
    
    function _trace(msg) {
        console.log(msg);
    }
    
    
    function attachDebugger(callback) {
        if (!_liveTabId) {
            callback({
                error: TAB_NOT_OPEN
            });
            return;
        }
        
        _trace("** Attaching debugger (" + _liveTabId + ") **");
        chrome.debugger.attach({
            tabId: _liveTabId
        }, "1.0", function () {
            if (chrome.runtime.lastError) {
                callback({
                    error: chrome.runtime.lastError
                });
            } else {
                _trace("** Debugger attached **");
                callback({});
            }
        });
    }
    
    function openLiveBrowser(url, enableRemoteDebugging, callback) {
        _trace("** Openening live browser **");
        url =  chrome.runtime.getURL("launch.html");
        chrome.tabs.create({
            url: url,
            active: true
        }, function (tab) {
            _liveTabId = tab.id;
            _trace("** Live browser opened (" + _liveTabId + ") **");
            callback({
                tabId: _liveTabId
            });
        });
    }
    
    function closeLiveBrowser(callback) {
        _trace("** Closing live browser **");
        chrome.debugger.detach({
            tabId: _liveTabId
        }, function () {
            chrome.tabs.remove(_liveTabId);
            _trace("** Live browser closed (" + _liveTabId + ") **");
            _liveTabId = null;
        });
    }
    
    chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
        if (message.cmd === "openLiveBrowser") {
            openLiveBrowser(message.params.url, message.params.enableRemoteDebugging, sendResponse);
        } else if (message.cmd === "closeLiveBrowser") {
            closeLiveBrowser(sendResponse);
        } else if (message.cmd === "getTargets") {
            chrome.debugger.getTargets(sendResponse);
        } else if (message.cmd === "attachDebugger") {
            attachDebugger(sendResponse);
        } else {
            sendResponse({
                error: UNKNOWN_COMMAND
            });
        }
        return true;
    });
    
    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        if (tabId === _liveTabId) {
            _liveTabId = null;
        }
    });
    
    
    chrome.runtime.onConnectExternal.addListener(function (port) {
        _trace("** Port connected (" + port.name + ") **");
        
        function executeCommand(method, params, id) {
            if (!_liveTabId) {
                port.postMessage({
                    error: TAB_NOT_OPEN
                });
                return;
            } else {
                chrome.debugger.sendCommand({
                    tabId: _liveTabId
                }, method, params, function (result) {
                    _trace("EXECUTED COMMAND: " + method + " " + JSON.stringify(params));
                    if (chrome.runtime.lastError) {
                        port.postMessage({
                            id: id,
                            error: chrome.runtime.lastError
                        });
                        return;
                    }
                    port.postMessage({
                        id: id,
                        result: result
                    });
                });
            }
        }
        
    
        port.onMessage.addListener(function (message) {
            if (message.cmd === "sendCommand") {
                executeCommand(message.method, message.params, message.id);
            } else {
                port.postMessage({
                    error: UNKNOWN_COMMAND
                });
            }
        });
        
        function onEvent(source, method, params) {
            _trace("EVENT: " + method);
            port.postMessage({
                method: method,
                params: params
            });
        }
        
        function onDetach(source, reason) {
            _trace("** Debugger detached **");
            chrome.debugger.onEvent.removeListener(onEvent);
            chrome.debugger.onDetach.removeListener(onDetach);
            port.disconnect();
            _trace("** Port disconnected (" + port.name + ") **");
            port = null;
        }
        
        chrome.debugger.onEvent.addListener(onEvent);
        chrome.debugger.onDetach.addListener(onDetach);
    });

}());
    
