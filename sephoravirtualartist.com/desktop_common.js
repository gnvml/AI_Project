var refinePaneSwappedOff = false;

// defines behaviour of callback function in setServerImages()
var photoSavedCbStates = Object.freeze({ UNSET: 0, SHARE: 1, EMAIL: 2 });
var photoSavedCbState = photoSavedCbStates.UNSET;

// defines behaviour of pushPoints function: if a non-null callback is provided to pushPoints,
// it will ignore this variable completely (to make it compatible with older uses of pushPoints).
var photoUsageStates = Object.freeze({ UNSET: 0, SHARE: 1, COMPARE: 2, PHOTO_DEFAULT: 3 });
var photoUsageState = photoUsageStates.UNSET;
var pushPointsDisabled = true;

// for keeping track of which model images have been downloaded
var model_images_ready = new Set();

var showed_edit = false;

function btnClickEdit() {
    if (showed_edit) {
        var translated = toLang('Edit Try-On Experience', 'en', lang);
        var chooseModel = toLang('Choose A Model', 'en', lang);
        $('#edit_tryon_text').text(translated);
        if (lang === 'fr') {
            $('.edit_tryon_text').css('font-size', '19px');
        }
        $('#photo_header_text').text(chooseModel);
    }

    if (useNewAPI() && page == 'pto') {
        show('edit');
        hide('photo');
        hide('photo_additional_opts');

        if (live_modules_progress == progress_states.NOT_STARTED)
            initLiveModules();
        else if (live_modules_progress == progress_states.LOADED)
            makeup_modules['preview_live_canvas'].start();

        if (modelUsed == 1 && mode() == 'photo')
            $('#choose_model_opt_txt').text(toLang('CHANGE MODEL', 'en', lang));
        else
            $('#choose_model_opt_txt').text(toLang('CHOOSE A MODEL', 'en', lang));
    } else {
        if (useNewAPI() && live_modules_progress == progress_states.NOT_STARTED) {
            initLiveModules();
            live_modules_progress = progress_states.LOADING;
        } else if (webcamType == "flash")
            show('photo_additional_opts');
        show('photo');
        hide('edit');

        if (lang === 'fr') {
            if (showed_edit) {
                $('#photo_header_text').text('Modifier l’expérience Essai de Produits');
                $('#photo_header_text').css('font-size', '18px');
            } else {
                $('#photo_header_text').text('Personnalisez Votre Look');
                $('#photo_header_text').css('font-size', '24px');
            }
        } else {
            if (showed_edit) {
                $('#photo_header_text').text('Edit Try-On Experience');
            } else {
                $('#photo_header_text').text('Choose Try-On Experience');
            }
        }

    }
    showed_edit = true;
    if (page == 'il')
        trackEventLooks("features:new photo");
}

// https://stackoverflow.com/questions/23305000/javascript-fuzzy-search-that-makes-sense
function getBigrams(string) {
    var i, j, ref, s, v;
    s = string.toLowerCase();
    v = new Array(s.length - 1);
    for (i = j = 0, ref = v.length; j <= ref; i = j += 1) {
        v[i] = s.slice(i, i + 2);
    }
    return v;
};

// outputs value in range [0.0, 1.0] indicating similarity
function stringSimilarity(str1, str2) {
    if (str1.length > 0 && str2.length > 0) {
        pairs1 = getBigrams(str1);
        pairs2 = getBigrams(str2);
        return bigramSimilarity(pairs1, pairs2);
    }
    return 0.0;
};

function bigramSimilarity(pairs1, pairs2) {
    var hit_count, j, k, len, len1, pairs1, pairs2, union, x, y;
    if (pairs1.length > 0 && pairs2.length > 0) {
        union = pairs1.length + pairs2.length;
        hit_count = 0;
        for (j = 0, len = pairs1.length; j < len; j++) {
            x = pairs1[j];
            for (k = 0, len1 = pairs2.length; k < len1; k++) {
                y = pairs2[k];
                if (x === y) {
                    hit_count++;
                }
            }
        }
        if (hit_count > 0) {
            return (2.0 * hit_count) / union;
        }
    }
    return 0.0;
}

// wrapper for jquery load
function loadDiv(parent_id, fname) {
    $('#' + parent_id).load(fname, function() { divLoaded(parent_id) });
}

// proper callback for async loading of html
function divLoaded(id) {
    //console.log($(id).children().length);
    translateDiv(id);
    interpolateDivs();
    if (page === 'landing') {
        $('#header_logo').hide();
    }
    if (id === "leftnav") {
        if (lang == "fr") {
            $("#ios_lm").attr("src", "res/Download_App_Store_Fr.png");
            $("#and_lm").attr("src", "res/Download_Google_Play_Fr.png");
        }
    }
    setDropdown();
}

function removeSpaces(s) {
    return s.split(" ").join("");
}

function setDropdown() {
    if (country === 'US') {
        $('#lang1').html('ENG');
        $('#flag1').attr('src', 'simg/icon-flag-us.png');

        $('#lang2').html('ENG');
        $('#flag2').attr('src', 'simg/icon-flag-ca.png');
        $('#country1').click(function() {
            switchLang('en_CA');
        });

        $('#lang3').html('FR');
        $('#flag3').attr('src', 'simg/icon-flag-ca.png');
        $('#country2').click(function() {
            switchLang('fr_CA');
        });

    } else if (country === 'CA' && lang === 'en') {
        $('#lang1').html('ENG');
        $('#flag1').attr('src', 'simg/icon-flag-ca.png');

        $('#lang2').html('ENG');
        $('#flag2').attr('src', 'simg/icon-flag-us.png');
        $('#country1').click(function() {
            switchLang('en_US');
        });

        $('#lang3').html('FR');
        $('#flag3').attr('src', 'simg/icon-flag-ca.png');
        $('#country2').click(function() {
            switchLang('fr_CA');
        });

    } else if (country === 'CA' && lang === 'fr') {
        $('#lang1').html('FR');
        $('#flag1').attr('src', 'simg/icon-flag-ca.png');

        $('#lang2').html('ENG');
        $('#flag2').attr('src', 'simg/icon-flag-us.png');
        $('#country1').click(function() {
            switchLang('en_US');
        });

        $('#lang3').html('ENG');
        $('#flag3').attr('src', 'simg/icon-flag-ca.png');
        $('#country2').click(function() {
            switchLang('en_CA');
        });
    }
}

function closeShare() {
    fade_out('share', function() { $('#shareim').css('opacity', 0); });
    photoUsageState = photoUsageStates.UNSET;
}

function inCompare() {
    return page == 'pto' && $('#tab_compare').css('display') != 'none';
}

function modelImageLoaded(img) {
    $(img).css('opacity', 0);
    $(img).animate({ opacity: 1 }, 300);
    model_images_ready.add(img.id);
}

// if appropriate, treat as url (i.e add local folder and append .jpg after )
function adjustImageSrc(src) {
    var final = (isLocalImage(src)) ? src : "img/" + src + ".jpg";
    return final;
}

// replace with ... just use the original function once createEffects behaves as expected
function setServerImagesHelper(showemail) {
    var url = "http://www.sephora.com/virtualartist/saveimages.php?";
    //var url = "saveimages.php?";
    url += "&cachefix=" + Math.random();
    url += "&apiserver=" + apiserver;

    var poststr = 'img_array=' + getStringifiedImages();

    var xmlHttp = GetXmlHttpObject();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var response = xmlHttp.responseText;
            var image_ids = JSON.parse(response);

            // save ids
            if (inCompare()) {
                var cur_id = 0;

                // all assumed to be done in order, both client and server side
                for (var i = 0; i < compare.length; ++i) {
                    if (needServerUpdate(compare[i]))
                        compare[i]['remote_id'] = image_ids[cur_id++];
                }
            }
            if (image_ids.length == 1)
                currentMakeover['remote_id'] = image_ids[0];

            // act according to callback state
            if (photoSavedCbState == photoSavedCbStates.SHARE) {
                generateShare();
            } else if (photoSavedCbState == photoSavedCbStates.EMAIL) {
                generateShare(1);
                if (inCompare())
                    sendProductEmail('compare');
                else
                    sendProductEmail();
            }

            photoSavedCbState = photoSavedCbStates.UNSET;
        }
    }

    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send(poststr);
}


function setServerImages() {
    window.setTimeout(setServerImagesHelper, 100);
}

function emailProductsCompare() {
    //mobile compatible only
    trackEvent("compare:email products");
    show('email_product_popup');
    $("#sendProductBtn").off("click");
    $("#sendProductBtn").click(function() {
        ptoSendProductEmail('compare');
    });
}

var lookBanners = {
    "tutorial_brow": "sp_bt_tutorial_brow_3_ways.png",
    "tutorial_contour": "sp_bt_tutorial_contouring.png",
    "tutorial_eyeliner": "sp_bt_tutorial_eyeliner_3_ways.png",
    "tutorial_highlighter": "sp_bt_tutorial_highlighting.png",
    "tutorial_smoky": "sp_bt_tutorial_nighttime_smoky_everyday_eye.png",
    "tutorial_nomakeup": "sp_bt_tutorial_no_makeup_look.png",
    "youtube_brow": "sp_bt_youtube_brow.png",
    "youtube_cheek": "sp_bt_youtube_cheek.png",
    "youtube_eyeliner": "sp_bt_youtube_eyeliner.png",
    "youtube_eyeshadow": "sp_bt_youtube_eyeshadow.png",
    "youtube_lip": "sp_bt_youtube_lip.png",
    "youtube_mascara": "sp_bt_youtube_mascara.png"
};

function fillLooksBanner(lookid) {
    var url = "";
    var banner = "";

    var look = looks[lookid];
    if (look['youtubeImage'] != "") {
        if (look['youtubeLink'] != "") {
            url = look['youtubeLink'];
        } else if (look['youtubeLink2'] != "") {
            url = look['youtubeLink2'];
        } else if (look['youtubeLink3'] != "") {
            url = look['youtubeLink3'];
        }
        if (url != "" && look['youtubeImage'] && lookBanners['youtube_' + look['youtubeImage'].toLowerCase()]) {
            var banner = lookBanners['youtube_' + look['youtubeImage'].toLowerCase()];
            if (lang == "fr") {
                banner = "fr_" + banner;
            }
            $("#il_protip_tut").css("display", "block");
            $("#il_protip_tut").css("background-image", "url(res/tips/" + banner + ")");
            $("#il_protip_tut").off("click");
            $("#il_protip_tut").click(function() {
                window.open(url, "_blank");
            });
            return;
        }
    }

    if (url == "" && look['tutorialLink'] != "") {
        $("#il_protip_tut").css("display", "block");
        var banner = lookBanners['tutorial_' + look['tutorialLink'].toLowerCase()];
        if (lang == "fr") {
            banner = "fr_" + banner;
        }
        $("#il_protip_tut").css("background-image", "url(res/" + banner + ")");
        $("#il_protip_tut").off("click");
        $("#il_protip_tut").click(function() {
            if (is.ios()) {
                download_ios();
            } else if (is.android()) {
                download_and();
            }
        });
        return;
    }

    $("#il_protip_tut").css("display", "none");
}

function emailProducts() {

    //mobile compatible only
    show('email_product_popup');
    $("#sendProductBtn").off("click");
    if (shareMode == "compare") {
        $("#sendProductBtn").click(function() {
            sendProductEmail('compare');
        });
    } else {
        $("#sendProductBtn").click(function() {
            sendProductEmail();
        });
    }
}

function sendProductEmail(type) {

    if (!is.mobile()) {

        // come back when images are ready on the server
        photoSavedCbState = photoSavedCbStates.EMAIL;
        if (type === 'compare') {
            for (var i = 0; i < compare.length; ++i)
                if (needServerUpdate(compare[i])) {
                    setServerImages();
                    return;
                }
        } else {
            if (needServerUpdate(currentMakeover)) {
                setServerImages();
                return;
            }
        }
    }

    var email = document.emailproductform.addr.value;

    if (!email) {
        return;
    }

    if (!email || ((email.indexOf(".") <= 0) || (email.indexOf("@") <= 0))) {
        document.emailproductform.addr.style.border = "1px solid rgb(200,0,0)";
        show('email_error');
        return;
    }

    var prods = "";
    var simg = "";
    var attachimg = "";
    var lookname = "";
    var protip = "";
    var key = (!useNewAPI() || is.mobile()) ? "mainim" : "remote_id";
    if (page == "il") {
        /*if (document.emailproductform) {
            document.emailproductform.lookname.value = looks[currentLook]['lookName'].toUpperCase();
        } else {
            document.emailform.lookname.value = looks[currentLook]['lookName'].toUpperCase();
        }*/
        attachimg = shareim;
        document.emailproductform.lookname.value = looks[currentLook]['lookName'].toUpperCase();
        prods = createEmailProductProdsJSON('instant');
        simg = currentMakeover[key];
        lookname = looks[currentLook]['names'][lang.toUpperCase()];
        protip = looks[currentLook]['protips'][lang.toUpperCase()];
    } else {

        if (type != "undefined" && type == "compare") {
            attachimg = compareshareim;
            prods = createEmailProductProdsJSON('compare');
            simg = [];
            for (var i = 0; i < compare.length; i++) {
                if (compare[i] != -1)
                    simg.push(compare[i][key]);
            }
            simg = simg.join("~~~");
        } else {
            attachimg = shareim;
            prods = createEmailProductProdsJSON('single');
            simg = currentMakeover[key];
        }
    }

    var full_w = 100;
    var full_h = 100;
    var pos = getFittingParamsFromLocal(full_w, full_h);
    var im = document.getElementById('posImage');
    im.style.left = pos.left;
    im.style.top = pos.top;
    im.style.width = pos.width;

    var cropRatio = 0;
    var containerWidth = 100;
    cropRatio = uploaded_picwidth / pos.width;

    var cropWidth = parseInt(containerWidth * cropRatio);
    var cropLeft = parseInt(-1 * pos.left * cropRatio);
    var cropTop = parseInt(-1 * pos.top * cropRatio);

    document.emailproductform.imgs.value = simg;
    document.emailproductform.attachimg.value = attachimg;
    document.emailproductform.lookname.value = lookname;
    document.emailproductform.protip.value = protip;
    document.emailproductform.crop.value = cropLeft + "," + cropTop + "," + cropWidth;
    document.emailproductform.prods.value = prods;
    document.emailproductform.lang.value = lang;
    document.emailproductform.country.value = country;
    document.emailproductform.apiserver.value = apiserver;
    document.emailproductform.submit();

    if (page == "il") {
        trackEventLooks("share:email");
    } else {
        trackEvent("compare:share:email");
    }

    hide('email_product_popup');
    show('email_complete');

}

