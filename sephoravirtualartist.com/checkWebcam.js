function checkWebcam() {
  this.hasDependency = true;

  // Check dependencies
  if(typeof jQuery=="undefined") {
    console.log("checkWebcam error: jQuery not defined!!!");
    this.hasDependency = false;
  } else if(typeof jQuery().webcam_jquery=="undefined") {
    console.log("checkWebcam error: jQuery().webcam_jquery not defined!!!");
    this.hasDependency = false;
  }

  this.fullCheckCount = 0;

  this.getUserMedia = navigator.getUserMedia ||
                      navigator.webkitGetUserMedia ||
                      navigator.mozGetUserMedia ||
                      navigator.msGetUserMedia;

  this.check_usermedia = function() {
    const obj = this;

    return new Promise(function (resolve, reject) {
      if(!!obj.getUserMedia) {
        resolve();
      } else {
        reject();
      }
    });
  };

 
  this.check_webcam_navigator = function() {
    const obj = this;

    return new Promise(function (resolve, reject) {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        // Firefox 38+ seems having support of enumerateDevicesx
        navigator.enumerateDevices = function(callback) {
          navigator.mediaDevices.enumerateDevices().then(callback, reject);
        };
      }

      var MediaDevices = [];
      var isHTTPs = location.protocol === 'https:';
      var canEnumerate = false;

      if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
        canEnumerate = true;
      } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
        canEnumerate = true;
      }

      var hasMicrophone = false;
      var hasSpeakers = false;
      var hasWebcam = false;

      var isMicrophoneAlreadyCaptured = false;
      var isWebcamAlreadyCaptured = false;

      if (!canEnumerate) {
        reject();
      }

      if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
        navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
      }

      if (!navigator.enumerateDevices && navigator.enumerateDevices) {
        navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
      }

      if (!navigator.enumerateDevices) {
        reject();
      }

      MediaDevices = [];
      navigator.enumerateDevices(function(devices) {
        devices.forEach(function(_device) {
            var device = {};
            for (var d in _device) {
                device[d] = _device[d];
            }

            if (device.kind === 'audio') {
                device.kind = 'audioinput';
            }

            if (device.kind === 'video') {
                device.kind = 'videoinput';
            }

            var skip;
            MediaDevices.forEach(function(d) {
                if (d.id === device.id && d.kind === device.kind) {
                    skip = true;
                }
            });

            if (skip) {
                return;
            }

            if (!device.deviceId) {
                device.deviceId = device.id;
            }

            if (!device.id) {
                device.id = device.deviceId;
            }

            if (!device.label) {
                device.label = 'Please invoke getUserMedia once.';
                if (!isHTTPs) {
                    device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
                }
            } else {
                if (device.kind === 'videoinput' && !isWebcamAlreadyCaptured) {
                    isWebcamAlreadyCaptured = true;
                }

                if (device.kind === 'audioinput' && !isMicrophoneAlreadyCaptured) {
                    isMicrophoneAlreadyCaptured = true;
                }
            }

            if (device.kind === 'audioinput') {
                hasMicrophone = true;
            }

            if (device.kind === 'audiooutput') {
                hasSpeakers = true;
            }

            if (device.kind === 'videoinput') {
                hasWebcam = true;
            }

            // there is no 'videoouput' in the spec.

            MediaDevices.push(device);
        });

        if(hasWebcam==true) {
          resolve();
        } else {
          reject();
        }
      });
    });
  };

  this.check_flash = function() {
    const obj = this;

    return new Promise(function (resolve, reject) {
      // Check if Flash is enabled
      var hasFlash = false;
      try {
        const fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if (fo) {
          hasFlash = true;
        }
      } catch (e) {
        if (navigator.mimeTypes
            && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
            && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
          hasFlash = true;
        }
      }

      if(hasFlash) {
        resolve();
      } else {
        reject();
      }
    });
  };

  this.fullcheck = function(params) {
    const obj = this;

    if(typeof params=="undefined") {
      params={};
    }

    console.log('Starting fullcheck');

    obj.fullCheckCount++;

    var flash_timeout=10000;
    if(typeof params['flash_timeout']!="undefined") {
      flash_timeout=parseInt(params['flash_timeout']);
    }

    var check_type="loose";
    if(typeof params['check_type']!="undefined") {
      check_type=params['check_type'];
    }

    var num_check=1;
    if(typeof params['num_check']!="undefined") {
      num_check=params['num_check'];
    }

    return new Promise(function (resolve, reject) {
      if(obj.hasDependency==false) {
        reject();
        return;
      }

      obj.check_usermedia().then(
        function() { // check_usermedia resolve
          // check if we can use userMedia for webcam
          obj.check_webcam_navigator().then(
            function() { // check_webcam_navigator resolve
              resolve();
            },
            function() { // check_webcam_navigator reject
              reject();
            }
          );
        },
        function() { // check_usermedia resolve
          obj.check_flash().then(
            function() { // check_flash resolve
              const webcamCheckerId=setTimeout(function() {
                console.log("webcamChecker timedout");
                // We can't figure out if webcam exist or not, so must assume webcam is there
                if(check_type=="loose") {
                  resolve();
                } else if(check_type=="strict") {
                  reject();
                } else {
                  resolve();
                }
              }, flash_timeout);

              try {
                var tempdiv=jQuery("<div style='position:absolute;left:-9999px;width:1px;height:1px;'></div>");
                $('body').append(tempdiv);
                tempdiv.webcam_jquery({
                  width: 744,
                  height: 558,
                  mode: "javascript",
                  quality: 85,
                  append: false,
                  swffile: "checkwebcam/jscam.swf", // canvas only doesn't implement a jpeg encoder, so the file is much smaller
              
                  onTick: function(remain) {
                  },
              
                  onSave: function(data, str) {
                  },
            
                  onCapture: function () {
                  },
              
                  debug: function (type, string) {
                    clearTimeout(webcamCheckerId);

                    console.log("jscam debug type:"+type);

                    // Flash object loaded, but error happened
                    // Webcam must not exist
                    if(type=="error") {
                      if(obj.fullCheckCount<num_check) {
                        tempdiv.remove();
                        obj.fullcheck(params).then(resolve,reject);
                      } else {
                        tempdiv.remove();
                        reject();
                      }
                    }
                  },
              
                  onLoad: function () {
                    clearTimeout(webcamCheckerId);
                    tempdiv.remove();
                    resolve();
                  }
                });
              } catch(e) {
                clearTimeout(webcamCheckerId);

                console.log("checkWebcam error: jQuery().webcam_jquery failed!!!");
                tempdiv.remove();
                reject();
              }
            },
            function() { // check_flash reject
              tempdiv.remove();

              reject();
            }
          )
        }
      );
    });
  };
}

