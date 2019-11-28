var camera_detected = false;
var webcamType="";
var moduleIframeName = {
        "main": "sephoralivetryon_frame",
        "takephoto": "sephoralivetryon_frame_takephoto",
        "preview": "sephoralivetryon_frame_preview",
        "compare": "sephoralivetryon_frame_compare"
};

var cw=new checkWebcam();
var cwparams={}; // possible attributes are 'flash_timeout', 'check_type', 'num_check'
var local_image = new localImage();

// object constructors
function localImage() {

    // before or after makeup has been applied
    this.src_before = "";
    this.src_after = "";
    this.width = 0;
    this.height = 0;
    this.facepoints = null;
    return this;
}

function Point2D(x, y) {
    if (typeof x != "undefined" && typeof y != "undefined") {
        this.x = x;
        this.y = y;
    }
    else {
        this.x = 0;
        this.y = 0;
    }
    return this;
}


function checkWebcamCapability() {
    if(is.mobile() || is.tablet()) {
        return;
    }

    if(is.safari(10)) {
        cwparams['num_check'] = 2;
    }

    cw.fullcheck(cwparams).then(
            function() {
                console.log('fullcheck resolve');
                checkWebcamType();
            },
            function() {
                console.log('fullcheck reject');
                disable_webcam();
            }
            );
}

function checkWebcamType() {
	cw.check_usermedia().then(
		function() {
			//using userMedia
			webcamType = "userMedia";
            console.log('enable live elements');
            camera_detected = true;
            //$('#camera_detected').show();
		},
		function() {
			//using flash
			webcamType = "flash";
		}
	);
}

function enable_webcam() {
	console.log('enable live elements');
    camera_detected = true;
    //$('#camera_detected').show();
}

function disable_webcam() {
	console.log('disable live elements');
    $('#camera_detected').hide();
}

//var webcam=webcam || {};
//1.73, 1.3
var live_zoom = new Object({w_scale : 1.33, h_scale : 1.01});

function initWebCam() {
	if(typeof(Webcam) != "undefined") {
	    var take_photo_width = parseInt($('#takephoto_live_container_inner').css('width'));
    	var take_photo_height = parseInt($('#takephoto_live_container_inner').css('height'));
    	var canvas_width = take_photo_width * live_zoom.w_scale;
    	var canvas_height = take_photo_width * live_zoom.h_scale;
        Webcam.set({
            flip_horiz : true,
            image_format: 'png',
            width: canvas_width,
            height: canvas_height
        });

        $('#camview').css('width', canvas_width);
        $('#camview').css('height', canvas_height);
        $('#camview').css('top', (take_photo_height-canvas_height) / 2.0);
        $('#camview').css('left', (take_photo_width-canvas_width) / 2.0);
        //webcam.flash_notify=function(type,msg){webcam_photo.flash_notify(type,msg);};
        //webcam_photo.set_api_url( 'registerwebcam.php' );
        //webcam_photo.set_quality( 100 ); // JPEG quality (1 - 100)
        //webcam_photo.set_shutter_sound( true ); // play shutter click sound
        //webcam_photo.set_stealth( true );
        //webcam_photo.scaleX=-1;

        //if (!useNewAPI()) {
        //    webcam_photo.set_hook( 'onComplete', 'resultDownloaded' );
        //}
	}
}

navigator.getUserMedia  = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;