// uses HTML session storage
function saveData(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

function loadData(key) {
    return JSON.parse(sessionStorage.getItem(key));
}

// sets local image attributes, updates facepoints data structures as well
function imageInputSuccess(coords, local_image, module, img_width, img_height) {
    local_image.src_before = module.captureBefore();
    local_image.src_after = module.captureAfter();
    local_image.facepoints = coords;
    local_image.width = img_width;
    local_image.height = img_height;
    updatePicParamsFromLocal(local_image);
}

function useFileInput(div, form_name) {
    if (div.files && div.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {

            // need to query width and height first
            var img = new Image();
            img.addEventListener("load", function() {
                var module_wrapper = makeup_modules['backend_canvas'];
                var promise = module_wrapper.setImage(e.target.result, this.naturalWidth, this.naturalHeight);
                promise.then(
                    function(coords) {
                        module_wrapper.has_set_image = true;
                        imageInputSuccess(coords, local_image, module_wrapper.module, img.naturalWidth, img.naturalHeight);
                        successfulUpload(uploaded_mainpic, true, true);
                        modelUsed = 0;
                    },
                    function() {
                        var error_txt = document.getElementById('error_popup_txt');
                        var translated = toLang("Uh-oh. We couldn’t detect your face in the image uploaded. Please try another image.", 'en', lang)
                        error_txt.innerHTML = translated;
                        show('error_popup');
                        setTimeout(function() { resetFormUpload(uploadform_input) }, 100);
                    }
                );
            });
            img.src = e.target.result;
        };
        reader.readAsDataURL(div.files[0]);
    }

    // Use setTimeout to reset the form to avoid crashing on iPad
    setTimeout(function() { resetFormUpload(form_name) }, 100);
}

var hid_loader = false;

function photoModulesReady() {
    resizeHandler();
    var prev_local_image = loadData('local_image');

    currentModel = parseInt(currentModel);
    var model_undefined = (typeof currentModel != "number" || currentModel == -1 || isNaN(currentModel));
    if (prev_local_image && model_undefined) {
        persistImg((page == 'il'), null, prev_local_image);
    } else {
        if (model_undefined)
            currentModel = 0;
        selectModel(currentModel);
        if (page == 'il')
            trackEventLooks("customize look:modal");
    }

    // pre-emptively load, before showing edit
    if (localStorage.getItem('cameraPermission'))
        initLiveModules();
}

function liveModulesReady(show_preview) {

    live_modules_progress = progress_states.LOADED;

    // withdraw covers from take photo / live mode
    $('#take_block, #live_block, #take_photo_opt_padded').css({ 'pointer-events': 'auto', 'cursor': 'pointer' });

    // these makeup modules should not be running right now, this is a temporary fix
    for (var name in makeup_modules) {
        makeup_modules[name].start();
        if (!show_preview || name != 'preview_live_canvas')
            makeup_modules[name].pause();
    }

    localStorage.setItem('cameraPermission', 1);
}

// a set of hand-refined model facecoords, as the refine option is not available for these models.
var model_face_coords;

function getModelFaceCoords(data) {
    var ms = Date.now()
    var data = $.ajax({
        type: 'GET',
        url: 'model_face_coords.json?random=' + ms,
        dataType: 'json',
        success: function() {},
        data: {},
        async: false
    }).responseText;
    model_face_coords = JSON.parse(data);
}

function selectModel(n) {
    if (!model_face_coords) {
        getModelFaceCoords();
    }

    if (typeof n != "undefined") {
        cModel = n;
        currentModel = n;
        modelUsed = 1;
    }

    if (page == 'il')
        currentSkintone = modelskins[n];

    if (useNewAPI()) {
        var module_wrapper = makeup_modules['backend_canvas'];

        // image has to be ready
        var img_id = 'model' + cModel + 'image';
        if (model_images_ready.has(img_id) && typeof module_wrapper != "undefined" && module_wrapper.ready) {
            var src;
            if (cModel == 0)
                src = 'res/light.png';
            else if (cModel == 1)
                src = 'res/medium.png';
            else if (cModel == 2)
                src = 'res/mediumtanned.png';
            else if (cModel == 4)
                src = 'res/dark.png';
            else
                console.error('cModel is ' + cModel + ' which is apparently invalid');

            //fade_in('makeovercontainer_veil');
            var img = document.getElementById(img_id);
            var promise = module_wrapper.setImage(src, img.naturalWidth, img.naturalHeight);
            promise.then(
                function(coords) {
                    module_wrapper.has_set_image = true;

                    if (model_face_coords['model' + n]) {
                        module_wrapper.module.tracker.featurecoords = model_face_coords['model' + n];
                        coords = model_face_coords['model' + n];
                    }

                    imageInputSuccess(coords, local_image, module_wrapper.module, img.naturalWidth, img.naturalHeight);
                    successfulUpload(uploaded_mainpic, false);
                    if (!hid_loader) {
                        window.setTimeout(hide_loader, 500); // additional delay to wait out intense processing
                        hid_loader = true;
                    }
                },
                function() {
                    console.error('failed to set model image');
                }
            );
        }
    } else {
        var xmlHttp = GetXmlHttpObject();
        if (xmlHttp == null) {
            error("Browser does not support HTTP Request");
            return;
        }

        var url = "http://www.sephora.com/virtualartist/proxy.php?psx=24" +
            //var url = "proxy.php?psx=24" +
            "&action=registermodel" +
            "&modelid=" + n +
            "&apiserver=" + apiserver;

        url += "&cachefix=" + Math.random();

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                trackEvent("use a model");
                var parts = xmlHttp.responseText.split(':');
                mainim = parts[1];
                mfid = parts[1];

                currentMakeover['mainim'] = mainim;

                var imgip = parts[0];
                var uploaded_mainpic = parts[2];
                uploaded_picwidth = parseInt(parts[3]);
                uploaded_picheight = parseInt(parts[4]);
                facePts['face'] = parts[5];
                facePts['leye'] = parts[6];
                facePts['reye'] = parts[7];
                facePts['lips'] = parts[8];
                facePts['teeth'] = parts[9];
                setNewFacePts();

                if (document.getElementById(moduleIframeName['main'])) {
                    MF_CHANNEL_PARENT.send({ event: 'stop', data: {} }, moduleIframeName['main']);
                }

                successfulUpload(uploaded_mainpic, false, false);
                //hide('makeovercontainer_live');
                //setmain(uploaded_mainpic);
                //apply();
            }
        }

        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }

    closeRefine();
    hide('btnRefine'); // Hide refine button whenever we have a model
    updateButtonWidth();
    //   resizeSubBar('sub_bar');
}

// wraps around setmain
function successfulUpload(uploaded_mainpic, adjust, clear_skintones) {
    if (!useNewAPI())
        if (document.getElementById(moduleIframeName['main'])) {
            MF_CHANNEL_PARENT.send({ event: 'stop', data: {} }, moduleIframeName['main']);
        }

    if (page == 'pto') {
        toPhotoMode();
    } else {
        if (currentSkintone == -1 || !currentSkintone || clear_skintones) {
            resetSkintoneOpts();
            show('skintones');
        } else if (currentSkintone) {
            selectSkintone(currentSkintone);
        }
    }

    if (page === 'pto' && adjust) {
        closeEdit();
    } else if (localStorage.getItem('cameraPermission') && page === 'pto' && !ptoLoaded) {
        ptoLoaded = true;
        btnClickEdit();
    }


    if (page === 'il' && !persist && !loaded) {
        show('photo');
    } else {
        hide('photo');
    }

    loaded = true;

    setmain(uploaded_mainpic, clear_skintones);
    apply();

    if (adjust === true) {
        customTeethToggle = false;
        toRefine();
        photoUsageState = photoUsageStates.UNSET;
        show('btnRefine');
    }
    updateButtonWidth();
}


// KM's special function
function getBox(pointsArray) {
    var minx = -1;
    var miny = -1;
    var maxx = -1;
    var maxy = -1;
    for (var i = 0; i < pointsArray.length; i++) {
        if (minx == -1 || pointsArray[i].x < minx) {
            minx = pointsArray[i].x;
        }
        if (miny == -1 || pointsArray[i].y < miny) {
            miny = pointsArray[i].y;
        }
        if (maxx == -1 || pointsArray[i].x > maxx) {
            maxx = pointsArray[i].x;
        }
        if (maxy == -1 || pointsArray[i].y > maxy) {
            maxy = pointsArray[i].y;
        }
    }

    var width = parseInt(maxx) - parseInt(minx);
    var height = parseInt(maxy) - parseInt(miny);
    var box = new Object({ left: minx, bot: maxy, right: maxx, top: miny, width: width, height: height });
    return box;
}

function addProductToEffects(product, placement, category, effects_dict, intensity, eyeliner_lower_on) {
    intensity = (typeof intensity == 'number') ? 1.0 * intensity : 1.0;
    if (useNewAPI())
        intensity *= 1.2;

    var p = product;
    var finish;
    if (typeof p['finish'] != "undefined")
        finish = p['finish'].toLowerCase();

    var cate = category;
    var pos = 0;
    var am = 1;

    // not supported yet
    if (category == 'brow')
        return;

    if (!isNaN(parseFloat(parseInt(p['opacity']) / 500)))
        am = parseFloat(parseInt(p['opacity']) / 500);

    if (category == 'lash' || category == 'mascara') {
        rgb = [0, 0, 0];
        var imgName = p['imgname'];
        var isBottom = p['isbottomlash'];
        var type = 'lash_0'; //cate+'_'+pos;

        effects_dict[type] = {};
        effects_dict[type]['a'] = 1;
        effects_dict[type]['type'] = 'lash_0';
        effects_dict[type]['placement'] = pos;
        effects_dict[type]['isBottom'] = !!(p['isbottomlash'] === 'YES');

        if (category == 'lash')
        //effects_dict[type]['src'] = "imageproxy.php?x=http://www40.modiface.com/mobile/sephora/lash/img/"+p['imgname'];
            effects_dict[type]['src'] = "imageproxy.php?x=https://8e1abe4449e8c8b52e67-803e13595e2f1638020d1ded4b94768a.ssl.cf2.rackcdn.com/sephora_data/lashes/" + p['imgname'];
        else
        //effects_dict[type]['src'] = "imageproxy.php?x=http://www40.modiface.com/mobile/sephora/lash/img/sb_lsh_length.png";
            effects_dict[type]['src'] = "imageproxy.php?x=https://8e1abe4449e8c8b52e67-803e13595e2f1638020d1ded4b94768a.ssl.cf2.rackcdn.com/sephora_data/lashes/sb_lsh_length.png";

    } else {
        var rgb = p['rgb'].split(",");
        am *= intensity;
        var glitter = parseFloat(p['glitter']) / 500; //(finish == 'shimmer')? 2 * parseFloat(p['glitter'])/500 : parseFloat(p['glitter'])/500;
        var gloss = (finish == 'matte') ? 0 : parseFloat(p['gloss']) / 500;
        pos = 0;

        // set value of pos
        if (category == "eyeshadow") {
            switch (placement) {
                case "outercorner":
                    pos = 0;
                    break;
                case "lid":
                    pos = 2;
                    break;
                case "crease":
                    pos = 1;
                    break;
                default:
                    pos = 0;
                    break;
            }
        } else if (category == "cheek") {
            if (typeof p['cheekcategory'] != "undefined")
                pos = p['cheekcategory'].toLowerCase();
            else
                pos = placement;
        } else if (category == "lips") {
            gloss = 1.0 + gloss * 3;

            // hack
            if (finish == 'high shine' && useNewAPI())
                am *= 2;
        }

        // adjust type value
        if (category == 'eyeliner') {
            var type;

            // 3 different masks for 3 different thicknesses
            if (placement == 'smoky') {
                if (p['thickness'])
                    type = 'eyeliner_smoky_' + p['thickness'];
                else
                    type = 'eyeliner_smoky_medium';
            } else {
                type = 'eyeliner';

                if (useNewAPI())
                    am *= 1.5;
            }
        } else {
            var type = cate + "_" + pos;
        }
        effects_dict[type] = {};
        effects_dict[type]['r'] = parseInt(rgb[0] * 0.8);
        effects_dict[type]['g'] = parseInt(rgb[1] * 0.8);
        effects_dict[type]['b'] = parseInt(rgb[2] * 0.8);
        effects_dict[type]['a'] = am;
        effects_dict[type]['sparkleIntensity'] = glitter;
        effects_dict[type]['gamma'] = gloss;
        effects_dict[type]['glossDetail'] = 0.4;
        effects_dict[type]['glossMinThreshold'] = 0.0;
        effects_dict[type]['glossMaxThreshold'] = 0.001;
        effects_dict[type]['type'] = type;

        // note that this excludes eyeliner smoky, which is special
        if (type == 'eyeliner') {
            if (placement == 'winged' || placement == 'natural') {
                effects_dict[type]['shape'] = placement;
            } else {
                effects_dict[type]['shape'] = 'natural';
                console.log(placement + ' is not a supported shape');
            }
            effects_dict[type]['location'] = (eyeliner_lower_on) ? 'both' : 'top';

            var thickness = 0.4;
            if (p['thickness'] == 'medium')
                thickness = 0.65;
            else if (p['thickness'] == 'thick')
                thickness = 1;
            effects_dict[type]['thickness'] = thickness;
        }
        if (category == 'eyeshadow') {

            // hack
            if (useNewAPI())
                effects_dict[type]['a'] *= 1.5;
        }

        // add separate effect for smoky lower
        if (category == 'eyeliner' && placement == 'smoky' && eyeliner_lower_on) {
            var add_type = 'eyeliner_smoky_lower';
            effects_dict[add_type] = {};
            effects_dict[add_type]['r'] = parseInt(rgb[0]);
            effects_dict[add_type]['g'] = parseInt(rgb[1]);
            effects_dict[add_type]['b'] = parseInt(rgb[2]);
            effects_dict[add_type]['a'] = am;
            effects_dict[add_type]['sparkleIntensity'] = glitter;
            effects_dict[add_type]['gamma'] = gloss;
            effects_dict[add_type]['type'] = add_type;
        }
    }
}

// call upon page load
function shouldPersist() {
    return (imid != "" && imip != "") || (typeof currentModel == "number" && currentModel != -1 && !isNaN(currentModel)) || (useNewAPI() && loadData('local_image') !== null);
}

// don't remove this function, keep for debugging purposes
var seen_props = new Set();

function seeProperties() {
    var min = 10000000,
        max = -10000000;
    for (var category in makeoverobject) {
        for (var sku in makeoverobject[category]) {
            for (var colorid in makeoverobject[category][sku]) {
                var prod = makeoverobject[category][sku][colorid];
                var family = prod.family;
                if (category == 'eyeshadow')
                    seen_props.add(family);
            }
        }
    }
    //console.log(min);
    //console.log(max);
}

// check if element is before or after in DOM
(function($) {
    $.fn.isAfter = function(sel) {
        return this.prevAll().filter(sel).length !== 0;
    };

    $.fn.isBefore = function(sel) {
        return this.nextAll().filter(sel).length !== 0;
    };
})(jQuery);

function useNewAPI() {
    return !is.mobile() && is.chrome();
}

function newAPIReady() {
    return api_loaded && num_unprepared_modules <= 0;
}

function liveEnabled() {
    return webcamType == "userMedia" && is.chrome();
}

function redraw(div) {
    $(div).hide(0, function() { $(this).show() });
}

// Show list of languages for switching languages;
function showLangList() {
    var items = document.getElementById('countryDropdown');
    if (items.style.display === 'none') {
        items.style.display = 'block';
    } else {
        items.style.display = 'none';
    }
}

function imageLoaded(img, fast) {
    $(img).stop();

    if (fast === true) {
        //$(img).css('opacity', 1.0);
        $(img).css('opacity', 0.2);
        $(img).animate({ 'opacity': 1.0 }, 200);
    } else {
        $(img).css('opacity', 0);
        window.setTimeout(function() { $(img).animate({ 'opacity': 1.0 }, 300); });
    }
}

function attachProductDescription(container, info, compare_panel) {
    // append product image
    var img_wrapper = document.createElement('div');

    if (compare_panel)
        img_wrapper.className = "c36";
    else
        img_wrapper.className = "prod_image_wrapper";

    var img = document.createElement('img');
    img.className = "c37";
    img.onload = function() { imageLoaded(this); };
    img.src = info.prodImg;
    img_wrapper.appendChild(img);

    container.appendChild(img_wrapper);

    // rest of the description
    var e1 = document.createElement('div');
    e1.className = "product_container_description";

    // add text
    var brand, name, shade;
    brand = document.createElement('div');
    name = document.createElement('div');
    shade = document.createElement('div');
    brand.innerHTML = info.prodBrand;

    var numDelete = info.prodShade.split(" ").length;
    var productName = info.prodName.split(" ");
    productName.splice(-1 * numDelete, numDelete);

    // name.innerHTML = info.prodName;
    name.innerHTML = productName.join(" ");
    shade.innerHTML = info.prodShade;
    brand.className = "product_description_text_bold";
    name.className = "product_description_text";
    shade.className = "product_description_text";
    e1.appendChild(brand);
    e1.appendChild(name);
    e1.appendChild(shade);
    container.appendChild(e1);

    e1 = document.createElement('div');
    e1.className = "product_container_shop";

    var price_text = document.createElement('div');
    var prodPrice = getPriceStr(info.prodPrice);
    price_text.className = "price_text";
    price_text.innerHTML = prodPrice;
    e1.appendChild(price_text);

    var e2 = document.createElement('div');
    e2.id = info.category + "_" + info.sku + "_" + info.colorId + "_url2";
    e2.className = "c1003 cta_grad";
    e2.innerHTML += toLang("SHOP", 'en', lang);
    e2.onclick = function() { productLinkOut(this.id) };

    if (lang == 'fr')
        $(e2).css('font-size', 7);

    e1.appendChild(e2);

    var e2 = document.createElement('div');
    e2.className = "c40 " + info.starId;
    if (info.isFavorite) {
        e2.style.background = "black";
    }
    e2.id = info.starId;
    e2.innerHTML = "<img src='res/favourite.png' class='cen' style='position:absolute;width:18px;height:18px;'><div className='favIconBorder29'></div>";
    e2.onclick = function() { favorite(this.id); };

    container.appendChild(e1);
    container.appendChild(e2);
}

function changeTextProtipButtons() {
    var email_btn_txt, share_btn_txt;
    if (isTabletSize()) {
        email_btn_txt = 'EMAIL';
        share_btn_txt = 'SHARE';
    } else {
        email_btn_txt = 'EMAIL PRODUCTS';
        share_btn_txt = 'SHARE PHOTO';
    }
    email_btn_txt = toLang(email_btn_txt, 'en', lang);
    share_btn_txt = toLang(share_btn_txt, 'en', lang);

    if (lang === 'fr') {
        email_btn_txt = 'ENVOYEZ CES PRODUITS PAR COURRIEL';
        share_btn_txt = 'PARTAGER PHOTO';
    }


    $('#email_products_cta').text(email_btn_txt);
    $('#share_photo_cta').text(share_btn_txt);
}

function toTablet() {
    if (page == "il") {
        $('#additional_opts').appendTo('#tablet_options_placeholder');
        show('tablet_options_placeholder');
    }

    if (currentAdjustStep != 'NA')
        toRefine();
}

function toDesktop() {
    if (page == "il") {
        $('#additional_opts').appendTo('#sub_bar');
        hide('tablet_options_placeholder');
    }

    if (currentAdjustStep != 'NA')
        toRefine();
}

function toRefine() {
    if (isTabletMode() || mode() == 'live' || photoUsageState == photoUsageStates.SHARE)
        toRefinePopup();
    else
        toRefinePane();
}

function toRefinePopup() {
    if (!refinePaneSwappedOff) {
        swapDivIds('refine_pane_placeholder', false);
        swapDivIds('refine_placeholder', true);
        refinePaneSwappedOff = true;
    }

    var ms = Date.now();
    var id = 'refine_placeholder';
    if ($('#' + id).children().length <= 0)
        $('#' + id).load("refine.html?random=" + ms, function() {
            divLoaded(id);
            showRefinePopup();
        });
    else
        showRefinePopup();
}

function toRefinePane() {
    if (refinePaneSwappedOff) {
        swapDivIds('refine_pane_placeholder', true);
        swapDivIds('refine_placeholder', false);
        refinePaneSwappedOff = false;
    }

    var ms = Date.now();
    var id = 'refine_pane_placeholder'
    if ($('#' + id).children().length <= 0)
        $('#' + id).load("refine_pane.html?random=" + ms, function() {
            divLoaded(id);
            showRefinePane();
        });
    else
        showRefinePane();
}

