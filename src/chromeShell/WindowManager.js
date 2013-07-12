
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global chrome */

(function () {
    "use strict";

    var defaultState = {
        maximized: true,
        bounds: {
            top: 0,
            left: 0,
            width: 800,
            height: 600
        }
    };

    function getLastState(callback) {
        chrome.storage.local.get({
            lastShellState: defaultState
        }, function (storage) {
            callback(storage.lastShellState);
        });
    }

    function storeState(shell) {
        chrome.storage.local.set({
            lastShellState: {
                maximized: shell.isMaximized() || shell.isMinimized(),
                bounds: shell.getBounds()
            }
        });
    }

    function onShellOpened(shell) {

        getLastState(function (state) {
            if (state.maximized) {
                shell.maximize();
            } else {
                shell.setBounds(state.bounds);
            }
            shell.show();
        });

        shell.onBoundsChanged.addListener(function () {
            storeState(shell);
        });
        shell.onMaximized.addListener(function () {
            storeState(shell);
        });
        shell.onMinimized.addListener(function () {
            storeState(shell);
        });
        shell.onRestored.addListener(function () {
            storeState(shell);
        });
    }

    function openShell() {
        chrome.app.window.create("chromeShell/chromeShell.html", {
            hidden: true,
            frame: "none"
        }, onShellOpened);
    }

    chrome.app.runtime.onLaunched.addListener(openShell);

}());