// name should also be a unique DOM id
function makeupModuleWrapper(name, parent, _width, _height, _mask_url, _mode, original, cb, _parentWidth, _parentHeight) {
    var self = this;
    self.module = new makeupModule();
    self.parent = parent;
    self.name = name;
    self.ready = false;
    self.show_original = original;
    self.started = false;
    self.paused = true;
    self.has_set_image = false;  // applies only for photo mode
    self.cur_effects = null;

    self.createEffects = function(effects) {
                    self.cur_effects = effects;
                    return self.module.createEffects(self.cur_effects);
                };

    // wrapper functions
    self.start = function(cb) {
                    if (self.module.mode == 'photo')
                        return;
    				if (!self.started) {
    					self.started = true;
    					self.module.show(self.parent, self.name);
    				}
    				else if (self.paused) {
                        var full_cb = function () { if (self.cur_effects != null)
                                                        self.module.createEffects(self.cur_effects);
                                                    if (typeof cb == "function")
                                                        cb();
                                                  }
    					self.module.restart(full_cb);
    				}
    				self.paused = false;
    			};
    self.pause = function() {
                    if (self.module.mode == 'photo' || !self.started)
                        return;
    				self.module.pause();
    				self.paused = true;
    			};

    self.setImage = function(src, width, height) {
                    return self.module.setImage(src, width, height);
                }

    var promise = self.module.create({width: _width, height: _height, pathToMask: _mask_url, mode: _mode,
                                      parentWidth: _parentWidth, parentHeight: _parentHeight});
    promise.then
    (
    	function() {
	        console.log("module " + name + " is ready");
	        self.ready = true;
            --num_unprepared_modules;
            if (self.module.mode == 'photo')
                self.module.show(self.parent, self.name);
            if (num_unprepared_modules == 0 && typeof cb == 'function')
                cb();
	    }
    );
}

var makeup_modules = {};

// initialization safety checks
var num_unprepared_modules = 0;
var api_loaded = false;
var progress_states = Object.freeze({NOT_STARTED:0, LOADING:1, LOADED:2});
var live_modules_progress = progress_states.NOT_STARTED;

// current overall flow of modules:
// 1) live module, along with the smaller live preview module are separate (e.g case where small one must be paused while larger is unpaused)
// 2) captureBefore / Afters from the live modules are sent to 'backend_module', where all refine / adjustments are made
// 3) static images in the main container simply set their src to the dataurl available from 'backend_module'
//    (same as before, when they set src to an image from server)
function initMakeupModules() {
    api_loaded = true;
    var main_width = 655;//$('#makeovercontainer').width();
    var main_height = 510;//$('#makeovercontainer').height();
    var ms = Date.now();
    var mask_url = "sephora5_0.json?random="+ms;
    var cb = photoModulesReady;

    num_unprepared_modules = 1;

    // should be hidden and used for rendering effects only. results are set as src by HTML img elements.
    makeup_modules['backend_canvas'] = new makeupModuleWrapper('backend_canvas', 'mainimcontainer', main_width, main_height, mask_url, 'photo', false, cb);
    //makeup_modules['main_photo_canvas'] = new makeupModuleWrapper('main_photo_canvas', 'mainimcontainer', main_width, main_height, mask_url, 'photo');
}

// if show_preview, restarts preview right after loading
function initLiveModules() {
    if (live_modules_progress == progress_states.LOADING || live_modules_progress == progress_states.LOADED)
        return;

    live_modules_progress = progress_states.LOADING;
    var main_width = 695;
    var main_height = 510;
    var preview_width= parseInt($('#live_preview_container_inner').css('width'));
    var preview_height = parseInt($('#live_preview_container_inner').css('height'));
    var take_photo_width = parseInt($('#takephoto_live_container_inner').css('width'));
    var take_photo_height = parseInt($('#takephoto_live_container_inner').css('height'));
    var ms = Date.now();
    var mask_url = "sephora5_0.json?random="+ms;
    var cb = function() { var show_preview = ($('#edit').css('display') != 'none');
    					  liveModulesReady(show_preview) };

    if (num_unprepared_modules > 0)
        console.error('another initialization is in progress');

    num_unprepared_modules = 1;
    if (page == 'pto') {
        num_unprepared_modules += 2;
        makeup_modules['main_live_canvas'] = new makeupModuleWrapper('main_live_canvas', 'edit_live_container_inner', main_width, main_height, mask_url, 'live', cb);
        makeup_modules['preview_live_canvas'] = new makeupModuleWrapper('preview_live_canvas', 'live_preview_container_inner', live_zoom.w_scale*preview_width, live_zoom.h_scale*preview_height, mask_url, 'live', true, cb,
        																preview_width, preview_height);
    }

    makeup_modules['take_photo_live_canvas'] = new makeupModuleWrapper('take_photo_live_canvas', 'takephoto_live_container_inner', live_zoom.w_scale*take_photo_width, live_zoom.h_scale*take_photo_height, mask_url, 'live', true, cb,
                                                                        take_photo_width, take_photo_height);
}