function showRefinePopup() {
    pushPointsDisabled = false;

    // reset id, as we are using this again
    $('#removable_content_swap').attr('id', 'removable_content');
    swapDivIds('removable_content', true);
    $('#removable_content').appendTo('#removable_content_placeholder');

    // measurements need to be adjusted for everything in removable_content (not much)
    $('#mouth_bar').css('padding-top', 7);
    $('#mouth_bar').css('padding-bottom', 26);

    show('product_viewing_pane');
    show('refine_placeholder');
    hide('refine_pane_placeholder');
    interpolateDivs();

    // product viewing pane needs to be adjusted
    if (page == "pto") {
        positionIconsTabularly(currentCategory + '_family_content', 5, true);
        if (currentCategory == 'eyeshadow')
            positionIconsTabularly('eyeshadow_palette_content', 5, false);
        adjustShadeContentWidth(currentCategory);
    }

    if (currentAdjustStep != "NA")
        adjustStep(currentAdjustStep);
    else
        adjustStep('lips');
}

function showRefinePane() {
    pushPointsDisabled = false;

    // reset id, as we are using this again
    $('#removable_content_swap').attr('id', 'removable_content');
    swapDivIds('removable_content', true);
    $('#removable_content').appendTo('#removable_content_placeholder');
    hide('product_viewing_pane');
    hide('refine_placeholder');
    show('refine_pane_placeholder');

    $('#mouth_bar').css('padding-top', 0);
    $('#mouth_bar').css('padding-bottom', 0);
    interpolateDivs();

    if (currentAdjustStep != "NA")
        adjustStep(currentAdjustStep);
    else
        adjustStep('lips');
}

// changes all div ids so that application targets the correct divs.
// adds a "_swap" to all ids that are switched off
function swapDivIds(id, swap_on) {
    var target_divs = $('#' + id).find('*');
    for (var i = 0; i < target_divs.length; ++i) {
        var strlen = target_divs[i].id.length;
        if (swap_on) {
            if (strlen > 5 && target_divs[i].id.substring(strlen - 5, strlen) == '_swap')
                target_divs[i].id = target_divs[i].id.substring(0, strlen - 5);
        } else if (strlen > 0)
            target_divs[i].id += '_swap';
    }
}

// some divs need to move around or be different when changing from tablet to desktop or vice-versa
function tabletDesktopTransition() {
    if (isTabletMode()) {
        if (typeof was_tablet != "undefined" && was_tablet)
            return;
        toTablet();
        was_tablet = true;
    } else {
        if (typeof was_tablet != "undefined" && !was_tablet)
            return;
        toDesktop();
        was_tablet = false;
    }
}

var initdotpanelxy = [0, 0];
var initmovepnt = [0, 0];
var dragging_adjust = 0;

function start_adjustmove(e) {
    dragging_adjust = 1;
    initmovepnt = findmousepos(e);
    initdotpanelxy[0] = parseFloat(document.getElementById('adjust_' + currentAdjustStep).style.left);
    initdotpanelxy[1] = parseFloat(document.getElementById('adjust_' + currentAdjustStep).style.top);
}

function adjustmove(e) {
    if (dragdotE) return;

    if (dragging_adjust == 0) {
        return;
    }

    var xypos = findmousepos(e);

    var deltax = xypos[0] - initmovepnt[0];
    var deltay = xypos[1] - initmovepnt[1];

    document.getElementById('adjust_' + currentAdjustStep).style.left = (initdotpanelxy[0] + deltax) + "px";
    document.getElementById('adjust_' + currentAdjustStep).style.top = (initdotpanelxy[1] + deltay) + "px";
}

function end_adjustmove(e) {
    dragging_adjust = 0;
    if (dots_moved) {

        // re-apply makeup in main image container
        if (useNewAPI())
            pushPointsToLocal(null, true, true);
        else
            pushPointsToServer(null, true, true);
    }
    dots_moved = false;
}


var targ;
var dragdotE;
var dots_moved = false;

function dot_mouseDown(event) {
    if (!event) {
        var event = window.event;
    }

    if (event.preventDefault) event.preventDefault();
    targ = event.target ? event.target : event.srcElement;
    if (targ.className != "adjustPt") return;

    dot_offsetX = event.clientX;
    dot_offsetY = event.clientY;
    if (!targ.style.left) { targ.style.left = '0px' };
    if (!targ.style.top) { targ.style.top = '0px' };

    startX = parseInt(targ.style.left);
    startY = parseInt(targ.style.top);

    dots_moved = true;
    dragdotE = true;

    return false;
}

// underline is for refine pane option headers
function adjustUnderline() {
    if (currentAdjustStep != 'NA' && !isTabletMode() && $('#refine_pane_placeholder').css('display') != 'none') {
        var parent_left = $($('#underline').parent()).offset().left;
        var targ_left = $('#refine_' + currentAdjustStep + '_header').offset().left;
        $('#underline').finish();
        $('#underline').css('left', targ_left - parent_left);
        $('#underline').width($('#refine_lips_header').width());
    }
}

function initRefinePaneInterpolations() {
    var screen_widths = [770, 1024, 1300, 2562];

    // refine pane custom padding
    addInterpolation('width', '#refine_padding_right', screen_widths, [0, 0, 50, 50]);
    addInterpolation('width', '#refine_mid_stripe_padding_right', screen_widths, [0, 0, 50, 50]);
    addInterpolation('width', '#refine_mid_stripe_padding_left', screen_widths, [0, 0, 30, 30]);

    // refine pane ctas
    addInterpolation('top', '#refine_cta_pane', screen_widths, [408, 408, 461, 461]);
    addInterpolation('width', '#refine_reset', screen_widths, [130, 130, 165, 165]);
    addInterpolation('width', '#refine_confirm', screen_widths, [130, 130, 165, 165]);
    addInterpolation('width', '#refine_cta_pane', screen_widths, [289, 289, 374, 374]);
    addInterpolation('font-size', '#refine_header_text', screen_widths, [13, 19.5, 19.5, 19.5]);
    addInterpolation('left', '#refine_header_text', [1024, 1300], [31, 75]);
}

function slideUnderline(feature) {
    var j_id = '#' + feature;
    if ($(j_id).length == 0)
        return;

    var parent_left = $($(j_id).parent()).offset().left;
    var targ_left = $(j_id).offset().left;
    $('#underline').width($('#refine_lips_header').width());
    $('#underline').animate({ left: targ_left - parent_left }, 200);
}

function selectRefineLips() {
    pushPoints(null, true);
    adjustStep('lips');
    slideUnderline('refine_lips_header');
}

function selectRefineReye() {
    pushPoints(null, true);
    adjustStep('reye');
    slideUnderline('refine_reye_header');
}

function selectRefineLeye() {
    pushPoints(null, true);
    adjustStep('leye');
    slideUnderline('refine_leye_header');
}

// handles cases depending on page
function followTitle() {
    if (page == 'pto') {
        //$('#header_title').attr('class', 'pto_header');
        if ($('#tab_compare').css('display') == 'none') {

            if (lang === 'fr') {
                $('#header_title').html('Essai de Produit');
            } else {
                $('#header_title').html(toLang('Product Try-On', 'en', lang));
            }

            // $('#header_title').html(toLang('Product Try-On', 'en', lang));

            followDivCenter('header_title', 'mid_section');
        } else {
            if (lang === 'fr') {
                $('#header_title').html('Comparer les looks');
            } else {
                $('#header_title').html(toLang('Compare Looks', 'en', lang));
            }

            // $('#header_title').html(toLang('Compare Looks', 'en', lang));
            followDivCenter('header_title', 'photoquad');
        }
    } else if (page == 'il') {
        $('#header_title').html('Looks');
        //$('#header_title').attr('class', 'il_header');
        followDivCenter('header_title', 'mid_section');
    }

}

// follower's center is aligned to target center
function followDivCenter(follower, target) {
    var j_id = '#' + target;
    var targ_left = $(j_id).offset().left + ($(j_id).outerWidth() - $('#' + follower).outerWidth()) / 2;
    $('#' + follower).offset({ left: targ_left });
}

// follower's left is aligned to target left
function followDivPosition(follower, target) {
    var j_id = '#' + target;
    var targ_left = $(j_id).offset().left + $(j_id).outerWidth() - $(j_id).width();
    $('#' + follower).offset({ left: targ_left });
}

// adds data needed to interpolate div dimensions
// id may start with # or . (individual id or class allowed)
// screen_widths and div_vals need to be corresponding / same length arrays
function addInterpolation(property, id, screen_widths, div_vals) {
    if (interpolation_data[id] == null)
        interpolation_data[id] = {};
    if (interpolation_data[id][property] == null)
        interpolation_data[id][property] = { 'screen': screen_widths, 'div': div_vals };
    else {
        interpolation_data[id][property]['screen'] = interpolation_data[id][property]['screen'].concat(screen_widths).sort();
        interpolation_data[id][property]['screen'] = interpolation_data[id][property]['screen'].concat(div_vals);
    }
}

// interpolate with screen width as reference
// properties are interpolated in between, anything beyond is saturated at final value (won't change)
function interpolateDivs() {
    var window_width = $(window).width();
    var break_point = 0;

    for (var div_id in interpolation_data) {
        for (var property in interpolation_data[div_id]) {

            // find breakpoints between which we interpolate
            var i = 1;
            var length = interpolation_data[div_id][property]['screen'].length;
            while (i < length && interpolation_data[div_id][property]['screen'][i] < window_width)
                ++i;

            i = Math.min(i, length - 1);
            var small_screen_val = interpolation_data[div_id][property]['screen'][i - 1];
            var large_screen_val = interpolation_data[div_id][property]['screen'][i];
            var small_val = interpolation_data[div_id][property]['div'][i - 1];
            var large_val = interpolation_data[div_id][property]['div'][i];
            var t = (window_width - small_screen_val) / (large_screen_val - small_screen_val);
            var targ_val = 0;

            // threshold
            t = Math.min(1, t);
            t = Math.max(0, t);

            targ_val = t * (large_val - small_val) + small_val;
            $(div_id).css(property, targ_val);
        }
    }
}

// hide leftnav if clicked outside
function setupGlobalClicks() {

    // composed of 2 divs currently
    $("body").click(function(e) {

        // menu clickout close
        if (e.target.id != "leftblank" && $(e.target).parents("#leftblank").size() == 0 &&
            e.target.id != "leftmenu" && $(e.target).parents("#leftmenu").size() == 0) {
            if ($("#leftnav").css('opacity') == '1')
                fade_out("leftnav");
        }

        // drop down
        if ((!$(event.target).is('.countryDropbutton')) && (document.getElementById('countryDropdown').style.display === 'block')) {
            showLangList();
        } else if ($(event.target).is('.countryDropbutton') || ($(event.target).parents('.countryDropbutton').length)) {
            showLangList();
        }
    });
}

// name and widths must all be strings
function getToolTip(name, min_width, max_width) {
    var tooltiptext = document.createElement('div');
    tooltiptext.className = "tooltiptext";

    if (typeof min_width != "undefined")
        tooltiptext.style.minWidth = min_width;
    if (typeof max_width != "undefined")
        tooltiptext.style.maxWidth = max_width;

    tooltiptext.innerHTML = name;

    // add the little triangle / caret thing
    var up_caret = document.createElement('div');
    up_caret.className = "up_caret";
    var tooltip = document.createElement('div');
    tooltip.className = "tooltip";
    tooltip.appendChild(up_caret);
    tooltip.appendChild(tooltiptext);

    return tooltip;
}

function resizeSubBar(sub_bar_id) {
    if (isTabletMode()) {
        var reverse = true;
        uniformHorizontalPartition(sub_bar_id, reverse);
    } else {
        var children = $('#' + sub_bar_id).children();
        for (var i = 0; i < children.length; ++i)
            $(children[i]).css('left', '0px');
    }
}

function isTabletSize() {
    return $('#tablet_indicator').css('display') == 'block';
}

function isTabletMode() {
    return isTabletSize() || is.tablet();
}

// positions child divs so that they horizontally partition the parent evenly
// reverse = true will start from the last child
function uniformHorizontalPartition(id, reverse) {
    var j_id = '#' + id;
    var children = $(j_id).children();
    var num_visible = 0;

    for (var i = 0; i < children.length; ++i)
        if (children[i].style.display != "none")
            ++num_visible;

    var del_x = $(j_id).width() / (num_visible + 1);
    var cur_partition = 1;
    if (reverse !== true) {
        for (var i = 0; i < children.length; ++i)
            if (children[i].style.display != "none") {
                var offset = -0.5 * $(children[i]).width();
                var left_pos = cur_partition * del_x + offset;
                $(children[i]).css({ left: left_pos });
                ++cur_partition;
            }
    } else {
        for (var i = children.length - 1; i >= 0; --i)
            if (children[i].style.display != "none") {
                var offset = -0.5 * $(children[i]).width();
                var left_pos = cur_partition * del_x + offset;
                $(children[i]).css({ left: left_pos });
                ++cur_partition;
            }
    }
}

// currently highlight and unhighlight do an exact string match for color (cannot miss or have extra spaces)
var tab_selected_bgcolor = "rgb(255, 255, 255)";
var tab_unselected_bgcolor = "rgba(238, 238, 238, 0.5)";
var tab_hover_bgcolor = "rgb(242, 242, 242)";
var refine_hover_color = "rgb(70, 70, 70)";
var refine_selected_color = "rgb(0, 0, 0)";
var refine_unselected_color = "rgb(120, 120, 120)";

function highlight(div) {
    var class_name = div.className;
    if (class_name == "left_btn_pto") {
        var color = $(div).css('background-color');
        if (color == tab_unselected_bgcolor)
            $(div).css('background-color', tab_hover_bgcolor);
    } else if (class_name == "refine_opt_header") {
        var color = $(div).css('color');
        if (color == refine_unselected_color)
            $(div).css('color', refine_hover_color);
    }
}

function unhighlight(div) {
    var class_name = div.className;
    if (class_name == "left_btn_pto") {
        var color = $(div).css('background-color');
        if (color == tab_hover_bgcolor)
            $(div).css('background-color', tab_unselected_bgcolor);
    } else if (class_name == "refine_opt_header") {
        var color = $(div).css('color');
        if (color == refine_hover_color)
            $(div).css('color', refine_unselected_color);
    }
}

// KM addition to set viewportmeta for tablet portrait
function scale_tabScreen() {
    var targetWidth = 798;
    var tabletWidth = Math.min(768, $(window).width(), $(window).height());
    var metaScale = tabletWidth / targetWidth;
    document.getElementById('viewportmeta').content = "width=" + targetWidth + ", initial-scale=" + metaScale + ", maximum-scale=" + metaScale + ", user-scalable=no";
}


// lots of divs look like ----- header -----
// this function sets the width for the lines so it fits fully
// the inner structure should be <div line><div or span text><div line>
function fitTitleLines(title_id) {
    var container_width = $("#" + title_id).width();

    // find text width
    var children = $("#" + title_id).children();
    var text_width;
    for (var i = 0; i < children.length; ++i) {
        if (children[i].innerHTML != "" && typeof children[i].innerHTML != "undefined") {
            text_width = $(children[i]).outerWidth(true);
            break;
        }
    }
    var text_padding = 16;
    var remaining_space = container_width - text_width - text_padding;
    for (var i = 0; i < children.length; ++i) {
        if (children[i].innerHTML == "" || typeof children[i].innerHTML == "undefined") {
            // This condition is true whenever the loop reaches a ------------  item.
            // The two straight lines beside "What You're Wearing"

            var left_pad = 10;
            var right_pad = 10;
            var jchild = $(children[i]);
            // var left_pad = parseInt(jchild.css('margin-left'));
            // var right_pad = parseInt(jchild.css('margin-right'));
            jchild.width(Math.floor(remaining_space / 2.0) - left_pad - right_pad);
        }
    }
}

// for space, capitalization, and stopping punctuation (! .) indifferent translation
var separators = ['.', '!'];
var separator_regex = new RegExp(separators.join('|'), 'g');

function reduceString(s) {
    if (!s)
        return s;

    var reduced = s.toLowerCase().trim();
    //var parts = reduced.split(separator_regex);
    //return parts.join(".");
    return reduced;
}

// returns translated string, uses global var en_dict and fr_dict
// white space and case-insensitive lookup
// note that if the query is not defined, original text is returned
function toLang(text, from_lang, to_lang) {
    if (from_lang == to_lang)
        return text;

    var key = reduceString(text);
    if (typeof key == "undefined" || key == "")
        return text;

    if (to_lang == 'fr') {
        if (typeof en_dict != "undefined" && key in en_dict)
            return en_dict[key];
        return text;
    }

    // english
    if (typeof fr_dict != "undefined" && key in fr_dict)
        return fr_dict[key];
    return text;
}

// assuming div html was written in english, translates div along with its children
function translateDiv(id) {
    if (lang == 'en')
        return;
    var subtree = $('#' + id).find('*');
    translateElms(subtree, 'en', lang)
}

function translateElms(elms, from_lang, to_lang) {
    if (from_lang == to_lang)
        return;

    for (var i = 0; i < elms.length; ++i) {
        var is_input = !(typeof elms[i].placeholder == "undefined");
        var txt = (!is_input) ? elms[i].innerHTML : elms[i].placeholder;
        txt = reduceString(txt);
        if (txt == "" || typeof txt == "undefined")
            continue;
        if (from_lang == 'fr') {
            if (txt in fr_dict) {
                if (is_input)
                    elms[i].placeholder = fr_dict[txt];
                else
                    elms[i].innerHTML = fr_dict[txt];
            }
        } else {
            if (txt in en_dict) {
                if (is_input)
                    elms[i].placeholder = en_dict[txt];
                else
                    elms[i].innerHTML = en_dict[txt];
            }
        }
    }
}

