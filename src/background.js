
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require */

(function () {
    "use strict";
    
    require.config({
        baseUrl: "/chromeShell",
        deps: [ "main" ],
        paths: {
            "jquery": "/thirdparty/jquery-2.0.1.min"
        }
    });
    
}());