//camera functions
function start_webcam_flash(viewid) {
  if (!viewid)
    viewid = 'camview';

  webcamuploaded=0;
  //document.getElementById(viewid).innerHTML=webcam_photo.get_html(889,500);
  //document.getElementById(viewid).innerHTML=webcam_photo.get_html(600,300);
  Webcam.attach('#camview');
  hide('canvas_video');
  show('camview');
}

function close_webcam() {
    Webcam.freeze();
}

function processFramePhoto() {
  try {
    if(webcamuploaded==1) {
      return;
    }
    //console.log("process photo frames");
    if(video.paused || video.ended) {
      return;
    }

    var canvas_photo=document.getElementById('canvas_photo');
    var context_photo=canvas_photo.getContext('2d');
    context_photo.clearRect(0, 0, canvas_photo.width, canvas_photo.height);
    context_photo.drawImage(video, 0, 0, mWidth, mHeight);
  } catch(e) {
  }

  setTimeout(processFramePhoto,10);
}

function start_webcam(viewid) {
  // HTML5 Webcam
  navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;
  if( !! navigator.getUserMedia ) {
    if(!video) {
      video=document.getElementById('video');
    }

    addEvent(video,"play",processFramePhoto);

    webcamuploaded=0;

    try {
      navigator.getUserMedia({video: { width: myWidth, height: myHeight }}, startStreamPhoto, errorCallbackPhoto);
    } catch(e) {
      navigator.getUserMedia({video: true}, startStreamPhoto, errorCallbackPhoto);
    }

    webcam_started=1;
    hide('camview');
  } else {
    start_webcam_flash(viewid);
  }
}

function startTakePhotoWebcam(frameReadyCb) {
	$('#webcam_photo_preview').hide();

	if(liveEnabled()) {

		// not much to do here if using the new API
		$('#camview').hide();
		$('#takephoto_live_container_inner').show();

		if (!useNewAPI()) {
			var frameid = moduleIframeName['takephoto'];
			var parentid = "takephoto_live_container_inner";
			webcamuploaded=0;
			if(document.getElementById(frameid) != null)
			    MF_CHANNEL_PARENT.send({event:'start', data:{}},frameid);
            else
				addLiveFrame(frameid,parentid,frameReadyCb);
		}
	} else {
		$('#camview').show();
		$('#takephoto_live_container_inner').hide();
		if(Webcam.loaded) {
			Webcam.unfreeze();

            // webcam module is kind of buggy, it does an extra flip on the canvas
            if (!Webcam.userMedia)
                $('#camview').css('transform', 'scaleX(1)');
		} else {
			start_webcam_flash();
		}
	}
}

function toLiveMode() {
    if (makeup_modules['preview_live_canvas'])
        makeup_modules['preview_live_canvas'].pause();

    // entered from having another static photo
    if (mode() == 'photo')
        live_photo_taken = false;
    if (makeup_modules['main_live_canvas'] && makeup_modules['main_live_canvas'].ready) {
        hide('makeovercontainer');
        show('makeovercontainer_live');
        makeup_modules['main_live_canvas'].start(applyMakeup);
    }
    $('#edit').hide();
    $('#btnRefine').hide();
    fade_out('camera_detected');
    closeRefine(true);
    updateButtonWidth();
  	//resizeSubBar('sub_bar');

	/*var frameReadyCb = function() {
		apply();
	};
    addLiveFrame(moduleIframeName['main'],'edit_live_container_inner',frameReadyCb);*/
}

function initLivePreview() {
    if(document.getElementById('live_preview_container_inner')) {
        if(document.getElementById('live_preview_container_inner').style.display="block") {
            /*if(document.getElementById(moduleIframeName['preview'])) {
                MF_CHANNEL_PARENT.send({event:'start', data:{}},moduleIframeName['preview']);
            } else {
                addLiveFrame(moduleIframeName['preview'],'live_preview_container_inner',justReturn);
            }*/
            return;
        }
    }
}

function shareCB() {

    // need to reload all compare images
    if ($('#tab_compare').css('display') != 'none') {
        updateCompareImages(share);
        //prepareCompareScreen();
    }
    else
        share();

    live_photo_taken = true;
    currentMakeover['remote_id'] = -1;
    //window.setTimeout(share, 1000); // replace with something not so sketchy

	//toLiveMode();
    //applyOnLiveImage(generateShare);
}