// note that all the text has to be set previously already
// this will translate the entire document (excluding those divs that aren't loaded yet)
function frenchToEnglishAll() {
    var allelms = document.getElementsByTagName("*");
    var allplaceholders = $(':input');
    translateElms(allelms, 'fr', 'en');
    translateElms(allplaceholders, 'fr', 'en');
}

function englishToFrenchAll() {
    var allelms = document.getElementsByTagName("*");
    var allplaceholders = $(':input');
    translateElms(allelms, 'en', 'fr');
    translateElms(allplaceholders, 'en', 'fr');
}

// input must be json-parsed arrays
// returns {en->fr dict, fr->en dict}
function getTranslationDicts(en_array, fr_array) {
    var en_dict = {};
    var fr_dict = {};
    if (en_array.length != fr_array.length) {
        console.log("en_array and fr_array are not the same length");
        return;
    }
    for (var i = 0; i < en_array.length; ++i) {

        // keys are case-insensitive, but values preserve case-sensitivity
        en_dict[reduceString(en_array[i])] = fr_array[i];
        fr_dict[reduceString(fr_array[i])] = en_array[i];
    }

    return [en_dict, fr_dict];
}

// http://stackoverflow.com/questions/5802467/prevent-scrolling-of-parent-element
function scroll_handler(ev) {
    var $this = $(this),
        scrollTop = this.scrollTop,
        scrollHeight = this.scrollHeight,
        height = $this.innerHeight(),
        delta = ev.originalEvent.wheelDelta,
        up = delta > 0;

    var prevent = function() {
        ev.stopPropagation();
        ev.preventDefault();
        ev.returnValue = false;
        return false;
    }

    if (this.clientHeight == scrollHeight)
        return;

    if (!up && -delta > scrollHeight - height - scrollTop) {
        // Scrolling down, but this will take us past the bottom.
        $this.scrollTop(scrollHeight);
        return prevent();
    } else if (up && delta > scrollTop) {
        // Scrolling up, but this will take us past the top.
        $this.scrollTop(0);
        return prevent();
    }
}

// an extension of the above function
function scroll_handler_horizontal(ev) {
    var $this = $(this),
        scrollLeft = this.scrollLeft,
        scrollWidth = this.scrollWidth,
        width = $this.innerWidth(),
        delta = ev.originalEvent.wheelDelta,
        left = delta > 0;

    var prevent = function() {
        ev.stopPropagation();
        ev.preventDefault();
        ev.returnValue = false;
        return false;
    }

    if (!left && -delta > scrollWidth - width - scrollLeft) {
        // Scrolling right, but this will take us past the rightmost.
        $this.scrollLeft(scrollWidth);
        return prevent();
    } else if (left && delta > scrollLeft) {
        // Scrolling left, but this will take us past the leftmost.
        $this.scrollLeft(0);
        return prevent();
    }
}


function set_unselected_borders(menu_id, left_panels_ordering) {
    var cur_index = 0;
    for (var i = 0; i < left_panels_ordering.length; ++i) {
        if (left_panels_ordering[i] == menu_id)
            cur_index = i;
    }

    // corner cases at the ends
    if (cur_index != 0)
        set_borders(menu_id, 1, 1);
    var next_menu_panel = "";
    if (cur_index + 1 < left_panels_ordering.length) {
        next_menu_panel = left_panels_ordering[cur_index + 1];
        set_borders(next_menu_panel, 1, 1);
    }
}


function set_selected_borders(menu_id, left_panels_ordering) {
    set_borders(menu_id, 1, 0);

    // de-activate top border of the next menu panel
    var next_menu_panel = "";
    for (var i = 0; i < left_panels_ordering.length; ++i)
        if (left_panels_ordering[i] == menu_id && i + 1 < left_panels_ordering.length)
            next_menu_panel = left_panels_ordering[i + 1];

    if (next_menu_panel != "")
        set_borders(next_menu_panel, 1, 0);
}



// for the left panel gray borders
// topBorder = 0 for bottomBorder, = 1 for topBorder
// activate = 0 to activate, activate = 1 to de-activate
function set_borders(id, topBorder, activate) {
    var full_width = "0.5px";
    var empty_width = "0px";
    var menu_panel = document.getElementById(id);
    var children = menu_panel.children;
    var border_display = "";

    // look for the child responsible for borders
    for (var i = 0; i < children.length; ++i)
        if (children[i].className == "leftbtn_text")
            border_display = children[i];

    if (border_display != "") {
        if (topBorder == 0) {
            if (activate == 0) {
                border_display.style.borderBottom = "1px solid transparent";
                border_display.style.borderBottom = "0.5px";
            } else {
                border_display.style.borderBottom = "1px solid #dddddd";
                border_display.style.borderBottom = "0px";
            }
        } else {
            if (activate == 0) {
                border_display.style.borderTop = "1px solid transparent";
                // border_display.style.marginTop = "0.5px";
            } else {
                border_display.style.borderTop = "1px solid #dddddd";
                // border_display.style.marginTop = "0px";
            }
        }
    }
}


function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

function gotoPage(pageid) {
    var targetUrl = "index.php?country=" + country + "&lang=" + lang + "&goto=" + pageid;
    if (page == "pto" || page == "il") {
        if (typeof modelUsed != "undefined" && modelUsed == 1 && typeof currentModel != "undefined") {
            var modelIdPassed = currentModel;
        } else if (typeof modelid != "undefined" && modelid > -1) {
            var modelIdPassed = modelid;
        } else {
            var modelIdPassed = '-1';
        }
        targetUrl += "&currentModel=" + modelIdPassed;
        targetUrl += "&skintone=" + currentSkintone;
        if (!useNewAPI()) {
            targetUrl += "&x=" + apiserver + ":" + mainim;
        } else if (mode() != "live") {
            targetUrl += "&x=" + apiserver + ":";
        }
    } else {
        targetUrl += "&x=" + x;
    }

    if (useNewAPI()) {
        if (typeof local_image !== 'undefined' && local_image.facepoints != null) {
            saveData('local_image', local_image);
        }
        if (modelIdPassed != -1)
            saveData('local_image', null);
    }

    window.location = targetUrl;
}

function refit_mainim() {
    if ($('#mid_section').css('display') == 'none')
        return;

    var width = $('#makeover_windows').width();
    var height = $('#makeover_windows').height();
    var pos = getFittingParams(width, height);
    if (typeof pos == "undefined")
        return;

    test = pos;
    var mainim = document.getElementById('mainim');
    mainim.style.left = pos.left;
    mainim.style.top = pos.top;
    mainim.style.width = pos.width;

    if (page == "il") {
        //$('#origimcontainer').width($('#mainimcontainer').width());
        //$('#origimcontainer').height($('#mainimcontainer').height());

        // copy mainim
        var origim = document.getElementById('origim');
        origim.style.left = pos.left;
        origim.style.top = pos.top;
        origim.style.width = pos.width;
        origim.style.height = 'auto';
        /*$(origim).offset({left: $(mainim).offset().left});
        $(origim).offset({top: $(mainim).offset().top});
        $(origim).width($(mainim).width());
        $(origim).height($(mainim).height());*/
    }

    if (page == "il") {
        $('#crop').width($('#mainimcontainer').width() * crop_percentage);
    }
}

var mode_option = "model";
var optionChanged = false;

function selectOption(opt) {
    if (page == 'pto') {
        var prev_id = mode_option + "_block";
        var id = opt + "_block";
        document.getElementById(prev_id).style.borderColor = "white";
        document.getElementById(id).style.borderColor = "black";

        $('#edit_next_btn').css('opacity', '1');
        $('#edit_next_btn').css('cursor', 'pointer');
    }

    if (opt != mode_option) {
        mode_option = opt;
        optionChanged = true;
    }
}

// second arg is optional, but may be useful (e.g upload photo button for tablet, where option is set and selected at the same time)
function setOption(div, _mode_option) {
    if (_mode_option) {
        if (_mode_option != mode_option) {
            mode_option = _mode_option;
            optionChanged = true;
        }
    }
    if (!optionChanged && mode_option == "live") {
        closeEdit();
    } else {
        optionChanged = false;
        if (mode_option == "model") {
            closeEdit();
            show('photo');
            show('photo_x');
        } else if (mode_option == "live") {
            trackEvent("live mode");
            toLiveMode();
        } else if (mode_option == "upload") {
            selectOption('model'); // force user to click on upload again when coming back (to avoid confusion)
            var form_name = 'uploadform' + div.id[div.id.length - 1];
            if (useNewAPI())
                useFileInput(div, form_name);
            else
                uploadthefile(form_name);
            closeEdit();
        } else if (mode_option == "take") {
            toTakePhoto();
        }
    }
}


function persistImg(looks_mode, cb, prev_local_image) {
    currentModel = parseInt(currentModel);
    if (!isNaN(currentModel) && currentModel != -1) {
        selectModel(currentModel);
    } else {
        if (useNewAPI()) {
            local_image = prev_local_image;
            var module_wrapper = makeup_modules['backend_canvas'];
            var promise = module_wrapper.setImage(local_image.src_before, local_image.width, local_image.height);
            promise.then(
                function(coords) {
                    module_wrapper.has_set_image = true;
                    imageInputSuccess(coords, local_image, module_wrapper.module, local_image.width, local_image.height);
                    successfulUpload(uploaded_mainpic, false, false);
                    modelUsed = 0;
                    if (!hid_loader) {
                        window.setTimeout(hide_loader, 500); // additional delay to wait out intense processing
                        hid_loader = true;
                    }
                    hide('photo');
                },
                function() {
                    console.error('failed to set persisted image');
                }
            );
        } else {
            var url = "http://www.sephora.com/virtualartist/loadim.php?imip=" + imip +
                //var url = "loadim.php?imip=" + imip +
                "&imid=" + imid +
                "&cachefix=" + Math.random();

            var xmlHttp = GetXmlHttpObject();
            if (xmlHttp == null) {
                alert("Browser does not support HTTP Request");
                return;
            }

            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    var parts = xmlHttp.responseText.split(':');

                    mainim = parts[1];
                    mfid = parts[1];

                    currentMakeover['mainim'] = mainim;

                    var imgip = parts[0];
                    var uploaded_mainpic = parts[2];
                    uploaded_picwidth = parseInt(parts[3]);
                    uploaded_picheight = parseInt(parts[4]);
                    facePts['face'] = parts[5];
                    facePts['leye'] = parts[6];
                    facePts['reye'] = parts[7];
                    facePts['lips'] = parts[8];
                    facePts['teeth'] = parts[9];
                    setNewFacePts();

                    // update mainim
                    setmain(uploaded_mainpic, false);
                    hide('photo');
                    if (looks_mode === true) {
                        hide('skintones');

                        if (currentSkintone == "") {
                            resetSkintoneOpts();
                            show('skintones');
                        } else {
                            selectSkintone(currentSkintone);
                        }
                    }
                    if (typeof cb == "function") {
                        cb();
                    }
                }
            }

            xmlHttp.open("GET", url, true);
            xmlHttp.send(null);
        }

        if (mode() === 'photo' && modelUsed === 1) {
            hide('btnRefine');
            updateButtonWidth();
        }
    }
}

var seen_categories = new Set();

function passFilter(filterUsed, category, sku, colorId) {
    var prod = makeoverobject[category][sku][colorId];
    var pass = 0;
    var currentFilters = filters[filterUsed];

    // filter by palette
    var n = getObjectSize(makeoverobject[category][sku]);
    if (typeof(currentFilters['palette'][category]) != "undefined" && currentFilters['palette'][category].length == 1) {
        if (currentFilters['palette'][category][0] == "palette" && n <= 1) {
            return 0;
        } else if (currentFilters['palette'][category][0] == "single" && n > 1) {
            return 0;
        }
    }

    // filter by family
    if (typeof(currentFilters['family'][category]) != "undefined" && currentFilters['family'][category].length > 0) {
        var myFamily = prod['family'].toLowerCase();
        if (currentFilters['family'][category].indexOf(myFamily) <= -1) {
            return 0;
        }
    }

    // filter by brand
    if (typeof(currentFilters['brand'][category]) != "undefined" && currentFilters['brand'][category].length > 0) {
        var myBrand = prod['brand'].split(" ").join("").toLowerCase();
        if (currentFilters['brand'][category].indexOf(myBrand) <= -1) {
            return 0;
        }
    }

    // filter by formulation
    if (typeof(currentFilters['formulation']) != "undefined" && typeof(currentFilters['formulation'][category]) != "undefined" &&
        currentFilters['formulation'][category].length > 0) {
        var myFormulation = prod['formulation'].toLowerCase();
        if (currentFilters['formulation'][category].indexOf(myFormulation) <= -1) {
            return 0;
        }
    }

    // filter by finish
    if (typeof(currentFilters['finish'][category]) != "undefined" && currentFilters['finish'][category].length > 0) {
        var myFinish = prod['finish'].toLowerCase();
        if (myFinish == "") { return 0; }
        seen_finishes.add(myFinish);
        pass = 0;
        for (var f = 0; f < currentFilters['finish'][category].length; f++) {
            var finish = currentFilters['finish'][category][f];
            if (finish == myFinish) {
                pass = 1;
                break;
            }
        }
        if (!pass) { return 0; }
    }


    // filter by category
    if (typeof(currentFilters['category'][category]) != "undefined" && currentFilters['category'][category].length > 0) {
        if (category == "cheek") {
            var myCategory = prod['cheekcategory'].toLowerCase();
        } else {
            var myCategory = prod['mfcategory'].toLowerCase();
        }
        seen_categories.add(myCategory);
        if (myCategory == "") { return 0; }
        pass = 0;
        for (var f = 0; f < currentFilters['category'][category].length; f++) {
            var cate = currentFilters['category'][category][f];
            if (cate == myCategory) {
                pass = 1;
                break;
            }
        }
        if (!pass) { return 0; }
    }


    // filter by colorIQ
    if (typeof(currentFilters['colorIQ'][category]) != "undefined" && currentFilters['colorIQ'][category][0] == 1) {
        if (typeof ciqobject[currentFilters['colorIQ'][category][1]] == "undefined") {
            return 0;
        }
        pass = 0;
        var ciqZone = parseInt(ciqobject[currentFilters['colorIQ'][category][1]]);
        for (var i = 0; i < prod['ciq'].length; i++) {
            if (parseInt(prod['ciq'][i]) == ciqZone) {
                pass = 1;
                break;
            }
        }
        if (!pass) { return 0; }
    }

    // filter by favorites
    var isFav = 0;
    if (typeof myFavorites[category][sku + "_" + colorId] != "undefined" && myFavorites[category][sku + "_" + colorId] == 1) {
        isFav = 1;
    }
    if (parseInt(currentFilters['myFavorites'][category]) == 1 && isFav == 0) {
        return 0;
    }

    var isNew = parseInt(prod['isnew']);
    var isBestSeller = parseInt(prod['isbestseller']);

    if (parseInt(currentFilters['justArrived'][category]) == 1 && parseInt(currentFilters['bestSellers'][category]) == 1) {
        if (isNew == 1 || isBestSeller == 1) {
            return 1;
        }
    }

    // filter by just arrived
    if (parseInt(currentFilters['justArrived'][category]) == 1 && isNew == 0) {
        return 0;
    }

    // filter by best seller
    if (parseInt(currentFilters['bestSellers'][category]) == 1 && isBestSeller == 0) {
        return 0;
    }

    // filter by search string
    var productName = prod['productname'].toLowerCase().split(" ").join("");
    var shadeName = prod['shadename'].toLowerCase().split(" ").join("");
    if (shadeName == "") {
        if (typeof prod['colorname'] != "undefined") {
            shadeName = prod['colorname'].toLowerCase().split(" ").join("");
        }
    }
    var brandName = prod['brand'].toLowerCase().split(" ").join("");
    var q = currentFilters['searchString'][category];
    var thresh = 0.3;

    /*if (q != "") {
    	if (stringSimilarity(brandName, q) < thresh &&
    		stringSimilarity(productName, q) < thresh &&
    		stringSimilarity(shadeName, q) < thresh)
    		return 0;
    }*/

    if (q != "" && productName.indexOf(q) == -1 &&
        shadeName.indexOf(q) == -1 && brandName.indexOf(q) == -1) {
        return 0;
    }

    return 1;
}

function productSearch(e) {
    var keyCode = e.keyCode || e.which;

    var newSearch = document.getElementById(currentCategory + '_textsearch').value;
    newSearch = newSearch.trim().toLowerCase().split(" ").join("");
    if (newSearch == filters['appliedFilters']['searchString'][currentCategory]) {
        return;
    } else {
        filters['currentFilters']['searchString'][currentCategory] = newSearch;
        filters['appliedFilters']['searchString'][currentCategory] = newSearch;
        playFilters();
        applyFilters();
    }
    /*
    if(keyCode == '13') {
        var newSearch = document.getElementById(currentCategory+'_textsearch').value;
        newSearch = newSearch.trim().toLowerCase().split(" ").join("");
        if(newSearch == filters['appliedFilters']['searchString'][currentCategory]) {
            return;
        } else {
            filters['currentFilters']['searchString'][currentCategory] = newSearch;
            filters['appliedFilters']['searchString'][currentCategory] = newSearch;
            playFilters();
            applyFilters();
        }
    }
    */
}

function preventScroll(event) {
    event.preventDefault();
}

function shopSephora() {
    if (countrycode == "en_CA") {
        // Fine
        // window.open("http://www.sephora.com", "_blank");
        window.open("http://www.sephora.com/?country_switch=ca&lang=en");
    } else if (countrycode == "fr_CA") {
        // Fine
        // window.open("http://www.sephora.com/?country_switch=ca", "_blank");
        window.open("http://www.sephora.com/?country_switch=ca&lang=fr");
    } else if (countrycode == "en_US") {
        // Fine
        // window.open("http://www.sephora.com/?country_switch=ca&country_switch=ca&lang=fr", "_blank");
        window.open("http://www.sephora.com/?country_switch=us&lang=en");
    }
}

