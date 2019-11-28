/**
 * @license jQuery webcam plugin v1.0.0 09/12/2010
 * http://www.xarg.org/project/jquery-webcam-plugin/
 *
 * Copyright (c) 2010, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/

(function ($) {

    var webcam_jquery = {

	"extern": null, // external select token to support jQuery dialogs
	"append": true, // append object instead of overwriting

	"width": 320,
	"height": 240,

	"mode": "callback", // callback | save | stream

	"swffile": "jscam.swf",
	"quality": 85,

	"debug":	function () {},
	"onCapture":	function () {},
	"onTick":	function () {},
	"onSave":	function () {},
	"onLoad":	function () {}
    };

    window["webcam_jquery"] = webcam_jquery;

    $["fn"]["webcam_jquery"] = function(options) {

	if (typeof options === "object") {
	    for (var ndx in webcam_jquery) {
		if (options[ndx] !== undefined) {
		    webcam_jquery[ndx] = options[ndx];
		}
	    }
	}

	var source = '<object id="XwebcamXobjectX" type="application/x-shockwave-flash" data="'+webcam_jquery["swffile"]+'" width="'+webcam_jquery["width"]+'" height="'+webcam_jquery["height"]+'"><param name="movie" value="'+webcam_jquery["swffile"]+'" /><param name="FlashVars" value="mode='+webcam_jquery["mode"]+'&amp;quality='+webcam_jquery["quality"]+'" /><param name="allowScriptAccess" value="always" /></object>';

	if (null !== webcam_jquery["extern"]) {
	    $(webcam_jquery["extern"])[webcam_jquery["append"] ? "append" : "html"](source);
	} else {
	    this[webcam_jquery["append"] ? "append" : "html"](source);
	}

	var run = 3;
	(_register = function() {
	    var cam = document.getElementById('XwebcamXobjectX');

	    if (cam && cam["capture"] !== undefined) {

		/* Simple callback methods are not allowed :-/ */
		webcam_jquery["capture"] = function(x) {
		    try {
			return cam["capture"](x);
		    } catch(e) {}
		}
		webcam_jquery["save"] = function(x) {
		    try {
			return cam["save"](x);
		    } catch(e) {}
		}
		webcam_jquery["setCamera"] = function(x) {
		    try {
			return cam["setCamera"](x);
		    } catch(e) {}
		}
		webcam_jquery["getCameraList"] = function() {
		    try {
			return cam["getCameraList"]();
		    } catch(e) {}
		}
		webcam_jquery["pauseCamera"] = function() {
		    try {
			return cam["pauseCamera"]();
		    } catch(e) {}
		}		
		webcam_jquery["resumeCamera"] = function() {
		    try {
			return cam["resumeCamera"]();
		    } catch(e) {}
		}
		webcam_jquery["onLoad"]();
	    } else if (0 == run) {
		webcam_jquery["debug"]("error", "Flash movie not yet registered!");
	    } else {
		/* Flash interface not ready yet */
		run--;
		window.setTimeout(_register, 1000 * (4 - run));
	    }
	})();
    }

})(jQuery);