function toPhotoMode() {
    hide('makeovercontainer_live');
    show('makeovercontainer');

    if (typeof makeup_modules['main_live_canvas'] != "undefined" && makeup_modules['main_live_canvas'].ready)
        makeup_modules['main_live_canvas'].pause();
}

function takePhotoCB() {
    if (typeof resetToLiveOnClose != "undefined")
        resetToLiveOnClose = false;

    if (!useNewAPI())
        if(document.getElementById(moduleIframeName['main'])) {
                MF_CHANNEL_PARENT.send({event:'stop', data:{}},moduleIframeName['main']);
            }

    successfulUpload(uploaded_mainpic, false, true)
    //positionMakeoverim(uploaded_mainpic);
}

function toTakePhoto(mode) {
    $("#looksgood_btn").off("click");
    $("#looksgood_btn").click(function() {
        looksGood();
    });

    if (useNewAPI() && newAPIReady())
        makeup_modules['take_photo_live_canvas'].start();

    showSnapshotbtn();
    $('#snapshot_btn').off("click");
    var usage = (mode) ? mode : photoUsageStates.PHOTO_DEFAULT;
    $('#snapshot_btn').click(function(){ take_snapshot(usage);} );
    pushPointsDisabled = true;
    prepareTakePhoto(justReturn);

    if(page=="il") {
        trackEventLooks("customize look:take a photo");
    } else {
        trackEvent("take a photo");
    }
}

function addCompareFrame(frameid,parentid) {

	if(document.getElementById(frameid)) {
		return;
	}

	if(document.getElementById(moduleIframeName['main'])) {
		MF_CHANNEL_PARENT.send({event:'stop', data:{}},moduleIframeName['main']);
	}

	var framescript=document.createElement("script");
	var html="MF_CHANNEL_PARENT.addFrame({";
	html+="        frameName : '"+frameid+"',";
	html+="        publisherId : 'sephora4_0',";
	html+="        showOriginal : 1";
	html+="      });";
	framescript.innerHTML=html;

	document.getElementById(parentid).appendChild(framescript);

	var cb=function(iframeName) {
		console.log('apply to');
		apply(moduleIframeName['compare']);
	};

	var error_cb=function(error_msg) {
		console.log('error_cb');
		console.log(error_msg);
	};


	MF_CHANNEL_PARENT.listen('iframe_ready',cb);
	MF_CHANNEL_PARENT.listen('restarted',cb);

	MF_CHANNEL_PARENT.listen('m_create_error',error_cb);
}

function prepareShare() {
	if(mode()=="live") {
		gtm('DASHBOARD MAKEUP 3D','SHARE','SELECTED');
	} else if(modelUsed==1) {
		gtm('DASHBOARD MAKEUP MODEL','SHARE','SELECTED');
	} else {
		gtm('DASHBOARD MAKEUP USER PHOTO','SHARE','SELECTED');
	}

	if(mode()=="live" && makeoverim == "") {
		var loveItCb =function() {
			gtm('SHARE','TAKE PHOTO','SELECTED');
			if(document.getElementById(moduleIframeName['main'])) {
				MF_CHANNEL_PARENT.send({event:'start', data:{}},moduleIframeName['main']);
				var cb=function() {
					startCrop();

					$('#pushPtsDesktop').off("click");
					$('#pushPtsDesktop').click(function() {
							pushPoints(prepareShare);
							});

					$('#pushPtsMobile').off("click");
					$('#pushPtsMobile').click(function() {
							pushPoints(prepareShare);
							});

				};

				MF_CHANNEL_PARENT.listen('restarted',cb);
			}
		};

		var frameReadyCb = function() {
			apply(moduleIframeName['takephoto']);
		};
		var retake_yes_cb = function() {
			startTakePhotoWebcam(frameReadyCb);
		};
		var retake_cancel_cb = function() {
			$('#photo_popup').hide();
			$('#takephoto_popup').hide();
			$('#tryon').show();
			MF_CHANNEL_PARENT.send({event:'stop', data:{}},moduleIframeName['takephoto']);
			MF_CHANNEL_PARENT.send({event:'start', data:{}},moduleIframeName['main']);
		};

		$('#adjust_backtoupload').hide();
		MF_CHANNEL_PARENT.send({event:'stop', data:{}},moduleIframeName['main']);
		prepareTakePhoto(loveItCb,retake_yes_cb,retake_cancel_cb,frameReadyCb,'capture_before');
		return;
	}

	show('popup_share');
	var pos = document.getElementById('mainim');
	var img = document.getElementById('shareim_img');
	img.style.left = pos.style.left;
	img.style.top = pos.style.top;
	img.style.width = pos.style.width;
	img.src = "http://"+apiserver+"/"+appname+"/img/"+makeoverim+".jpg";
}