function download_and() {
    switch (page) {
        case "landing":
            trackEventVA("sephora to go app for android:cta");
            break;
        case "pto":
            trackEvent("sephora to go app for android:cta");
            break;
        case "il":
            trackEventLooks("sephora to go app for android:cta");
            break;
        case "tut":
            trackEventVA("virtual tutorials:sephora to go app for android");
            break;
    }
    window.open("https://play.google.com/store/apps/details?id=com.sephora&hl=en");
}

function download_ios() {
    switch (page) {
        case "landing":
            trackEventVA("sephora to go app for phone:cta");
            break;
        case "pto":
            trackEvent("sephora to go app for iphone:cta");
            break;
        case "il":
            trackEventLooks("sephora to go app for iphone:cta");
            break;
        case "tut":
            trackEventVA("virtual tutorials:sephora to go app for iphone");
            break;
    }
    //window.open("https://itunes.apple.com/ca/app/sephora-to-go/id393328150?mt=8");
    window.open("https://187039.measurementapi.com/serve?action=click&publisher_id=187039&site_id=54230&offer_id=288680&invoke_id=268185&my_campaign=VAMobileWebBanner");
}

function switchLang(code) {
    if (code === countrycode) {
        return;
    }

    var version = '_5.0.php';
    //var start = 'https://mfefacetracker-dev.modiface.com/sephora-web5.0-test/';
    var start = 'http://www.sephora.com/virtualartist/sephora-web5.0/';
    if (code == "en_US") {
        var countryLang = '?country=US&lang=en';
        // window.location = 'https://mfefacetracker-dev.modiface.com/sephora-web5.0-test/index.php?goto="+page+"&country=US&lang=en';

        window.location = start + page + version + countryLang;

        // window.location = "http://www.sephora.com/virtualartist/?goto="+page+"&country=US&lang=en";
        // window.location = "https://mfe.modiface.com/sephora-web4.0/index.php?goto="+page+"&country=US&lang=en";
    } else if (code == "fr_CA") {
        var countryLang = '?country=CA&lang=fr';
        window.location = start + page + version + countryLang;

        // window.location = 'https://mfefacetracker-dev.modiface.com/sephora-web5.0-test/index.php?goto="+page+"&country=CA&lang=fr';
        // window.location = "http://www.sephora.com/virtualartist/?goto="+page+"&country=CA&lang=fr";
        // window.location = "https://a0.modiface.com/sephora-web4.0/index.php?goto="+page+"&country=CA&lang=fr";
    } else if (code == "en_CA") {
        var countryLang = '?country=CA&lang=en';
        window.location = start + page + version + countryLang;

        // window.location = 'https://mfefacetracker-dev.modiface.com/sephora-web5.0-test/index.php?goto="+page+"&country=CA&lang=en'
        // window.location = "http://www.sephora.com/virtualartist/?goto="+page+"&country=CA&lang=en";
        // window.location = "https://a0.modiface.com/sephora-web4.0/index.php?goto="+page+"&country=CA&lang=en";
    }
}

var resetToLiveOnClose = false; // only relevant for pto
var uploaded_picwidth = 0;
var uploaded_picheight = 0;
var mainim = "";

var live_uploaded_picwidth = 0;
var live_uploaded_picheight = 0;
var liveim = "";
var live_photo_taken = false;

var shareim = "";
var compareshareim = "";

var skintones = ['light', 'medium', 'mediumtanned', 'deep'];

var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

var makeoverobject;

function parse_data() {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }

    //var url="parsedata.php";
    var url = 'http://www.sephora.com/virtualartist/parsedata.php'
    url = url + "?psx=24";
    url = url + "&country=" + country;
    if (page == "il") {
        url = url + "&page=il";
    }
    url += "&cachefix=" + Math.random();

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            //hide('loader_gif');
            makeoverobject = JSON.parse(xmlHttp.responseText);
            if (is.not.mobile()) {
                //orderShades2();
                setDropdown();
            }
            init_products();
        }
    }

    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

//apply functions
function apply() {
    updateCurrentProducts();
    applyMakeup();
}

function isLocalImage(img) {
    if (img.length < 4)
        return false;
    return img.substring(0, 4) == 'data';
}

function updatemain(img) {
    var im = document.getElementById('mainim');
    im.src = adjustImageSrc(img);
    currentMakeover['mainim'] = img;
    currentMakeover['remote_id'] = -1;
}

function showSharePopup() {
    show('share');
    if ((inCompare() || mode() == 'live') && modelUsed == 0)
        show('touchup_button');
    else
        hide('touchup_button');
}

// is this one even used?
function my_completion_handler(msg) {
    var a = msg;
    if (a != "") {
        show('btnRefine');
        updateButtonWidth();
        var parts = a.split(":");
        if (parts[0] == "error") {
            if (parts[1] == "noface" || parts[1] == "badface") {
                error("Uh-oh. We couldn’t detect your face in the image uploaded. Please try another image.");
            }
            if (parts[1] == "filesize") {
                error("Sorry. That image exceeds our file size limit. Please choose a file that is 5MB or smaller.");
            }
            hide('whitelayer');
            video.play();
            return;
        }

        hide('whitelayer');
        hide('takePhoto');
        var imgip = parts[0];
        var userIm = parts[1];
        uploaded_mainpic = parts[2];
        mainim_candidate = parts[1];
        mfid = parts[1];

        uploaded_picwidth = parseInt(parts[3]);
        uploaded_picheight = parseInt(parts[4]);
        facePts['face'] = parts[5];
        facePts['leye'] = parts[6];
        facePts['reye'] = parts[7];
        facePts['lips'] = parts[8];
        facePts['teeth'] = parts[9];
        setNewFacePts();

        if (apiserver != parts[0]) {
            var xmlHttp = GetXmlHttpObject();
            if (xmlHttp == null) {
                alert("Browser does not support HTTP Request");
                return;
            }
            var url = "http://www.sephora.com/virtualartist/proxy.php";
            //var url = "proxy.php";

            url = url + "?psx=24" +
                "&apiserver=" + apiserver +
                "&action=copyfiles" +
                "&id=" + userIm +
                "&id2=" + uploaded_mainpic +
                "&imgip=" + imgip +
                "&myip=" + apiserver;
            //alert("myapiserver is: "+apiserver+"; imgserver is: "+imgip);

            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                    if (mode() == "live") {
                        hide('takePhoto');
                        hide('whitelayer');
                        toRefine();
                    } else {
                        setmain(uploaded_mainpic, uploaded_picwidth, uploaded_picheight);
                        hide('takePhoto');
                        hide('whitelayer');
                        toRefine();
                    }
                }
            }

            xmlHttp.open("GET", url, true);
            xmlHttp.send(null);
        } else {
            if (mode() == "live") {
                hide('takePhoto');
                hide('whitelayer');
                toRefine();
            } else {
                setmain(uploaded_mainpic, uploaded_picwidth, uploaded_picheight);
                hide('takePhoto');
                hide('whitelayer');
                toRefine();
            }
        }
    }
}

function share() {
    if (page == "il") {
        trackEventLooks("features:share");
    } else {
        trackEvent("features:share");
    }

    if (shareMode != "instant") {
        shareMode = "single";
    }

    $('#shareim').css('opacity', 0);
    generateShare();
}

function shareBtnClicked() {
    if (mode() == 'live')
        toTakePhoto(photoUsageStates.SHARE);
    else
        share();
}

/*
function shareCompare() {
    if(currentMode == "photo") {
        generateShareCompare();
    } else {
        if(share_photo_taken == false) {
            prepareTakePhoto();
            share_photo_taken = true;
            return;
        } else {
            applyOnLiveImage();
        }
    }
}*/

function shareImageReadyEmail() {
    var xmlHttp = this;
    if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
        resultarray = xmlHttp.responseText.split(':');
        result = resultarray[2];
        compareshareim = result;
        shareim = result;
        show('email_popup');
    }
}

function shareImageReady() {
    var xmlHttp = this;
    if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
        resultarray = xmlHttp.responseText.split(':');
        result = resultarray[2];
        shareim = result;
        compareshareim = result;
        showSharePopup();

        var im = document.getElementById('shareim');
        im.style.left = 0;
        im.style.top = 0;
        im.style.width = "100%";
        im.src = "http://" + apiserver + "/" + appname + "/share/" + compareshareim + ".jpg";

        im = document.getElementById('shareim_sharephoto');
        if (im != null) {
            im.src = "http://" + apiserver + "/" + appname + "/share/" + compareshareim + ".jpg";
            im.style.left = "0px";
            im.style.top = "0px";
            im.style.width = "100%";
        }
    }
}

// uses compare images when appropriate, otherwise just uses mainim
// only stringifies dirtied images (changed locally but not on server)
function getStringifiedImages() {

    // add stringified images to request (as array)
    var post_arr = [];

    if (inCompare()) {
        for (var i = 0; i < compare.length; ++i)
            if (compare[i] != -1 && needServerUpdate(compare[i]))
                post_arr.push(compare[i]['mainim']);
    } else if (needServerUpdate(currentMakeover))
        post_arr.push($('#mainim').attr('src'));

    if (post_arr.length > 0)
        return JSON.stringify(post_arr);
}

// check if url is dirty
function needServerUpdate(makeover) {
    return makeover['remote_id'] == -1;
}

function generateShare(showemail) {
    if (typeof showemail == "undefined") {
        showemail = 0;
    }

    if (useNewAPI()) {
        // come back when images are properly set on server through setServerImages' callback

        if (showemail) {
            photoSavedCbState = photoSavedCbStates.EMAIL;
        } else {
            photoSavedCbState = photoSavedCbStates.SHARE;
        }

        if (inCompare()) {
            for (var i = 0; i < compare.length; ++i)
                if (needServerUpdate(compare[i])) {
                    setServerImages();
                    return;
                }
        } else if (needServerUpdate(currentMakeover)) {
            setServerImages(showemail);
            return;
        }
    }

    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }

    shareMode = "compare";
    var tag = (useNewAPI()) ? "remote_id" : "mainim";
    var full_w = 100;
    var full_h = 100;
    var pos = getFittingParams(full_w, full_h);
    var im = document.getElementById('posImage');
    im.style.left = pos.left;
    im.style.top = pos.top;
    im.style.width = pos.width;

    var cropRatio = 0;
    var containerWidth = 100;
    cropRatio = uploaded_picwidth / pos.width;

    var cropWidth = parseInt(containerWidth * cropRatio);
    var cropLeft = parseInt(-1 * pos.left * cropRatio);
    var cropTop = parseInt(-1 * pos.top * cropRatio);

    var url = "http://www.sephora.com/virtualartist/proxy.php";
    //var url = "proxy.php";
    url += "?psx=24";
    url += "&action=shareCompare";
    url += "&apiserver=" + apiserver;

    if (inCompare()) {
        for (var i = 0; i < compare.length; i++) {
            if (compare[i] != -1)
                url += "&img" + i + "=" + compare[i][tag];
        }
    } else {
        url += "&img0=" + currentMakeover[tag];
    }

    url += "&crop=" + cropLeft + "," + cropTop + "," + cropWidth;
    url += "&cachefix=" + Math.random();

    if (showemail == 1) {
        xmlHttp.onreadystatechange = shareImageReadyEmail;
    } else {
        xmlHttp.onreadystatechange = shareImageReady;
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);

    /*var pos = getFittingParams(100, 100);
    var im = document.getElementById('posImage');
    im.style.left = pos[0];
    im.style.top = pos[1];
    im.style.width = pos[2];

    var containerWidth = 100;
    var cropRatio = uploaded_picwidth / (parseFloat(im.style.width) / 100  * containerWidth);

    var cropWidth = parseInt(containerWidth * cropRatio);
    var cropLeft = parseInt(-1 * containerWidth * parseFloat(im.style.left) / 100 * cropRatio);
    var cropTop = parseInt(-1 * containerWidth * parseFloat(im.style.top) / 100 * cropRatio);

    var url="shareCompareFromDataURL.php?";
    url += "&cachefix="+Math.random();
    url +="&crop="+cropLeft+","+cropTop+","+cropWidth;

    var poststr = 'img_array=' + getStringifiedImages();

    // post image data
    xmlHttp.onreadystatechange = shareImageReady;
    xmlHttp.open("POST",url,true);
    xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlHttp.send(poststr);*/
}

/*
function generateShare(setImage) {
    if(shareMode != "instant") {
        shareMode = "single";
    }

    var xmlHttp=GetXmlHttpObject();
    if (xmlHttp==null) {
        alert("Browser does not support HTTP Request");
        return;
    }

    var pos = fitMainim(100, 100);
    var im = document.getElementById('posImage');
    im.style.left = pos[0];
    im.style.top = pos[1];
    im.style.width = pos[2];

    var img="";
    var cropRatio=0;
    var containerWidth = 100;
    cropRatio = uploaded_picwidth / (parseFloat(im.style.width) / 100  * containerWidth);
    img = currentMakeover['mainim'];

    if(typeof setImage != "undefined") {
        img = setImage;
    }

    var im = document.getElementById('shareim');
    im.src = "img/"+img+".jpg";
    im.style.left = pos[0];
    im.style.top = pos[1];
    im.style.width = pos[2];

    var cropWidth = parseInt(containerWidth * cropRatio);
    var cropLeft = parseInt(-1 * containerWidth * parseFloat(im.style.left) / 100 * cropRatio);
    var cropTop = parseInt(-1 * containerWidth * parseFloat(im.style.top) / 100 * cropRatio);

    var url="proxy.php";
    url+="?psx=24";
    url+="&action=addLogo";
    url+="&apiserver="+apiserver;
    url+="&id="+img;
    url+="&crop="+cropLeft+","+cropTop+","+cropWidth;
    url+="&cachefix="+Math.random();

    xmlHttp.onreadystatechange=function() {
        if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete") {
            resultarray=xmlHttp.responseText.split(':');
            result=resultarray[2];
            shareim = result;

            show('share');

            var w = parseInt(document.getElementById('shareim_container').clientWidth);
            var h = parseInt(document.getElementById('shareim_container').clientHeight);

            var pos = fitMainim(w,h);
            var im = document.getElementById('shareim');
            im.src = "http://"+apiserver+"/"+appname+"/share/"+shareim+".jpg";
            im.style.left = "0px";
            im.style.top = "0px";
            im.style.width = "100%";

            im = document.getElementById('shareim_sharephoto');
            if(im != null) {
                im.src = "http://"+apiserver+"/"+appname+"/share/"+shareim+".jpg";
                im.style.left = "0px";
                im.style.top = "0px";
                im.style.width = "100%";
            }

        }
    }

    xmlHttp.open("GET",url,true);
    xmlHttp.send(null);
}*/



function shareDownload() {
    if (shareMode == "single" || shareMode == "instant") {
        var simg = shareim;
    } else {
        var simg = compareshareim;
    }

    if (page == "il") {
        trackEventLooks("share:download");
    } else {
        trackEvent("compare:share:download");
    }
    var imgurl = "http://" + apiserver + "/" + appname + "/share/" + simg + ".jpg";
    window.open('http://' + apiserver + '/' + appname + '/downloadimage.php?apiserver=' + apiserver + '&imgurl=' + imgurl);
}

function shareFacebook() {
    if (shareMode == "single" || shareMode == "instant") {
        var simg = shareim;
    } else {
        var simg = compareshareim;
    }

    if (page == "il") {
        trackEventLooks("share:facebook");
    } else {
        trackEvent("compare:share:facebook");
    }

    var url = "http://www.sephora.com/virtualartist/proxy.php?psx=24";
    //var url = "proxy.php?psx=24";
    url += "&action=addPadding4FB";
    url += "&apiserver=" + apiserver;
    url += "&imgid=" + simg;
    url += "&cachefix=" + Math.random();

    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var result = xmlHttp.responseText;
            var imgurl = "http://" + apiserver + "/" + appname + "/share/" + result + ".jpg";

            FB.ui({
                method: 'share_open_graph',
                action_type: 'og.shares',
                display: 'popup',
                action_properties: JSON.stringify({
                    object: {
                        'og:url': 'http://www.sephora.com/virtualartist/',
                        'og:title': 'Sephora Virtual Artist | Looks I Love from Sephora | Sephora',
                        'og:description': 'http://www.sephora.com/virtualartist',
                        'og:image': imgurl
                    }
                })
            });
        }
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

function shareTwitter() {
    if (shareMode == "single" || shareMode == "instant") {
        var simg = shareim;
    } else {
        var simg = compareshareim;
    }
    if (page == "il") {
        trackEventLooks("share:twitter");
    } else {
        trackEvent("compare:share:twitter");
    }
    var url = "shareTwitter.php?im=" + simg + "&apiserver=" + apiserver;
    window.open(url);
}

function sharePinterest() {
    if (shareMode == "single" || shareMode == "instant") {
        var simg = shareim;
    } else {
        var simg = compareshareim;
    }

    if (page == "il") {
        trackEventLooks("share:pinterest");
    } else {
        trackEvent("compare:share:pinterest");
    }
    var imgurl = "http://" + apiserver + "/" + appname + "/share/" + simg + ".jpg";
    var url = 'https://pinterest.com/login/?next=/pin/create/link/' + encodeURIComponent('?url=' + encodeURIComponent(pinterestUrl) + '&media=' + encodeURIComponent(imgurl) + '&description=' + encodeURIComponent(caption));
    window.open(url);
}

function shareEmail(skipgen) {
    trackEvent('email products');
    trackEvent('compare:share:email');

    if (shareMode != "instant") {
        shareMode = "single";
    }

    if (typeof skipgen != "undefined" && skipgen == 1) {
        show('email_popup');
        return;
    }
    $('#shareim').css('opacity', 0);
    generateShare(1);
}