// premature close
function endTakePhoto() {
    if(document.getElementById(moduleIframeName['takephoto'])) {
        MF_CHANNEL_PARENT.send({event:'stop', data:{}},moduleIframeName['takephoto']);
    }
    fade_out('takePhoto');

    if (useNewAPI())
        makeup_modules['take_photo_live_canvas'].pause();
    else
        Webcam.freeze();
}

function prepareBeforeAfter() {
	$('#popup_beforeafter').show();
	addCompareFrame(moduleIframeName['compare'], "compare_live_container_inner");
}

function prepareTakePhoto(frameReadyCb) {
    closeEdit();
    $('#take_photo_title').text(toLang('Take a Photo', 'en', lang));
	show('takePhoto');
    hide('retake_looksgood');

    //document.getElementById('looksgood_btn').style.opacity = 0.0;
    //document.getElementById('retake_btn').style.opacity = 0.0;
    if(page=="pto") {
        if (makeup_modules['preview_live_canvas'])
            makeup_modules['preview_live_canvas'].pause();
        $('#edit').hide();
    }

	startTakePhotoWebcam(frameReadyCb);
}

var cur_uploaded_pic_info;
var live_facebounds = {}, facebounds = {};

function updatePicParamsFromLocal(image_info) {
    if (!useNewAPI())
        return;

    uploaded_mainpic = image_info.src_before;
    mainim = image_info.src_after;
    mfid = image_info.src_after;
    uploaded_picwidth = image_info.width;
    uploaded_picheight = image_info.height;
    setNewFacePtsFromLocal(image_info);
}

function updatePicParamsFromServer(parts) {
    uploaded_mainpic = parts[2];
    mainimWidth = parseInt(parts[3]);
    mainimHeight = parseInt(parts[4]);
    mainim = parts[1];
    mfid=parts[1];
    uploaded_picwidth=parseInt(parts[3]);
    uploaded_picheight=parseInt(parts[4]);

    facePts['face']=parts[5];
    facePts['leye']=parts[6];
    facePts['reye']=parts[7];
    facePts['lips']=parts[8];
    facePts['teeth']=parts[9];

    // will parse facePts into the same form as the local canvas versions
    setNewFacePts();
}

function resultDownloaded(msg) {
	var a = msg;
	if(a!="") {
		var parts = a.split(":");
        if(parts[0]=="error") {
            if(parts[1]=="noface" || parts[1]=="badface") {
                var translated = toLang("Uh-oh. We couldn't detect your face. Please try again.", 'en', lang);
                document.getElementById('error_popup_txt').innerHTML = translated;
                show("error_popup");
                hide('take_photo_cover');
            }
            if(parts[1]=="filesize") {
                var translated = toLang("Sorry. That image exceeds our file size limit. Please choose a file that is 5MB or smaller.", 'en', lang);
                document.getElementById('error_popup_txt').innerHTML = translated;
                show("error_popup");
                hide('take_photo_cover');
            }
            hide('whitelayer');

            // if using flash, force restart
            if (!liveEnabled()) {
                toTakePhoto();
            }

            return;
        }

        hide('whitelayer');
        cur_uploaded_pic_info = parts;
		var imgip=parts[0];
        var userIm=parts[1];

		if(apiserver!=parts[0]) {
			var xmlHttp=GetXmlHttpObject();
			if (xmlHttp==null) {
				alert("Browser does not support HTTP Request");
				return;
			}
			var url="proxy.php";
			url=url+"?psx=24"
				+"&apiserver="+apiserver
				+"&action=copyfiles"
				+"&id="+userIm
				+"&id2="+uploaded_mainpic
				+"&imgip="+imgip
				+"&myip="+apiserver;
			//alert("myapiserver is: "+apiserver+"; imgserver is: "+imgip);

			xmlHttp.onreadystatechange=function() {
				if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete") {
               //     document.getElementById('webcam_photo_preview').src = "img/"+userIm+".jpg";
				//	document.getElementById('webcam_photo_preview').style.display="block";
                    hide('take_photo_cover');
                    hide('whitelayer');

				}
			}

			xmlHttp.open("GET",url,true);
			xmlHttp.send(null);
		} else {
		//	document.getElementById('webcam_photo_preview').src = "img/"+userIm+".jpg";
	//		document.getElementById('webcam_photo_preview').style.display="block";
            hide('take_photo_cover');
            hide('whitelayer');
		}

        // show additional opts upon successful photo take
        show('retake_looksgood');

        /*
        var looksGoodBtn = document.getElementById('looksgood_btn');
        var retakeBtn = document.getElementById('retake_btn');
        var duration = 400;  // in milliseconds
        if (typeof looksGoodBtn != "undefined")
            $(looksGoodBtn).fadeTo(duration, 1.0);
        if (typeof retakeBtn != "undefined")
            $(retakeBtn).fadeTo(duration, 1.0);
        */
	}
	hideSnapshotbtn();
}

function webcam_startCountDown(loveItCb,captureType) {
    document.getElementById('takephoto_takeyourphoto').innerHTML = "Smile for the camera.";
    timer=3;
    $('#takephoto_startCountdown').hide();
    $('#takephoto_countdown').show();

    webcam_countdown(captureType);

    $('#takephoto_loveit').off("click");
    $('#takephoto_loveit').click(function() {
        webcam_loveIt(loveItCb);
    });
}

function webcam_takeSnapshot() {
    //debugger;
    Webcam.snap(function(data_url) { upload_rawImageData(data_url); } );
    Webcam.freeze();
    //Webcam.freeze();
}

function webcam_retakePhoto() {
	startTakePhotoWebcam();
	$('#webcam_photo_preview').hide();
	$('#takephoto_succeed').hide();
	$('#takephoto_startCountdown').show();
	document.getElementById('takephoto_takeyourphoto').innerHTML = "Take your photo.";
}

function upload_rawImageData(myImageData) {
    var xmlHttp=GetXmlHttpObject();
    if (xmlHttp==null)
    {
        alert("Browser does not support HTTP Request");
        return;
    }

    var url="registerwebcam.php";
    url+="?usermedia=1"
        +"&cachefix="+Math.random();

    var poststr="img="+myImageData;
    xmlHttp.onreadystatechange=function() {
        if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete")
        {
            var result=xmlHttp.responseText;
            resultDownloaded(result);
        }
    }

    xmlHttp.open("POST",url,true);
    xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlHttp.send(poststr);
}


function take_snapshot(mode) {
	photoUsageState = mode;
    pushPointsDisabled = false;
    if(liveEnabled()) {
        if (useNewAPI()) {
            if (newAPIReady()) {
                if (makeup_modules['take_photo_live_canvas'].ready != true)
                    console.error("attempted to take a snapshot when makeup modules weren't ready");

                var src_module = makeup_modules['take_photo_live_canvas'].module;
                makeup_modules['take_photo_live_canvas'].pause();

                var targ_module_wrapper = makeup_modules['backend_canvas'];
                var promise = targ_module_wrapper.setImage(src_module.captureBefore(), src_module.trueWidth, src_module.trueHeight);
                promise.then
                (
                    function(coords) {
                        targ_module_wrapper.has_set_image = true;
                        imageInputSuccess(coords, local_image, targ_module_wrapper.module, src_module.trueWidth, src_module.trueHeight);
                        show('retake_looksgood');
                        $('#take_photo_title').text(toLang('Review Your Photo', 'en', lang));
                        hideSnapshotbtn();
                        modelUsed=0;
                    },
                    function() {
                        var error_txt = document.getElementById('error_popup_txt');
                        error_txt.innerHTML = toLang("Uh-oh. We couldn't detect your face. Please try again.", 'en', lang);
                        show('error_popup');
                        toTakePhoto(mode);  // try again!
                        //console.error('failed to set model image');
                    }
                );
            }
    	}
    	else {
    		MF_CHANNEL_PARENT.send({event:'capture_before', data:''},moduleIframeName['takephoto']);
	        MF_CHANNEL_PARENT.listen('capture_before_complete',function(myImageData) {
	            upload_rawImageData(myImageData);
	        });
    	}
    } else {
        webcam_takeSnapshot();
    }
    //show('whitelayer');
    //show('take_photo_cover');
    if (is.mobile())
        hide('txt440');
}