function emailInputFocus() {
    if (document.emailproductform.addr.value != "") {
        document.emailproductform.addr.value = "";
    }
    document.emailproductform.addr.style.border = "1px solid #777777";
    if (!is.mobile()) {
        var error_container = document.getElementById('email_error').parentNode;
        error_container.style.height = "10px";
    }
    hide('email_error');
}

function emailProductInputFocus() {
    if (document.emailproductform.addr.value != "") {
        document.emailproductform.addr.value = "";
    }
    document.emailproductform.addr.style.border = "1px solid #777777";

    hide('email_error');
    /*
    if(!is.mobile()) {
	    debugger;
        var error_container = document.getElementById('email_product_error').parentNode;
        debugger;
        error_container.style.height = "10px";
    }
    hide('email_product_error');
    */
}


function createProdsJSON() {
    var prods = [];
    if (shareMode == "instant") {
        var look = [];
        var ps = looks[currentLook]['products_' + currentSkintone];
        for (var i = 0; i < ps.length; i++) {
            var p = ps[i];
            var pr = [];
            pr.push(p['thumbUrl']);
            pr.push(p['brand']);
            if (p['shadeName'] != "") {
                pr.push(p['productName'] + " in " + p['shadeName']);
            } else {
                pr.push(p['productName'] + " in " + p['colorName']);
            }
            if (country == "ca" || country == "CA") {
                pr.push(getPriceStr(pricef(p['priceCAD'])));
            } else {
                pr.push(pricef(p['price']));
            }
            pr.push(p['productUrl']);
            look.push(pr.join("~~~"));
        }
        prods = look.join("PPRR");
    } else if (shareMode == "single") {
        var look = [];
        for (var category in currentMakeover['products']) {
            for (var pl in currentMakeover['products'][category]) {
                if (currentMakeover['products'][category][pl] != -1 && currentMakeover['products'][category][pl] != "") {
                    var parts = currentMakeover['products'][category][pl].split("_");
                    var p = makeoverobject[parts[0]][parts[1]][parts[2]];
                    var pr = [];
                    pr.push(p['thumburl']);
                    pr.push(p['brand']);
                    if (p['shadename'] != "") {
                        pr.push(p['productname'] + " in " + p['shadename']);
                    } else {
                        pr.push(p['productname'] + " in " + p['colorname']);
                    }
                    if (country == "ca" || country == "CA") {
                        pr.push(getPriceStr(pricef(p['priceca'])));
                    } else {
                        pr.push(pricef(p['priceus']));
                    }
                    pr.push(p['producturl']);
                    look.push(pr.join("~~~"));
                }
            }
        }
        prods = look.join("PPRR");
    } else {
        for (var l = 0; l < compare.length; l++) {
            var look = [];
            for (var category in compare[l]['products']) {
                for (var pl in compare[l]['products'][category]) {
                    if (compare[l]['products'][category][pl] != -1 && compare[l]['products'][category][pl] != "") {
                        var parts = compare[l]['products'][category][pl].split("_");
                        var p = makeoverobject[parts[0]][parts[1]][parts[2]];
                        var pr = [];
                        pr.push(p['thumburl']);
                        pr.push(p['brand']);
                        if (p['shadename'] != "") {
                            pr.push(p['productname'] + " in " + p['shadename']);
                        } else {
                            pr.push(p['productname'] + " in " + p['colorname']);
                        }
                        pr.push(p['priceus']);
                        pr.push(p['producturl']);
                        look.push(pr.join("~~~"));
                    }
                }
            }
            look = look.join("PPRR");
            prods.push(look);
        }
        prods = prods.join("LLKK");
    }
    return prods;
}

function getDisplaySection(category) {
    switch (category) {
        case "contour":
        case "highlighter":
        case "bronzer":
        case "blush":
        case "cheek":
            return "cheek";
            break;
        case "eyeshadow":
        case "mascara":
        case "lash":
        case "eyeliner":
        case "brow":
            return "eye";
            break;
        case "lips":
            return "lip";
            break;
        default:
            return;
    }
}

function createEmailProductProdsJSON(type) {
    var prods = [];
    if (type == "instant") {
        var c = { "eye": [], "cheek": [], "lip": [] };
        var look = [];
        var ps = lookProducts[currentLook][currentSkintone];
        for (var sku in ps) {
            var p = ps[sku];
            var pr = [];

            var category = p['category'];
            if (typeof makeoverobject[category][sku] != "undefined") {
                p = makeoverobject[category][sku][0];
                pr.push(p['thumburl']);
                pr.push(p['brand']);
                pr.push(p['productname']);
                pr.push(p['shadename']);
                if (country == "ca" || country == "CA") {
                    if (p['priceca']) {
                        pr.push(getPriceStr(pricef(p['priceca'])));
                    } else {
                        pr.push(getPriceStr(pricef("$.00")));
                    }
                } else {
                    pr.push(pricef(p['priceus']));
                }
                pr.push(p['averagerating']);
                pr.push(p['producturl']);
            } else {
                pr.push(p['thumbUrl']);
                pr.push(p['brand']);
                pr.push(p['productName']);
                if (p['shadeName'] != "") {
                    pr.push(p['shadeName']);
                } else {
                    pr.push(p['colorName']);
                }
                if (country == "ca" || country == "CA") {
                    if (p['priceca']) {
                        pr.push(getPriceStr(pricef(p['priceCAD'])));
                    } else {
                        pr.push(getPriceStr(pricef("$.00")));
                    }
                } else {
                    pr.push(pricef(p['price']));
                }
                pr.push(0);
                pr.push(p['productUrl']);
            }
            c[getDisplaySection(category)].push(pr.join("~~~"));
        }
        prods = c['eye'].join("PPRR") + "CCCC" + c['lip'].join("PPRR") + "CCCC" + c['cheek'].join("PPRR");
    } else if (type == "compare") {
        for (var l = 0; l < compare.length; l++) {
            if (compare[l] == -1)
                continue;
            var look = [];
            var c = { "eye": [], "cheek": [], "lip": [] };
            for (var category in compare[l]['products']) {
                for (var pl in compare[l]['products'][category]) {
                    if (compare[l]['products'][category][pl] != -1 && compare[l]['products'][category][pl] != "") {
                        var parts = compare[l]['products'][category][pl].split("_");
                        var p = makeoverobject[parts[0]][parts[1]][parts[2]];
                        var pr = [];
                        pr.push(p['thumburl']);
                        pr.push(p['brand']);
                        pr.push(p['productname']);
                        if (p['shadename'] != "") {
                            pr.push(p['shadename']);
                        } else {
                            pr.push(p['colorname']);
                        }
                        if (country == "CA" || country == "ca") {
                            if (p['priceca']) {
                                pr.push(getPriceStr(pricef(p['priceca'])));
                            } else {
                                pr.push(getPriceStr(pricef("$.00")));
                            }
                        } else {
                            pr.push(pricef(p['priceus']));
                        }
                        pr.push(p['averagerating']);
                        pr.push(p['producturl']);
                        c[getDisplaySection(category)].push(pr.join("~~~"));
                    }
                }
            }
            prods.push(c['eye'].join("PPRR") + "CCCC" + c['lip'].join("PPRR") + "CCCC" + c['cheek'].join("PPRR"));
        }
        prods = prods.join("LLKK");
    } else {
        var look = [];
        var c = { "eye": [], "cheek": [], "lip": [] };
        for (var category in currentMakeover['products']) {
            for (var pl in currentMakeover['products'][category]) {
                if (currentMakeover['products'][category][pl] != -1 && currentMakeover['products'][category][pl] != "") {
                    var parts = currentMakeover['products'][category][pl].split("_");
                    var p = makeoverobject[parts[0]][parts[1]][parts[2]];
                    var pr = [];
                    pr.push(p['thumburl']);
                    pr.push(p['brand']);
                    pr.push(p['productname']);
                    if (p['shadename'] != "") {
                        pr.push(p['shadename']);
                    } else {
                        pr.push(p['colorname']);
                    }
                    if (country == "CA" || country == "ca") {
                        pr.push(getPriceStr(pricef(p['priceca'])));
                    } else {
                        pr.push(pricef(p['priceus']));
                    }
                    pr.push(p['averagerating']);
                    pr.push(p['producturl']);
                    c[getDisplaySection(category)].push(pr.join("~~~"));
                }
            }
        }
        prods = c['eye'].join("PPRR") + "CCCC" + c['lip'].join("PPRR") + "CCCC" + c['cheek'].join("PPRR");
    }
    return prods;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function sendEmail() {
    var email = document.emailproductform.addr.value;
    if (!email || !validateEmail(email)) {
        document.emailproductform.addr.style.border = "1px solid rgb(255,0,0)";
        var error_container = document.getElementById('email_error').parentNode;
        error_container.style.height = "30px";
        show('email_error');
        return;
    }

    if (is.mobile()) {
        if (shareMode == "instant") {
            sendProductEmail();
            //var simg = shareim;
            //document.emailform.lookname.value = looks[currentLook]['lookName'].toUpperCase();
        } else if (shareMode == "single") {
            sendProductEmail();
            //var simg = shareim;
        } else {
            sendProductEmail('compare');
            //var simg = compareshareim;
        }
    } else {
        if (inCompare())
            sendProductEmail('compare');
        else
            sendProductEmail();
    }

    /*
	var prods = createProdsJSON();
	document.emailform.img.value=simg;
	document.emailform.prods.value = prods;
	document.emailform.apiserver.value=apiserver;
	document.emailform.submit();
    */
    if (page == "il") {
        trackEventLooks("share:email");
    } else {
        trackEvent("compare:share:email");
    }
    hide('email_popup');
}


function show_loader() {
    show('whitelayer');
}

function hide_loader() {
    fade_out('whitelayer');
    //hide('whitelayer');
}

//camera functions
function detectCamera() {
    // HTML5 Webcam
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
    if (!!navigator.getUserMedia && devicemode == 'desktop') {
        return true;
    } else {
        return false;
    }
}

function take_snapshot_3() {
    if (typeof video != "undefined" && video.playing == 1) {
        video.pause();
        var canvas_photo = document.getElementById('canvas_photo');

        var myImageData = canvas_photo.toDataURL();

        var xmlHttp = GetXmlHttpObject();
        if (xmlHttp == null) {
            alert("Browser does not support HTTP Request");
            return;
        }

        show_loader();

        var url = "http://www.sephora.com/virtualartist/upload_webcam.php";
        //var url = "upload_webcam.php";
        url = url + "?usermedia=1" +
            "&cachefix=" + Math.random();


        var poststr = "img=" + myImageData;

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
                var result = xmlHttp.responseText;
                my_completion_handler(result);
            }
        }

        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(poststr);


    } else {
        webcam_photo.snap();
        webcam_photo.freeze();

        show_loader();
    }
}

function getFittingParams(full_w, full_h, mode) {
    if (useNewAPI() && makeup_modules['backend_canvas'] && makeup_modules['backend_canvas'].has_set_image)
        return getFittingParamsFromLocal(full_w, full_h, mode);
    else
        return fitMainim(full_w, full_h, mode);
}

// a clone of fitMainim, but for the new makeup API
function getFittingParamsFromLocal(full_w, full_h, mode) {
    var pic_width = uploaded_picwidth;
    var pic_height = uploaded_picheight;
    var pts = facebounds;

    if (typeof pts == "undefined")
        return;

    return fitParamsFromFacebox(pic_width, pic_height, full_w, full_h, getBox(pts));
}

function fitMainim(fw, fh, mode) {
    var pts = facePts['face'].split(",");
    var upPicWidth = uploaded_picwidth;
    var upPicHeight = uploaded_picheight;

    var facebox = new Object({});
    facebox.left = parseInt(pts[0]);
    facebox.top = parseInt(pts[1]);
    facebox.width = parseInt(pts[2]);
    facebox.height = parseInt(pts[3]);
    return fitParamsFromFacebox(upPicWidth, upPicHeight, fw, fh, facebox);
}

function fitParamsFromFacebox(pic_width, pic_height, full_w, full_h, facebox) {
    var res = new Object({});
    var w_ratio = full_w / facebox.width;
    var h_ratio = full_h / facebox.height;

    // fit longest side of face to container, keeping aspect ratio
    var scale_to_fit = Math.min(w_ratio, h_ratio);
    var zoom = 0.74;
    var final_zoom = scale_to_fit * zoom;
    var final_face_w = facebox.width * final_zoom;
    var final_face_h = facebox.height * final_zoom;
    var final_face_l = facebox.left * final_zoom;
    var final_face_t = facebox.top * final_zoom;

    res.width = pic_width * final_zoom;
    var final_height = pic_height * final_zoom;

    if (res.width > full_w) {
        // pull face to center
        res.left = full_w / 2 - final_face_l - final_face_w / 2;
        res.top = full_h / 2 - final_face_t - final_face_h / 2;

        // prevent white space
        res.left = Math.min(res.left, 0);
        res.left = Math.max(res.left, full_w - res.width);
        res.top = Math.min(res.top, 0);
        res.top = Math.max(res.top, full_h - final_height);
    } else {
        // center image [INNOV-896]
        res.left = (full_w - res.width) / 2;
        res.top = (full_h - final_height) / 2;
    }

    // convert to percentages
    //res[0] = 100 * res[0] / full_w + "%";
    //res[1] = 100 * res[1] / full_h + "%";
    //res[2] = 100 * res[2] / full_w + "%";
    return res;
}

function mobfitMainim(fw, fh, mode) {
    var pts = facePts['face'].split(",");
    var upPicWidth = uploaded_picwidth;
    var upPicHeight = uploaded_picheight;

    var facew = parseInt(pts[2]);
    var faceh = parseInt(pts[3]);
    var zoom = 1.0;
    var minDim = 0;

    if (typeof mode != "undefined" && mode == "confirm") {
        var heightRatio = 1.4;
        var widthRatio = 1.5;
    } else {
        var heightRatio = 1.6;
        var widthRatio = 1.7;
    }

    if (fw / facew < fh / faceh) {
        zoom = fh / (faceh * heightRatio);
    } else {
        zoom = fh / (facew * widthRatio);
        /*
        zoom = fh / (facew * 1.6);
        if(zoom * upPicHeight < fh) {
            zoom = fh / upPicHeight;
        }
        */
    }

    if (zoom * upPicWidth < fw) {
        zoom = fw / upPicWidth;
    }

    var res = [];
    res[0] = Math.min(0, (-1 * ((parseInt(pts[0]) + facew / 2) * zoom - fw / 2) / fw * 100)) + "%";
    res[1] = Math.min(0, (-1 * ((parseInt(pts[1]) + faceh / 2) * zoom - fh / 2) / fh * 100)) + "%";
    res[2] = parseInt(upPicWidth) * zoom / fw * 100 + "%";
    return res;
}

function pricef(price) {
    var parts = price.split("$");
    if (parts.length == 1) {
        price = "$" + price;
    }

    parts = price.split(".");
    if (parts.length == 1) {
        price = price + ".00";
    }
    return price;
}

//DOM creation functions
var displayNames = {
    "eyeshadow": "Shadow",
    "lips": "Lip",
    "lash": "Lash",
    "nude": "Beige",
    "crease": "Crease",
    "lipgloss": "LIP GLOSS",
    "lipstain": "LIP STAIN",
    "outercorner": "Outer Corner",
    "highshine": "High Shine",
    "single": "single shade",
    "lipplumper": "Lip Plumper"
};

function getDisplayName(name) {
    var dName = (typeof displayNames[name] !== "undefined") ? displayNames[name] : name;
    return dName.capitalizeFirstLetter();
};

var displayNamesFr = {
    "natural": "Naturel",
    "trend": "Tendance",
    "daytime": "Jour",
    "all": "Tous les looks",
    "evening": "Soirée",
    "matte": "Mat",
    "satin": "Satin",
    "highshine": "Ultra lustré",
    "shimmer": "chatoyant",
    "glimmer": "Illuminateur",
    "lipstick": "Rouge à lèvres",
    "lipgloss": "Brillant à lèvres",
    "lipstain": "Encre pour les lèvres",
    "lipplumper": "Repulpeur",
    "palette": "Palettes",
    "single": "Teintes Simples",
    "blush": "Fard à joues",
    "bronzer": "Bronzant",
    "contour": "Effet contour",
    "highlighter": "Illuminateur",
    "pink": "rose",
    "purple": "violet",
    "black": "noir",
    "beige": "beige",
    "metallic": "métallique",
    "blue": "bleu",
    "grey": "gris",
    "green": "vert",
    "yellow": "jaune",
    "coral": "corail",
    "white": "blanc",
    "red": "rouge",
    "eyeshadow": "Fard",
    "eye": "Yeux",
    "face": "Joues",
    "lip": "Lèvre",
    "lips": "Lèvre",
    "lash": "Cil",
    "cheek": "Joues",
    "natural": "Naturel",
    "full": "Full",
    "brown": "brun",
    "dramatic": "Spectaculaire",
    "lid": "Paupière",
    "crease": "Pli",
    "outercorner": "Coin externe"
};

function getDisplayNameFr(name) {
    var dName = (typeof displayNamesFr[name] !== "undefined") ? displayNamesFr[name] : name;
    return dName.capitalizeFirstLetter();
};

function clone_object(obj) {
    var newObj = (obj instanceof Array) ? [] : {};
    for (i in obj) {
        if (obj[i] && typeof obj[i] == "object") {
            newObj[i] = clone_object(obj[i]);
        } else newObj[i] = obj[i]
    }
    return newObj;
}