function looksGood() {
    if (mode() == "photo")
        toPhotoMode();
    else {
    	live_photo_taken = true;
    }

    if (useNewAPI()) {
        updatePicParamsFromLocal(local_image);
    }
    else {
        if(document.getElementById(moduleIframeName['takephoto'])) {
            MF_CHANNEL_PARENT.send({event:'stop', data:{}},moduleIframeName['takephoto']);
        }
        updatePicParamsFromServer(cur_uploaded_pic_info);
    }
    applyMakeup();
    setmain(uploaded_mainpic,true);


    modelUsed=0;
	$('#takePhoto').hide();
    if(page=="pto") {
        if(mode() == "live" || imid=="" || (imid!="" && mainim!=imid)) {
	        if (photoUsageState == photoUsageStates.PHOTO_DEFAULT) {
                successfulUpload(uploaded_mainpic, true);
            }
            else if (photoUsageState == photoUsageStates.SHARE) {
                share();
            }
            else if (photoUsageState == photoUsageStates.COMPARE) {
            	toRefine();
            }
            else
            	console.error('photoUsageState should not be unset at this point');
        }
    } else if (page=="il") {
        resetSkintoneOpts();
        show('skintones');
    }
}

function positionMakeoverImages(img) {
    var local = isLocalImage(img);
    if ($('#mid_section').css('display') == 'none')
        return;

    show('mainimcontainer');
    var width = $('#makeover_windows').width();
    var height = $('#makeover_windows').height();

    var pos = getFittingParams(width, height);
    if (typeof pos == "undefined")
        return;

    var mainim = document.getElementById('mainim');
    mainim.style.opacity = 0;
    mainim.style.left = pos.left;
    mainim.style.top = pos.top;
    mainim.style.width = pos.width;
    mainim.src = (local) ? img : "img/"+img+".jpg";
    mainim.onload = function() { $(mainim).animate({opacity:1})};

    if (page == "il") {

        // copy mainim
        /*var origim = document.getElementById('origim');
        $(origim).offset({left: $(mainim).offset().left});
        $(origim).offset({top: $(mainim).offset().top});
        $(origim).width($(mainim).width());
        $(origim).height($(mainim).height());*/
        origim.style.left = pos.left;
        origim.style.top = pos.top;
        origim.style.width = pos.width;
        origim.src = adjustImageSrc(img);

        // instant looks has an additional image
        var im = document.getElementById('skintone_image');
        if(im != null) {
            minDimW = parseInt($('.skintone_image_container').css('width'));
            minDimH = parseInt($('.skintone_image_container').css('height'));
            pos = getFittingParams(minDimW, minDimH);
            im.style.left = pos.left;
            im.style.top = pos.top;
            im.style.width = pos.width;
            im.src = adjustImageSrc(img);
        }
    }
}

function closeEdit(fade) {
    /*if(document.getElementById(moduleIframeName['preview'])) {
        MF_CHANNEL_PARENT.send({event:'stop', data:{}},moduleIframeName['preview']);
    }*/
    if (makeup_modules['preview_live_canvas'])
        makeup_modules['preview_live_canvas'].pause();
    if (fade === true)
        fade_out('edit');
    else
        hide('edit');
    hide('photo');
}

function justReturn() {
}

function showSnapshotbtn() {
	$('#snapshot_btn').show();
    hide('retake_looksgood');

    if (is.mobile())
        show('txt440');
}

function hideSnapshotbtn() {
	$('#snapshot_btn').hide();
}