function getObjectSize(obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

var myFavorites = {
    "eyeshadow": {},
    "lash": {},
    "lips": {},
    "cheek": {},
    "eyeliner": {}
}

var lips_finish_fr = ['mat', 'satin', 'Ultra lustré', 'métallique', 'chatoyant'];

var eyeshadow_finish_fr = ['mat', 'chatoyant', 'satin', 'métallique', 'illuminateur'];

var lips_category_fr = ['Rouge à lèvres', 'Brillant à lèvres', 'Encre pour les lèvres', 'lip_plumper'];

//var eyeshadow_color_fr = ["rose","violet","noir","beige",
//                "métallique","bleu","gris","vert","jaune",
//                "corail","blanc","rouge"];

var lips_color_fr = ["rouge", "corail", "baies", "rose", "neutre",
    "universel", "non-conventionnel"
];

var lash_style_fr = ["naturel", "full", "spectaculaire"];


var filters = {
    "currentFilters": {
        'formulation': {
            "eyeliner": []
        },
        'palette': {
            "eyeshadow": [],
            "cheek": []
        },
        'finish': {
            "lips": [],
            "eyeshadow": []
        },
        'category': {
            "lips": []
        },
        'brand': {
            "lips": [],
            "lash": [],
            "eyeshadow": [],
            "cheek": [],
            "eyeliner": []
        },
        'colorIQ': {
            "lips": [0, ""]
        },
        'myFavorites': {
            "lips": 0,
            "lash": 0,
            "eyeshadow": 0,
            "cheek": 0,
            "eyeliner": 0
        },
        'justArrived': {
            "lips": 0,
            "lash": 0,
            "eyeshadow": 0,
            "cheek": 0,
            "eyeliner": 0
        },
        'bestSellers': {
            "lips": 0,
            "lash": 0,
            "eyeshadow": 0,
            "cheek": 0,
            "eyeliner": 0
        },
        'searchString': {
            "lips": "",
            "lash": "",
            "eyeshadow": "",
            "cheek": "",
            "eyeliner": ""
        },
        'family': {
            "eyeshadow": [],
            "lips": [],
            "lash": [],
            "cheek": [],
            "eyeliner": []
        }
    },
    "appliedFilters": {
        'formulation': {
            "eyeliner": []
        },
        'palette': {
            "eyeshadow": [],
            "cheek": []
        },
        'finish': {
            "lips": [],
            "eyeshadow": []
        },
        'category': {
            "lips": []
        },
        'brand': {
            "lips": [],
            "lash": [],
            "eyeshadow": [],
            "cheek": [],
            "eyeliner": []
        },
        'colorIQ': {
            "lips": [0, ""]
        },
        'myFavorites': {
            "lips": 0,
            "lash": 0,
            "eyeshadow": 0,
            "cheek": 0,
            "eyeliner": 0
        },
        'justArrived': {
            "lips": 0,
            "lash": 0,
            "eyeshadow": 0,
            "cheek": 0,
            "eyeliner": 0
        },
        'bestSellers': {
            "lips": 0,
            "lash": 0,
            "eyeshadow": 0,
            "cheek": 0,
            "eyeliner": 0
        },
        'searchString': {
            "lips": "",
            "lash": "",
            "eyeshadow": "",
            "cheek": "",
            "eyeliner": ""
        },
        'family': {
            "eyeshadow": [],
            "lips": [],
            "lash": [],
            "cheek": [],
            "eyeliner": []
        }
    }
};

var placements = {
    'lips': ["default"],
    'lash': ["default"],
    'eyeshadow': ["lid", "crease", "outercorner", ],
    'cheek': ["default"],
    'eyeliner': ["natural", "winged", "smoky"]
};

var eyeshadow_fr = ["paupière", "pli", "coin externe"];

function GetXmlHttpObject() {
    var xmlHttp = null;
    try {
        // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
        // Internet Explorer
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    return xmlHttp;
}

function coffset(element) {
    var valueT = 0,
        valueL = 0;

    do {
        valueT += element.offsetTop || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);

    return [valueL, valueT];
}

function adjustFooter() {
    var fullPageHeight = parseInt($('#main_contents').css('height')) + parseInt($('#header').css('height')) + 140;
    $('#fullpage').css('height', fullPageHeight);
}


function coffset(element) {
    var valueT = 0,
        valueL = 0;

    do {
        valueT += element.offsetTop || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);

    return [valueL, valueT];
}

function hide(id) {
    if (document.getElementById(id)) {
        $('#' + id).hide();
    }
}

function fade_out(id, cb) {
    $('#' + id).fadeOut("fast", cb);
}

function fade_in(id, cb) {
    $('#' + id).fadeIn("fast", cb);
}

function show(id) {
    if (document.getElementById(id)) {
        switch (id) {
            case "photo_x":
                document.getElementById(id).style.display = "inline-block";
                break;
            default:
                $('#' + id).show();
                break;
        }
    }
}

function getPriceStr(pPrice) {
    if (country == "CA" || country == "ca") {
        if (lang == "fr") {
            pPrice = pPrice.split("$");
            if (typeof pPrice[1] != "undefined") {
                pPrice = pPrice[1] + " $C";
            } else {
                pPrice = pPrice[0] + " $C";
            }
        } else {
            pPrice = "C " + pPrice;
        }
    }
    return pPrice;
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// not currently used
// e.g from API, outerlip -> lips, innerlip -> teeth
function renameFacePtsProperties(facePts) {
    renameProperty(facePts, 'innerlip', 'teeth');
    renameProperty(facePts, 'outerlip', 'lips');
    renameProperty(facePts, 'facebox', 'face');
}

// https://stackoverflow.com/questions/4647817/javascript-object-rename-key
function renameProperty(object, old_key, new_key) {
    if (old_key !== new_key) {
        Object.defineProperty(object, new_key,
            Object.getOwnPropertyDescriptor(object, old_key));
        delete object[old_key];
    }
}

var adjustRatios = {
    "lips": 1,
    "leye": 1,
    "reye": 1
};

var newFacePts = {
    "lips": [],
    "teeth": [],
    "leye": [],
    "reye": []
};

var live_newFacePts = {
    "lips": [],
    "teeth": [],
    "leye": [],
    "reye": []
};

var facePtsTemplate = {
    "lips": [],
    "teeth": [],
    "leye": [],
    "reye": []
};

var backupFacePts;
var trackerPts;

// ui / frontend to rendering / backend type-name mapping
function toTrackerType(type) {
    switch (type) {
        case 'lips':
            return 'outerlip';
        case 'teeth':
            return 'innerlip';
        case 'face':
            return 'facebox';
        default:
            return type;
    }
}

// to_array is fed objects at indices (indicated by from / to_indices) from the from_array
function mapAtIndices(from_array, to_array, from_indices, to_indices) {
    if (from_indices.length != to_indices.length)
        return;

    for (var i = 0; i < from_indices.length; ++i) {
        Object.assign(to_array[to_indices[i]], from_array[from_indices[i]]);
    }
}

// for structure from server
function isMouthOpen(facePts) {
    if (!facePts || !facePts['teeth'])
        console.error('facePts is not defined');

    var x1 = facePts['teeth'][0];
    var y1 = facePts['teeth'][1];
    for (var i = 2; i < facePts['teeth'].length; i += 2) {
        var x2 = facePts['teeth'][i];
        var y2 = facePts['teeth'][i + 1];
        if (x1 != x2 || y1 != y2)
            return true;
    }

    return false;
}

// info comes from makeup module canvas
// newFacePts is for the UI, does not have to show all of facetracker information
function setNewFacePtsFromLocal(local_image) {

    // convenience pointer
    var uiPts = newFacePts;
    trackerPts = local_image.facepoints;
    facebounds = local_image.facepoints['facebox'];

    // set uiPts based on info from local_image
    for (var type in uiPts) {
        uiPts[type] = jQuery.extend(true, [], trackerPts[toTrackerType(type)]);
    }

    teethEnabled = trackerPts.mouthopen;
    backupFacePts = jQuery.extend(true, {}, uiPts);
}

function setNewFacePts() {
    var userFacePts;
    var tPts;
    userFacePts = facePts;
    tPts = newFacePts;

    for (var type in tPts) {
        tPts[type] = [];
        if (type == "leye" || type == "reye") {
            var pts = userFacePts[type].split(",");
            tPts[type][0] = parseInt(pts[0]);
            tPts[type][1] = (parseInt(pts[1]) + parseInt(pts[3])) / 2;
            tPts[type][2] = (parseInt(pts[0]) + parseInt(pts[2])) / 2;
            tPts[type][3] = parseInt(pts[1]);
            tPts[type][4] = parseInt(pts[2]);
            tPts[type][5] = (parseInt(pts[1]) + parseInt(pts[3])) / 2;
            tPts[type][6] = (parseInt(pts[0]) + parseInt(pts[2])) / 2;
            tPts[type][7] = parseInt(pts[3]);
        } else if (type == "lips" || type == "teeth") {
            var pts = userFacePts[type].split(",");
            tPts[type] = pts;
        }

        for (var i = 0; i < tPts[type].length; i++) {
            tPts[type][i] = parseFloat(tPts[type][i]);
        }
    }

    /*
         if ((newFacePts['teeth'][0] == newFacePts['teeth'][2])) {

            var lipsPts = tPts['lips'];
            var sumX = 0;
            for (var i = 0; i < lipsPts.length; i += 2) {
                var x = lipsPts[i];
                sumX += x;
            }
            var teethX = Math.floor(sumX / 6);

            var sumY = 0;
            for (var i = 1; i < lipsPts.length; i += 2) {
                var y = lipsPts[i];
                sumY += y;
            }
            var teethY = Math.floor(sumY / 6);

            var teethPts = tPts['teeth']

            teethPts[0] = Math.floor((teethX + lipsPts[0])/2);
            teethPts[1] = Math.floor((teethY + lipsPts[1])/2);


            var topX = Math.floor((lipsPts[2] + lipsPts[4] + lipsPts[6])/3);
            var topY = Math.floor((lipsPts[3] + lipsPts[5] + lipsPts[7])/3);

            teethPts[2] = Math.floor((teethX + topX)/2);
            teethPts[3] = teethY + (0.2 * Math.abs(teethY - topY));

            teethPts[4] = Math.floor((teethX + lipsPts[8])/2);
            teethPts[5] = Math.floor((teethY + lipsPts[9])/2);

            teethPts[6] = Math.floor((teethX + lipsPts[10])/2);
            teethPts[7] = teethY + (0.2 * Math.abs(teethY - lipsPts[11]));

        }
    */


    teethEnabled = isMouthOpen(tPts);

    // set default diamond, if mouth is closed
    if (!teethEnabled) {
        var lipsPts = tPts['lips'];
        var sumX = 0;
        for (var i = 0; i < lipsPts.length; i += 2) {
            var x = lipsPts[i];
            sumX += x;
        }
        var teethX = Math.floor(sumX / 6);

        var sumY = 0;
        for (var i = 1; i < lipsPts.length; i += 2) {
            var y = lipsPts[i];
            sumY += y;
        }
        var teethY = Math.floor(sumY / 6);

        var teethPts = tPts['teeth']

        teethPts[0] = Math.floor((teethX + lipsPts[0]) / 2);
        teethPts[1] = Math.floor((teethY + lipsPts[1]) / 2);


        var topX = Math.floor((lipsPts[2] + lipsPts[4] + lipsPts[6]) / 3);
        var topY = Math.floor((lipsPts[3] + lipsPts[5] + lipsPts[7]) / 3);

        teethPts[2] = Math.floor((teethX + topX) / 2);
        teethPts[3] = teethY + (0.2 * Math.abs(teethY - topY));

        teethPts[4] = Math.floor((teethX + lipsPts[8]) / 2);
        teethPts[5] = Math.floor((teethY + lipsPts[9]) / 2);

        teethPts[6] = Math.floor((teethX + lipsPts[10]) / 2);
        teethPts[7] = teethY + (0.2 * Math.abs(teethY - lipsPts[11]));
    }

    backupFacePts = jQuery.extend(true, {}, tPts);
}

// e.g [1, 2, 3, 4] assigns x1 = 1, y1 = 2, x2 = 3, y2 = 4
function assignPointsFromArray(points_array, info_array) {
    if (info_array.length % 2 != 0 || points_array.length != info_array / 2)
        console.error('incorrect argument sizes');
    for (var i = 0; i < info_array.length; i += 2) {
        points_array[i].x = parseFloat(info_array[i]);
        points_array[i].y = parseFloat(info_array[i + 1]);
    }
}

function refineClicked() {
    if (!isTabletMode())
        resizeHandler();
    toRefine();
}


var currentAdjustStep = "NA";
var customTeethToggle = false; // user tampered, reset when new photo is set
function adjustStep(feature) {
    pushPointsDisabled = false;
    if (isTabletMode() || mode() == 'live') {
        show('refine_placeholder');
    } else {
        hide('product_viewing_pane');
        show('refine_pane_placeholder');
        slideUnderline('refine_' + feature + '_header');
        $('#refine_lips_header').css('color', refine_unselected_color);
        $('#refine_leye_header').css('color', refine_unselected_color);
        $('#refine_reye_header').css('color', refine_unselected_color);
        $('#refine_' + feature + '_header').css('color', refine_selected_color);
    }

    currentAdjustStep = feature;
    switch_dial();

    hide('adjust_lips');
    hide('adjust_leye');
    hide('adjust_reye');
    show('adjust_' + feature);

    var container = document.getElementById('adjust_containers');
    var cw = container.clientWidth;
    var ch = container.clientHeight;

    var pts = newFacePts[feature];
    var imgHeight = uploaded_picheight;
    var imgWidth = uploaded_picwidth;
    var userIm = mainim;

    var box = (useNewAPI()) ? getBox(pts) : new Object({});
    if (feature == "lips") {
        if (!useNewAPI()) {
            box.left = pts[0];
            box.top = Math.min(pts[3], pts[5]);
            box.right = pts[8];
            box.bot = pts[11];
        }
        var r = 0.4;
        show('mouth_bar');
        hide('retake_bar');
        document.getElementById('teethBtn1').style.display = "inline-block";
        document.getElementById('teethBtn2').style.display = "inline-block";
        if (lang == "fr") {
            document.getElementById("instruct").innerHTML = "Déplacez les points pour modifier le contour de vos lèvres.";
        } else {
            document.getElementById("instruct").innerHTML = "Move the dots to edit the outline of your lips.";
        }
        $('#refine_cta_popup').css('margin-bottom', -16);
    } else if (feature == "leye") {
        if (!useNewAPI()) {
            box.left = pts[0];
            box.top = pts[3];
            box.right = pts[4];
            box.bot = pts[7];
        }
        var r = 1;
        document.getElementById('teethBtn1').style.display = "none";
        document.getElementById('teethBtn2').style.display = "none";
        show('retake_bar');
        hide('mouth_bar');
        $('#instruct').text(toLang('Move the dots to edit the outline of your left eye.', 'en', lang));
        $('#refine_cta_popup').css('margin-bottom', -5);
    } else {
        if (!useNewAPI()) {
            box.left = pts[0];
            box.top = pts[3];
            box.right = pts[4];
            box.bot = pts[7];
        }
        var r = 1;
        document.getElementById('teethBtn1').style.display = "none";
        document.getElementById('teethBtn2').style.display = "none";
        show('retake_bar');
        hide('mouth_bar');
        $('#instruct').text(toLang('Move the dots to edit the outline of your right eye.', 'en', lang));
        $('#refine_cta_popup').css('margin-bottom', -5);
    }

    var w = box.right - box.left;
    var h = box.bot - box.top;

    var new_w = cw / (r + 1);
    var ratio = new_w / w;
    adjustRatios[feature] = ratio;

    container = document.getElementById('adjust_' + feature);
    container.style.width = ratio * imgWidth + "px";
    container.style.height = ratio * imgHeight + "px";
    container.style.left = -1 * (box.left - r / 2 * w) * ratio + "px";
    container.style.top = -1 * ((box.bot + box.top) / 2 * ratio - ch / 1.8) + "px";

    var cur_src = document.getElementById('adjustImg_' + feature).src;
    var next_src = (isLocalImage(userIm)) ? userIm : "http://" + apiserver + "/" + appname + "/img/" + userIm + ".jpg";
    if (cur_src != next_src) {
        if (!useNewAPI())
            $('#adjustImg_' + feature).css('opacity', 0);
        document.getElementById('adjustImg_' + feature).src = next_src;
    }
    positionPoints(feature);
}

function positionPoints(feature, reset) {
    var feature = (typeof feature !== "undefined") ? feature : currentAdjustStep;

    document.getElementById('adjustDot_' + feature).innerHTML = "";

    var pts;
    var facePtsPointer = newFacePts;

    if (reset === true && typeof backupFacePts != "undefined") {
        facePtsPointer[feature] = jQuery.extend(true, [], backupFacePts[feature]);
        if (feature == "lips")
            facePtsPointer['teeth'] = jQuery.extend(true, [], backupFacePts['teeth']);
    }

    /*if (useNewAPI()) {
        if (customTeethToggle == false)
            teethEnabled = makeup_modules['backend_canvas'].module.tracker.featurecoords.mouthopen;
    }
    else {
        if (customTeethToggle == false)
            teethEnabled = !(newFacePts['teeth'][0] == newFacePts['teeth'][2]);
    }*/

    pts = facePtsPointer[feature];
    document.getElementById('teethBtn2').innerHTML = toLang("Closed Mouth", 'en', lang);
    document.getElementById('teethBtn1').innerHTML = toLang("Open Mouth", 'en', lang);

    if (feature == "lips") {
        switch_dial();
    }

    if (!useNewAPI() || is.mobile()) {
        for (var i = 0; i < pts.length / 2; i++) {
            var x = pts[i * 2] * adjustRatios[feature];
            var y = pts[i * 2 + 1] * adjustRatios[feature];
            var dot = genPoint(x, y);
            document.getElementById('adjustDot_' + feature).innerHTML += dot;
        }

        if (feature == 'lips' && teethEnabled) {
            var teethPts = facePtsPointer['teeth'];
            for (var i = 0; i < teethPts.length; i += 2) {
                var x = teethPts[i] * adjustRatios['lips'];
                var y = teethPts[i + 1] * adjustRatios['lips'];
                var dot = genPoint(x, y);
                document.getElementById('adjustDot_' + feature).innerHTML += dot;
            }
        }

    } else {
        for (var i = 0; i < pts.length; i++) {
            var x = pts[i].x * adjustRatios[feature];
            var y = pts[i].y * adjustRatios[feature];
            var dot = genPoint(x, y);
            document.getElementById('adjustDot_' + feature).innerHTML += dot;
        }

        // append open mouth points
        if (feature == 'lips' && teethEnabled) {
            var teethPts = facePtsPointer['teeth'];
            for (var i = 0; i < teethPts.length; i++) {
                var x = teethPts[i].x * adjustRatios['lips'];
                var y = teethPts[i].y * adjustRatios['lips'];
                var dot = genPoint(x, y);
                document.getElementById('adjustDot_' + feature).innerHTML += dot;
            }
        }
    }

    if (reset === true)
        pushPoints(null, true, true);
}

var enabletouch = 0;
var offsetx, offsety, touchpnt, touchstartpnt;

function touch(e) {
    enabletouch = 1;
    offsetx = document.getElementById('adjust_' + currentAdjustStep).getClientRects()[0]['left'] + window.scrollX;
    offsety = document.getElementById('adjust_' + currentAdjustStep).getClientRects()[0]['top'] + window.scrollY;

    touchpnt = (e.touches[0].pageX - offsetx) + "," + (e.touches[0].pageY - offsety);
    touchstartpnt = touchpnt;
}

function touchend(e) {
    enabletouch = 0;
    var t1 = touchstartpnt.split(",");
    var t2 = touchpnt.split(",");
}

function touchmove(e) {
    e.preventDefault();
    var d = touchpnt.split(",");
    offsetx = document.getElementById('adjust_' + currentAdjustStep).getClientRects()[0]['left'] + window.scrollX;
    offsety = document.getElementById('adjust_' + currentAdjustStep).getClientRects()[0]['top'] + window.scrollY;

    netx = e.touches[0].pageX - offsetx - d[0];
    nety = e.touches[0].pageY - offsety - d[1];
    touchpnt = (e.touches[0].pageX - offsetx) + "," + (e.touches[0].pageY - offsety);

    e.target.style.left = (e.touches[0].pageX - offsetx - 6) + "px";
    e.target.style.top = (e.touches[0].pageY - offsety - 6) + "px";
    console.trace();
}


function genPoint(x, y) {
    x = x - 6;
    y = y - 6;
    if (is.ipad() || is.androidTablet()) {
        var dot = "<div class='adjustPt' style='left:" + x + "px;top:" + y + "px;' ";
        dot += "ontouchstart='touch(event);' ";
        dot += "ontouchend='touchend(event);' ";
        dot += "ontouchmove='touchmove(event);'>";
    } else {
        var dot = "<div class='adjustPt' style='left:" + x + "px;top:" + y + "px;' onmousedown='dot_mouseDown(event)'></div>";
    }
    return dot;
}

function pushPoints(cb, dont_advance, apply_makeup) {
    if (useNewAPI())
        pushPointsToLocal(cb, dont_advance, apply_makeup);
    else
        pushPointsToServer(cb, dont_advance, apply_makeup);
}

// if user is tabbing we do not want to auto-advance to next feature
// photoUsageState defines behaviour of this function, if cb is provided and non-null
function pushPointsToServer(cb, dont_advance, apply_makeup) {
    if (pushPointsDisabled === true)
        return;

    var userIm = mainim;
    var userPts = newFacePts;
    var type = currentAdjustStep;

    var url = "http://www.sephora.com/virtualartist/proxy.php";
    //var url = "proxy.php";
    url += "?psx=24";
    url += "&action=updatepoints";
    url += "&apiserver=" + apiserver;
    url += "&id=" + userIm;
    url += "&points=";

    var pts;
    var c;

    if (type == "leye") {
        pts = document.getElementById('adjustDot_leye').children;
        c = [];
        c.push(parseInt((parseFloat(pts[0].style.left) + 6) / adjustRatios['leye']));
        c.push(parseInt((parseFloat(pts[1].style.top) + 6) / adjustRatios['leye']));
        c.push(parseInt((parseFloat(pts[2].style.left) + 6) / adjustRatios['leye']));
        c.push(parseInt((parseFloat(pts[3].style.top) + 6) / adjustRatios['leye']));
        url += "set box lefteye:" + c.join(" ");
    }

    if (type == "reye") {
        pts = document.getElementById('adjustDot_reye').children;
        c = [];
        c.push(parseInt((parseFloat(pts[0].style.left) + 6) / adjustRatios['reye']));
        c.push(parseInt((parseFloat(pts[1].style.top) + 6) / adjustRatios['reye']));
        c.push(parseInt((parseFloat(pts[2].style.left) + 6) / adjustRatios['reye']));
        c.push(parseInt((parseFloat(pts[3].style.top) + 6) / adjustRatios['reye']));
        url += ",set box righteye:" + c.join(" ");
    }

    if (type == "lips") {
        pts = document.getElementById('adjustDot_lips').children;
        c = [];
        for (var p = 0; p < 6; p++) {
            c.push(parseInt((parseFloat(pts[p].style.left) + 6) / adjustRatios['lips']));
            c.push(parseInt((parseFloat(pts[p].style.top) + 6) / adjustRatios['lips']));
        }
        url += ",set 6points lips:" + c.join(" ");

        c = [];
        if (pts.length > 6) {
            //teethEnabled = 1;
            for (var p = 6; p < pts.length; p++) {
                c.push(parseInt((parseFloat(pts[p].style.left) + 6) / adjustRatios['lips']));
                c.push(parseInt((parseFloat(pts[p].style.top) + 6) / adjustRatios['lips']));
            }
        } else {
            //teethEnabled = 0;
            for (var i = 0; i < 8; i++) {
                c.push(0);
            }
        }
        url += ",set 4points teeth:" + c.join(" ");

    }

    var xmlHttp = GetXmlHttpObject();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            res = xmlHttp.responseText;
            if (res != "success") {
                closeRefine();
                error(res);
                return;
            }
            updateMakeupPoints(userPts, cb, dont_advance, apply_makeup, false);
        }
    }

    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}


function pushPointsToLocal(cb, dont_advance, apply_makeup) {
    if (pushPointsDisabled === true)
        return;

    var userPts = newFacePts;
    updateMakeupPoints(userPts, cb, dont_advance, apply_makeup, true);
}


function updateMakeupPoints(userPts, cb, dont_advance, apply_makeup, update_local) {
    var type = currentAdjustStep;

    if (useNewAPI()) {
        if (type == "reye" || type == "leye") {
            var pts = document.getElementById('adjustDot_' + type).children;
            userPts[type] = [];
            for (var p = 0; p < pts.length; p++) {
                var x = Math.round((parseFloat(pts[p].style.left) + 6) / adjustRatios[type]);
                var y = Math.round((parseFloat(pts[p].style.top) + 6) / adjustRatios[type]);
                var point = new Point2D(x, y);
                userPts[type].push(point);

                if (update_local === true)
                    Object.assign(trackerPts[toTrackerType(type)][p], point);
            }
        } else if (type == "lips") {
            var pts = document.getElementById('adjustDot_' + type).children;
            userPts['lips'] = [];

            // adjusting teeth points as well
            if (pts.length > backupFacePts['lips'].length)
                userPts['teeth'] = [];

            for (var p = 0; p < pts.length; p++) {
                var x = Math.round((parseFloat(pts[p].style.left) + 6) / adjustRatios[type]);
                var y = Math.round((parseFloat(pts[p].style.top) + 6) / adjustRatios[type]);
                var point = new Point2D(x, y);

                if (p < backupFacePts['lips'].length) {
                    userPts['lips'].push(point);
                    if (update_local === true)
                        Object.assign(trackerPts[toTrackerType('lips')][p], point);
                } else {
                    var teeth_p = p - backupFacePts['lips'].length;
                    userPts['teeth'].push(point);
                    if (update_local === true)
                        Object.assign(trackerPts[toTrackerType('teeth')][teeth_p], point);
                }
            }
        }
    } else {
        if (type == "reye" || type == "leye") {
            var pts = document.getElementById('adjustDot_' + type).children;
            userPts[type] = [];
            for (var p = 0; p < pts.length; p++) {
                userPts[type].push(Math.round((parseFloat(pts[p].style.left) + 6) / adjustRatios[type]));
                userPts[type].push(Math.round((parseFloat(pts[p].style.top) + 6) / adjustRatios[type]));
            }
        } else if (type == "lips") {
            var pts = document.getElementById('adjustDot_' + type).children;
            userPts[type] = [];
            if (teethEnabled) {
                userPts['teeth'] = [];
            }
            for (var p = 0; p < pts.length; p++) {
                if (p < 6) {
                    userPts[type].push(Math.round((parseFloat(pts[p].style.left) + 6) / adjustRatios[type]));
                    userPts[type].push(Math.round((parseFloat(pts[p].style.top) + 6) / adjustRatios[type]));
                } else {
                    userPts['teeth'].push(Math.round((parseFloat(pts[p].style.left) + 6) / adjustRatios[type]));
                    userPts['teeth'].push(Math.round((parseFloat(pts[p].style.top) + 6) / adjustRatios[type]));
                }
            }
        }
    }

    if (apply_makeup)
        applyMakeup();

    // auto-advance to next feature, or exit if process complete
    // note that dont_advance may not be defined, in which case we auto-advance
    if (dont_advance !== true) {
        if (type == "leye") {
            closeRefine();
            if (typeof(cb) == "function" && cb != null)
                cb();
            else {
                if (photoUsageState == photoUsageStates.SHARE)
                    shareCB();
                else if (photoUsageState == photoUsageStates.COMPARE)
                    addToCompare();
                else if (photoUsageState == photoUsageStates.PHOTO_DEFAULT)
                    takePhotoCB();
                photoUsageState = photoUsageStates.UNSET;
            }
        } else {
            if (type == "lips")
                adjustStep('reye');
            else
                adjustStep('leye');
        }
    }
}

function closeRefine(apply_makeup) {
    if (currentAdjustStep != "NA") {
        if (page == 'pto') {
            if (mode() != "live")
                show('btnRefine');
        } else if (page == 'il') {
            show('btnRefine');
        }
        updateButtonWidth();
    } else
        return;

    // not sure if this looks any better
    /*if ($('#refine_placeholder').css('display') != 'none')
        fade_out('refine_placeholder', function() { fade_in('product_viewing_pane') });
    else
        fade_out('refine_pane_placeholder', function() { fade_in('product_viewing_pane') });*/

    hide('refine_placeholder');
    hide('refine_pane_placeholder');
    show('product_viewing_pane');

    if (mode() == "photo" && apply_makeup)
        applyMakeup();

    currentAdjustStep = "NA";
    resizeHandler();
}

function applyOnLiveImage(cb) {
    var xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        error("Browser does not support HTTP Request");
        return;
    }
    var url = "http://www.sephora.com/virtualartist/proxy.php?psx=24"
        //var url = "proxy.php?psx=24" +
    "&action=mfapi_v4" +
    "&apiserver=" + apiserver +
        "&id=" + mainim;

    for (var category in currentMakeover['products']) {
        for (var placement in currentMakeover['products'][category]) {
            var prod = currentMakeover['products'][category][placement];
            if (prod == -1 || prod == "") {
                continue;
            }
            prod = prod.split("_");
            var sku = prod[1];
            var colorId = prod[2];
            var add_lower = currentMakeover.eyeliner_lower_on;
            var param = gen_makeup_param(category, sku, colorId, placement, "=", add_lower);
            url += "&" + param;
        }
    }

    url += "&cachefix=" + Math.random();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
            var resultarray = xmlHttp.responseText.split(',');
            var result = resultarray[0];
            currentMakeover['mainim'] = result;
            if (typeof cb == "function") {
                cb();
            }
        }
    }

    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

var teethEnabled = 0;

function toggleTeeth(on) {
    var userPts = newFacePts;
    var enable = 0;
    customTeethToggle = true;

    if (typeof on != "undefined") {
        enable = on;
    } else {
        var num_lips_dots = (useNewAPI()) ? backupFacePts['lips'].length : backupFacePts['lips'].length / 2;
        if (document.getElementById('adjustDot_lips').children.length > num_lips_dots)
            enable = 0;
        else
            enable = 1;
    }

    var container = document.getElementById('adjustDot_lips');

    // reset
    container.innerHTML = "";

    if (useNewAPI())
        for (var i = 0; i < userPts['lips'].length; i++) {
            var x = userPts['lips'][i].x * adjustRatios['lips'];
            var y = userPts['lips'][i].y * adjustRatios['lips'];
            var dot = genPoint(x, y);
            container.innerHTML += dot;
        }
    else
        for (var i = 0; i < userPts['lips'].length; i += 2) {
            var x = parseFloat(userPts['lips'][i]) * adjustRatios['lips'];
            var y = parseFloat(userPts['lips'][i + 1]) * adjustRatios['lips'];
            container.innerHTML += genPoint(x, y);
        }

    if (enable) {
        teethEnabled = true;

        if (useNewAPI())
            makeup_modules['backend_canvas'].module.tracker.featurecoords.mouthopen = true;

        // add teeth points
        if (useNewAPI())
            for (var i = 0; i < userPts['teeth'].length; i++) {
                var x = userPts['teeth'][i].x * adjustRatios['lips'];
                var y = userPts['teeth'][i].y * adjustRatios['lips'];
                var dot = genPoint(x, y);
                container.innerHTML += dot;
            }
        else
            for (var i = 0; i < userPts['teeth'].length; i += 2) {
                var x = parseFloat(userPts['teeth'][i]) * adjustRatios['lips'];
                var y = parseFloat(userPts['teeth'][i + 1]) * adjustRatios['lips'];
                container.innerHTML += genPoint(x, y);
            }

        //jingyi added
        if (document.getElementById('teethBob')) {
            document.getElementById('teethBob').style.float = "left";
        }
    } else {
        teethEnabled = false;

        if (useNewAPI())
            makeup_modules['backend_canvas'].module.tracker.featurecoords.mouthopen = false;

        //jingyi added
        if (document.getElementById('teethBob')) {
            document.getElementById('teethBob').style.float = "right";
        }
    }
    applyMakeup();
}

function mode() {
    if (typeof currentMode != "undefined")
        return currentMode;
    if (page != 'pto' || !useNewAPI() || !newAPIReady() || !makeup_modules['main_live_canvas'] || makeup_modules['main_live_canvas'].paused)
        return 'photo';
    else
        return 'live';
}

// note that there are 2 edit try-on popups, this changes the one with model options
function customizeModelModal() {
    if (is.ipod() || is.iphone() || is.ipad() || is.androidPhone() || is.androidTablet()) {
        show('tablet_opts_section');
        hide('safari_opts_section');
        $('.mo_subheader_container').show();
    } else {
        hide('tablet_opts_section');
        if (!useNewAPI() || page != 'pto') {
            show('safari_opts_section');
            $('.mo_subheader_container').show();
        } else {
            hide('safari_opts_section');
            $('.mo_subheader_container').hide();
        }
    }
    if (!useNewAPI())
        $('#take_photo_opt_padded').css({ 'pointer-events': 'auto', 'cursor': 'pointer' });
}

function error(msg) {
    alert(msg);
}

function resetFormUpload(form_name) {
    var form;
    if (form_name == 'uploadform1')
        form = uploadform1;
    else if (form_name == 'uploadform2')
        form = uploadform2;
    else if (form_name == 'uploadform3')
        form = uploadform3;
    else if (uploadform)
        form = uploadform;

    if (form)
        form.upload.value = "";
}

function uploadthefile(filename) {
    if (filename == "uploadform1") {
        var form = uploadform1;
    } else if (filename == "uploadform2") {
        var form = uploadform2;
    } else if (filename == "uploadform3") {
        var form = uploadform3;
    } else {
        var form = uploadform;
    }
    var name = form.upload.value;

    if (name == "") {
        return;
    }

    try {
        name = name.substring(name.lastIndexOf(".") + 1);
        name = name.toLowerCase();

        if ((name == 'jpg') || (name == 'png') || (name == 'jpeg')) {
            if (is.mobile()) {
                show('whitelayer');
            }
            form.submit();

            if (page == "il") {
                trackEventLooks("customize look:upload photo");
            } else {
                trackEvent("upload photo");
            }
        } else {
            if (is.mobile()) {
                hide('whitelayer');
            }
            error("Sorry. Your image’s file extension must be .jpg, .jpeg or .png. Please choose another image.");
        }
    } catch (err) {
        error('Error with file: ' + err);
    }

    // Use setTimeout to reset the form to avoid crashing on iPad
    setTimeout(function() { resetFormUpload(filename) }, 100);
}


function updateButtonWidth() {
    if ($(document).width() < 1153) {
        $('.pto_button').width('112px');
    } else if ($('#btnRefine').css('display') === 'none') {
        if (lang === 'fr') {
            $('.pto_button').width('100px');
        } else {
            $('.pto_button').width('78px');
        }
    } else {
        $('.pto_button').width('112px');
    }
}

var facePts = {
    "face": "",
    "leye": "",
    "reye": "",
    "lips": "",
    "teeth": ""
};

var live_facePts = {
    "face": "",
    "leye": "",
    "reye": "",
    "lips": "",
    "teeth": ""
};

function short(str, limit) {
    if (str.length > limit + 3) {
        return str.slice(0, limit) + "...";
    } else {
        return str;
    }
}