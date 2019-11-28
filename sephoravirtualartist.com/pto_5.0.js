var allFilters= {
    'formulation' : {
        "eyeliner":['cream', 'loose powder', 'cream-to-powder', 'pencil', 'gel', 'pressed-powder', 'liquid', 'waterproof']
    },
    'palette': {
        "eyeshadow":['palette','single'],
        "cheek":['palette','single']
    },
    'category': {
        "lips":['Lipstick','Lip Stain','Lip Gloss','Lip Plumper'],
        "cheek":['Blush','Bronzer','Contour','Highlighter']
    },
    'brand': {
        "lips":{},
        "lash":{},
        "eyeshadow":{},
        "cheek":{},
        "eyeliner":{}
    },
    'colorIQ': {
        "lips":{}
    },
    'myFavorites': {
        "lips":0,
        "lash":0,
        "eyeshadow":0,
        "cheek":0,
        "eyeliner":0
    },
    'justArrived': {
        "lips":0,
        "lash":0,
        "eyeshadow":0,
        "cheek":0,
        "eyeliner":0
    },
    'bestSellers': {
        "lips":0,
        "lash":0,
        "eyeshadow":0,
        "cheek":0,
        "eyeliner":0
    },
    'searchString': {
        "lips":"",
        "lash":"",
        "eyeshadow":"",
        "cheek":"",
        "eyeliner":""
    },
    'family': {
        "eyeshadow": ["brown","purple","black","pink","nude",
        "metallic","blue","grey","green","yellow",
        "coral","white","red"],
        "lips": ["red", "pink", "berry", "coral" ,"nude" ,"universal", "unconventional"],
        "lash": ["natural","full","dramatic"],
        "cheek": ["berry","red","pink","coral","brown","beige","gold","purple","metallic"],
        "eyeliner": ["black", "brown", "blue", "purple", "grey", "gold",
                    "silver", "white", "green", "yellow", "beige", "coral", "pink", "red", "berry"]
    },
    'finish': {
        "eyeshadow": ['matte','shimmer', 'satin', 'metallic', 'glitter']
    }
};

var shareMode = "single";

var makeover = {
    "mainim" : "",
    "liveim" : "",
    "products" : {
        "lips" : { "default" : -1 },
        "lash" : { "default" : -1 },
        "eyeshadow" : { "lid" : -1,
                        "crease" : -1,
                        "outercorner" : -1 },
        "cheek" :{"default" :-1},
        "eyeliner" : { "natural":-1,
                       "winged":-1,
                       "smoky":-1,
                     }
    },
    eyeliner_lower_on : true
};

var from_live = false;
var currentMakeover = clone_object(makeover);

// note that there can only be one product addition at a time, but multiple removals
// makeoverChange.change : 2 for favorited, 1 for changed (add / removal), 0 for didn't change
// if change != 0 but category and placement aren't specified, will check for required removals (but not additions)
var makeoverChange = Object({category:"", placement:"", change:0});

function cancelSearch() {
    $('#cancel_search').css({'opacity':'0.0', 'pointer-events':'none'});
    document.getElementById(currentCategory+"_textsearch").value = "";

    if (filters['currentFilters']['searchString'][currentCategory] != "" || filters['appliedFilters']['searchString'][currentCategory] != "") {
        filters['currentFilters']['searchString'][currentCategory] = "";
        filters['appliedFilters']['searchString'][currentCategory] = "";
        playFilters(undefined);
        applyFilters(undefined,1);
    }
}

function adjustShadeContentWidth(category) {
    if (typeof shade_dims[category] == "undefined")
        return;

    var container = document.getElementById(category+"_shade_content");

    // what width should be
    $(container).css('width', '100%');
    var orig_width = $(container).width();
    var elements_per_row = elementsPerRow(container, category);
    var min_width = elements_per_row * shade_dims[category][1];

    // padding
    min_width += 3;
    var scroll_bar_width = $(container).width() - container.clientWidth;
    var new_width = Math.min(min_width + scroll_bar_width, orig_width);
    $(container).css('width', new_width);
    hideOverflowedShades(category);
}

// called by 'onkeyup'
function searchInputReact(event) {
    var id = currentCategory + "_textsearch";
    var val = document.getElementById(id).value;
    if (val == "")
        $('#cancel_search').css({'opacity':'0.0', 'pointer-events':'none'});
    else {
        $('#cancel_search').css({'opacity':'1.0', 'pointer-events':'all'});
    }
    productSearch(event);
}

function productLinkOut(urlid) {
    var parts = urlid.split("_");
    var category = parts[0];
    var sku = parts[1];
    var colorId = parts[2];

    if(document.getElementById('tab_compare').style.display=="block") {
        trackEvent("compare:shop now:ppage");
    } else {
        trackEvent("shop now:ppage");
    }


    var url = makeoverobject[category][sku][colorId]['producturl'];
    //var countryAndLang = "&country_switch="+country+"&lang="+lang;
    //url += "?icid2=virtual-try-on_vto_shop-now_ppage";
    //url += "&skuId="+sku;
    //url += countryAndLang;

    if (country=="US") {
        url += "?country_switch=US&lang=en"
        url += "&icid2=virtual-try-on_vto_shop-now_ppage";
        url += "&skuId="+sku;
    } else if (country == "CA" && lang=="en") {
        url += "?country_switch=CA&lang=en"
        url += "&icid2=virtual-try-on_vto_shop-now_ppage";
        url += "&skuId="+sku;
    } else if (country == "CA" && lang=="fr") {
        url += "?country=CA&lang=fr"
        url += "&icid2=virtual-try-on_vto_shop-now_ppage";
        url += "&skuId="+sku;
    }
    // shopSephora();
    //var langSwitchWindow = window.open("http://www.sephora.com/?country_switch=ca&lang=en")
    //langSwitchWindow.close();
    window.open(url);

    /*
    var url = makeoverobject[category][sku][colorId]['producturl'];
    url += "?icid2=virtual-try-on_vto_shop-now_ppage";
    var url = makeoverobject[category][sku][colorId]['producturl'];
    url += "?icid2=virtual-try-on_vto_shop-now_ppage";
    var url = makeoverobject[category][sku][colorId]['producturl'];
    url += "?icid2=virtual-try-on_vto_shop-now_ppage";

    var url = makeoverobject[category][sku][colorId]['producturl'];
    */

/*
    var url = makeoverobject[category][sku][colorId]['producturl'];
    url += "?icid2=virtual-try-on_vto_shop-now_ppage";
    url += "&skuId="+sku;
    window.open(url); */
}

var applyInitial=1;
function applyInitialLook() {
    if(applyInitial==0) {
        return;
    }
    applyInitial=0;

    var shadeid = "";

    if (category !== '') {
        deep_link_pto();
    } else {
        selectMenu('lash');
        selectPlacement("placement_lash_default");
        if (country === 'CA') {
            shadeid = 'lash_1927649_0_shade';
        } else {
            shadeid = "lash_1725613_0_shade";
        }
        selectShade(shadeid, 1, true);

        selectMenu('cheek');
        selectPlacement("placement_cheek_default");
        shadeid = "cheek_1721240_0_shade";
        selectShade(shadeid, 1, true);

        selectMenu('eyeshadow');
        selectPlacement("placement_eyeshadow_lid");
        shadeid = "eyeshadow_1393636_0_palette";
        selectShade(shadeid, 1, true);

        selectMenu('eyeliner');
        selectPlacement("placement_eyeliner_natural_only");
        shadeid = 'eyeliner_1879956_0_shade';
        selectShade(shadeid, 1, true);

        selectMenu('lips');
        selectPlacement("placement_lips_default");
        shadeid = "lips_1796705_0_shade";
        selectShade(shadeid, 1, true);
    }
    apply();
}

function deep_link_pto() {
    switchToCategory();
    selectMenu(category);
    selectPlacement('placement_'+category+'_default');

    if (sku !== '') {
        wearProductBySku(sku, 0);
        return;
    }

    if (colorIQ === '') {
        getProductByBrandAndName();
        return;
    }

    if (brand === '') {
        getProductByCIQAndName();
        return;
    }

    if (product === '') {
        getProductByCIQAndBrand();
        return;
    }
}

function wearProductBySku(skuValue, colorId) {
    var shade = category + '_' + skuValue + '_' + colorId + '_' + 'shade';
    var product = category + '_' + skuValue + '_' + colorId;
    selectShade(shade);
    selectProduct(product, true);
}

function getProductByCIQAndName() {
    for (var sku in makeoverobject[category]) {
        var products = makeoverobject[category][sku];
        for (var i = 0; i < products.length; i++) {
            if (products[i]['ciq'].includes(colorIQ) && products[i]['productname'] === product) {
                wearProductBySku(sku, i);
            }
        }
    }
}

function getProductByCIQAndBrand() {
    for (var sku in makeoverobject[category]) {
        var products = makeoverobject[category][sku];
        for (var i = 0; i < products.length; i++) {
            if (products[i]['ciq'].includes(colorIQ) && products[i]['brand'] === brand) {
                wearProductBySku(sku, i);
            }
        }
    }
}

function getProductByBrandAndName() {
    for (var sku in makeoverobject[category]) {
        var products = makeoverobject[category][sku];
        for (var i = 0; i < products.length; i++) {
            if (products[i]['brand'] === brand && products[i]['productname'] === product) {
                wearProductBySku(sku, i);
            }
        }
    }
}

function switchToCategory() {
    switch(category) {
        case 'cheek':
            switch_cheek();
            break;
        case 'lips':
            switch_lips();
            break;
        case 'eyeshadow':
            switch_eyeshadow();
            break;
        case 'eyeliner':
            switch_eyeliner();
            break;
        case 'lash':
            switch_lash();
            break;
    }
}

/* var cModel = 10; */
/* 10 is just a miscellaneous number that does not mean anything
 * The available models are number 0, 1, 2, 3.
 */

var cModel = 0; /* Denotes the current model that should be displayed in the picture */
var clickedModel = 0; /* Model that is clicked in the "Edit Try-On Experience" popup */

function setModel(n) {
    var div_border = document.getElementById('model'+cModel+'border');
    var inner_border = document.getElementById('model'+cModel+'inner_border');

    if (div_border)
    	div_border.className="model_off";
        inner_border.classList.remove("modelpreview_inner_border");

    document.getElementById('model'+clickedModel+'border').className="model_off";
    document.getElementById('model'+clickedModel+'inner_border').classList.remove('modelpreview_inner_border');
    clickedModel = n;
    /* Selects the picture of the model that was clicked */
    document.getElementById('model'+clickedModel+'inner_border').className="modelpreview_inner_border";
    document.getElementById('model'+clickedModel+'border').className="model_hover";
}

/* Resets the "Edit Try-On Experience" popup
   This function is called whenver we close the popup by clicking X.
 */
function resetEditPopup() {
    document.getElementById('model'+clickedModel+'inner_border').classList.remove("modelpreview_inner_border");
    document.getElementById('model'+clickedModel+'border').className = "model_off";
    document.getElementById('model'+cModel+'border').className = "model_hover";
    document.getElementById('model'+cModel+'inner_border').className = "modelpreview_inner_border";
    clickedModel = cModel;
}

// modelUsed is a binary variable that denotes whether or not a model is currently on display
var modelUsed = 0;
var devicemode,devicetype,trackingmode;
function detectDevice() {
  var agent=navigator.userAgent.toLowerCase();

  if(agent.indexOf('iphone')!=-1 || agent.indexOf('ipod')!=-1) {
    devicetype='ios';
    devicemode='mobile';
  } else if(agent.indexOf('ipad')!=-1) {
    devicetype='ios';
    devicemode='tablet';
  } else if(agent.indexOf('android')!=-1) {
    devicetype='android';
    if(agent.indexOf('mobile')!=-1) {
      devicemode='mobile';
    } else {
      devicemode='tablet';
    }
  } else if(agent.indexOf('windows phone')!=-1 || agent.indexOf('iemobile')!=-1) {
    devicemode='mobile';
  } else if(agent.indexOf('blackberry')!=-1) {
    devicemode='mobile';
  } else if(agent.indexOf('opera mini')!=-1) {
    devicemode='mobile';
  } else {
    devicemode='desktop';
  }
}

detectDevice();
if(devicemode=='mobile' || devicemode=='tablet') {
    var touchenabled=1;
} else {
    var touchenabled=0;
}

var currentmakeover_live={};
var currentmakeover_2d={};
var currentmakeover_amount={};
var currentmakeover_sparkle={};
var currentmakeover_gloss={};

function init_makeover() {
    for(var type in makeoverobject) {
        currentmakeover_live[type] = "";
        currentmakeover_2d[type]=-1;
        currentmakeover_amount[type]=0;
        currentmakeover_sparkle[type]=0;
        currentmakeover_gloss[type]=0;
    }
}

function setmain(img, clear_skintones) {
    positionMakeoverImages(img);
    show('makeovercontainer');
    makeoverim = img;
    if (clear_skintones)
        currentSkintone = "";
}


var mfid="";
function uploadResult() {
    var a = document.getElementById('uploadresult').contentWindow.document.body.innerHTML;
    if(a!="") {
        var parts = a.split(":");
        if(parts[0]=="error") {
            if(parts[1]=="noface" || parts[1]=="badface") {
                var translated = toLang("Uh-oh. We couldn't detect your face in the image uploaded. Please try another image.", 'en', lang)
                document.getElementById('error_popup_txt').innerHTML = translated;
                show('error_popup');
                return;
            }
            if(parts[1]=="filesize") {
                var translated = toLang("Sorry. That image exceeds our file size limit. Please choose a file that is 5MB or smaller.", 'en', lang);
                document.getElementById('error_popup_txt').innerHTML = translated;
                show('error_popup');
                return;
            }
            return;
        }

        modelUsed = 0;
        mainim=parts[1];
        mfid=parts[1];

        //currentMakeover = clone_object(makeover);
        currentMakeover['mainim'] = mainim;
        trackEvent("upload a photo");

        var imgip=parts[0];
        var uploaded_mainpic = parts[2];
        uploaded_picwidth=parseInt(parts[3]);
        uploaded_picheight=parseInt(parts[4]);
        facePts['face']=parts[5];
        facePts['leye']=parts[6];
        facePts['reye']=parts[7];
        facePts['lips']=parts[8];
        facePts['teeth']=parts[9];
        setNewFacePts();


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
                +"&id="+mainim
                +"&id2="+uploaded_mainpic
                +"&imgip="+imgip
                +"&myip="+apiserver;
            //alert("myapiserver is: "+apiserver+"; imgserver is: "+imgip);

            xmlHttp.onreadystatechange=function() {
                successfulUpload(uploaded_mainpic, true);
            }

            xmlHttp.open("GET",url,true);
            xmlHttp.send(null);
        } else {
            successfulUpload(uploaded_mainpic, true);
        }
    }
}


//DOM creation functions
function genProductUsed(category, sku, colorId, placement) {

    if(lang=="fr"){
        if(category=="lash") {
            var pCategory = "Cil";
            var pPlacement = "";
        }
        else if(category=="lips") {
            var pCategory = "Lèvre";
            var pPlacement = "";
        }
        else {
            var pCategory = "Fard";
            var pPlacement = "";
        }
    }
    else {
        var pCategory = getDisplayName(category);
        var pPlacement = "";
    }

    if(placement != "default" && placement != "") {
        pPlacement = getDisplayName(placement);
        if(lang=="fr") {
            if(pPlacement=="Outer Corner") {
                pPlacement = "Coin externe";
            }
            else if(pPlacement=="Crease") {
                pPlacement = "Pli";
            }
            else {
                pPlacement = "Paupière";
            }
        }
    }
    var pBrand = makeoverobject[category][sku][colorId]['brand'];
    var pName = makeoverobject[category][sku][colorId]['productname'];
    var pShade = makeoverobject[category][sku][colorId]['shadename'];
    if(pShade=="") {
        if(typeof makeoverobject[category][sku][colorId]['colorname']!= "undefined") {
            pShade = makeoverobject[category][sku][colorId]['colorname'];
        }
    }
    var pPrice = pricef(makeoverobject[category][sku][colorId]['priceus']);
    if(country=="ca" || country=="CA") {
        pPrice = pricef(makeoverobject[category][sku][colorId]['priceca']);
    }
    var pUrl = makeoverobject[category][sku][colorId]['producturl'];
    var pImage = makeoverobject[category][sku][colorId]['thumburl'];

    var wrap = document.createElement("div");
    wrap.id = category+'_'+placement+'_product_wrapper';
    wrap.className = "product_used_swatch";

    var e, e1;

    e = document.createElement("div");
    e.className = "c1";
    e.innerHTML = pCategory;
    if(pPlacement != "") {
        e.innerHTML += " (" + pPlacement + ")";
    }
    wrap.appendChild(e);

    e = document.createElement("div");
    e.id = category+"_"+sku+"_"+colorId+"_"+placement;
    e.className = "c2";
    e.onclick = function() { removeProduct(this.id); };
    wrap.appendChild(e);

    e = document.createElement("hr");
    e.className = "c3";
    e.style = "float:left;margin-top:0px;margin-bottom:0px;width:100%;clear:both;";
    wrap.appendChild(e);

    e = document.createElement("img");
    e.src = pImage;
    e.className = "c4";
     e.onload = function() { imageLoaded(this); };
    wrap.appendChild(e);

    e = document.createElement("div");
    e.className = "c5";

    e1 = document.createElement("div");
    e1.className="current_product_brand c6";
    e1.innerHTML = pBrand +"<br>";
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c7";
    e1.innerHTML = pName;
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c8";
    e1.innerHTML = pShade;
    e.appendChild(e1);

    wrap.appendChild(e);

    e = document.createElement("div");
    e.id = category+"_"+sku+"_"+colorId+"_wearing_favIcon";
    e.onclick = function() {favorite(this.id);};
    e.className = "c9 " + category+"_"+sku+"_"+colorId+"_wearing_favIcon";
    if(typeof myFavorites[category][sku+"_"+colorId] !== "undefined" && myFavorites[category][sku+"_"+colorId] == 1) {
        e.style.background = "black";
    }

    e1 = document.createElement("img");
    e1.className = "c10 cen";
    e1.src="res/favourite.png";
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "favIconBorder26";
    e.appendChild(e1);

    wrap.appendChild(e);

    e = document.createElement("div");
    e.className = "c11";

    e1 = document.createElement("div");
    e1.className = "c12";

    e1.innerHTML = getPriceStr(pPrice);
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.id = category+"_"+sku+"_"+colorId+"_url1";
    e1.className = "c13 cta_grad";
    e1.innerHTML = toLang("SHOP", 'en', lang);
    e1.onclick = function() { productLinkOut(this.id) };

    if (lang == 'fr') {
        e1.innerHTML = 'Magasiner';
        $(e1).css('line-height', '26px');
        $(e1).css('font-size', 7);
    }

    e.appendChild(e1);
    wrap.appendChild(e);

    return wrap;
}

function cloneMakeover(orig) {
    if (orig == -1)
        return -1;
    else
        return jQuery.extend(true, {}, orig);;
}

// returns boolean
function sameMakeover(m1, m2) {
   if (m1 == null || m2 == null)
        return false;

   var duplicate = true;
   for (var category in m1['products']) {
       for (var placement in m1['products'][category]) {
           if (m2['products'][category][placement] != m1['products'][category][placement]) {
                duplicate = false;
                return duplicate;
            }
       }
   }
   return duplicate;
}

function updateCompareBox() {
    for (var i = 0; i < compare.length; ++i) {
        if (compare[i] == -1)
            $('#corner_' + (i + 1).toString()).css('background-image', 'none');
        else
            $('#corner_' + (i + 1).toString()).css('background-image', "url('res/black_dot.png')");
    }
}

// unset is -1
var currentCompareIndex = -1;
var entries_modified = [0, 0, 0, 0];
function addToCompare() {

    // duplicate check based on makeovers (assuming all entries of compare are already unique)
    for (var i=0; i < compare.length; i++) {
        if (compare[i] == -1)
            continue;
        var duplicate = sameMakeover(compare[i], currentMakeover);
        if (duplicate) {
            var error_txt = document.getElementById('error_popup_txt');
            if(lang=="fr") {
                error_txt.innerHTML = "Ce look est déjà sauvegardé";
            } else {
                error_txt.innerHTML = "The current look's makeover already exists, try something new";
            }
            show('error_popup');
            return;
        }
    }

    trackEvent("compare");
    $('#eyeshadow_placement').css('right', '0px');
    $('#eyeliner_placement').css('right', '0px');

    closeRefine(true);//

    var userphoto;
    if(mode()=="live") {
        if(live_photo_taken == false) {
            toTakePhoto(photoUsageStates.COMPARE);
            return;
        } else {
            userphoto = mainim;
        }
    }
    else
    	userphoto = mainim;

    if (useNewAPI() && makeup_modules['main_live_canvas']) {
        from_live = !makeup_modules['main_live_canvas'].paused;
        makeup_modules['main_live_canvas'].pause();
    }

    // default is the next available one
    var take_next_available = true;  // (currentCompareIndex == -1)
    if (take_next_available) {
        var found = false;
        for (var i = 0; i < compare.length; ++i)
            if (compare[i] == -1) {
                compare[i] = cloneMakeover(currentMakeover);
                currentCompareIndex = i;
                found = true;
                break;
            }

        // completely full
        if (!found) {
            if (currentCompareIndex == -1)
                currentCompareIndex = 3;
            compare[currentCompareIndex] = cloneMakeover(currentMakeover);
        }
    }
    else
        compare[currentCompareIndex] = cloneMakeover(currentMakeover);

    if (useNewAPI()) {
        for (var i = 0; i < 4; ++i)
            entries_modified[i] = 0;
        entries_modified[currentCompareIndex] = 1;
    }
    else
        for (var i = 0; i < 4; ++i)
            entries_modified[i] = 1;

    updateCompareImages();
}

// userphoto is the 'base image' upon which all makeup effects are applied
function updateCompareImages(cb) {

    // replace with something less sketchy, dirty all current images
    for (var i = 0; i < compare.length; ++i)
        if (compare[i] != -1)
            compare[i]['remote_id'] = -1;
	if (useNewAPI() && makeup_modules['backend_canvas'].has_set_image)
		getCompareImagesFromLocal(0, cb);
	else
		getCompareImagesFromServer(mainim, cb);
}

function getCompareImagesFromLocal(i, cb) {
    var module_wrapper = makeup_modules['backend_canvas']; // replace with correct module
    var key = 'mainim';
    while (i < compare.length) {
        if (compare[i] == -1) {
            ++i;
            continue;
        }

        var effects = makeoverToEffectsPTO(compare[i]);
        var promise = module_wrapper.createEffects(effects);
        // compare[i]['remote_id'] = -1;

        // return right after to force this process to be synchronized (compare im1 first, then im2, etc...)
        promise.then(function() { compare[i][key] = module_wrapper.module.captureAfter();
                                  getCompareImagesFromLocal(i+1, cb); }
                    );
        return;
    }

    // note the return statement in the while loop, this will only run after all images are set
    reset_time(id_on);
    updateCompareBox();
    showTabCompare();
    currentCompareIndex = -1;
    if (typeof cb == 'function')
        cb();
}

function getCompareImagesFromServer(userphoto, cb) {
	var url="proxy.php?psx=24"
    +"&action=mfapi_v4_compare"
    +"&apiserver="+apiserver
        +"&id="+userphoto;
    uploaded_mainpic = userphoto;
    var n = 0;
    var params_arr = [];
    for(var i = 0;i<compare.length;i++) {
        if (compare[i] == -1)
            continue;

        url+="&look"+n+"=";
        var params = "";
        for(var category in compare[n]['products']) {
            for(var placement in compare[n]['products'][category]) {
                var prod = compare[n]['products'][category][placement];
                if(prod==-1 || prod=="") {
                    continue;
                }
                prod = prod.split("_");
                var sku = prod[1];
                var colorId = prod[2];
                var add_lower = compare[n].eyeliner_lower_on;
                var param = gen_makeup_param(category, sku, colorId, placement, "IISS", add_lower);
                if(params == "") {
                    params=param;
                } else {
                    params+="NEXT"+param;
                }
            }
        }
        url+=params;
        ++n;
    }

    var xmlHttp=GetXmlHttpObject();
    if(xmlHttp==null) {
        error("Browser does not support HTTP Request");
        return;
    }

    url+="&cachefix="+Math.random();
    xmlHttp.onreadystatechange=function() {
        if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete") {
            var parts=xmlHttp.responseText.split(',');

            var curCompare = 0;
            for(var i=0;i<parts.length;i++, ++curCompare) {
                while (curCompare < compare.length && compare[curCompare] == -1)
                    ++curCompare;
                if (curCompare >= compare.length)
                    break;
                if (parts[i]!="") {
                    compare[curCompare]['mainim']=parts[i];
                }
            }
        	reset_time(id_on);
            updateCompareBox();
            showTabCompare();

            if (currentCompareIndex != -1 && compare[currentCompareIndex] != -1)
                selectCompareLook(currentCompareIndex);
            if (typeof cb == 'function')
                cb();
        }
    }

    xmlHttp.open("GET",url,true);
    xmlHttp.send(null);
}

function showTabCompare() {
    hide('tab_tryon');
    hide('menu_remove');
    show('tab_compare');
    prepareCompareScreen();
    select_time('compare');
    id_on = "compare";
    resizeHandler();
}

function closeTabCompare() {
    hide('tab_compare');
    show('menu_remove');
    if (from_live)
        makeup_modules['main_live_canvas'].start();

    if (modelUsed == 1)
        hide('btnRefine');
        updateButtonWidth();

    $('#tab_tryon').css('display', 'flex');
    resizeHandler();
}

// make square, and fit images
function fitQuadDivs() {
    $('#photoquad').height($('#photoquad').width());

    var percentage = 0.493;   // 2 images per row (leave some room for padding etc.)
    var total_width = $('#photoquad').width();
    $('.compare_photo_div').outerWidth(percentage * total_width);
    $('.compare_photo_div').outerHeight($('.compare_photo_div').outerWidth());

    fitQuadPhotos();
}

// fitting is best done after quad divs are added to doc / have proper height and widths
function fitQuadPhotos() {
    var divs = $(".c14, .c29");
    var sample = ($('#tab_tryon').css('display') == 'none')? $('#photoquad') : $('#mid_section');
    var width = $(sample).width() / 2;
    var height = $(sample).height() / 2;
    var pos = getFittingParams(width, height);
    for (var i = 0; i < divs.length; ++i) {
        divs[i].style.left = pos.left;
        divs[i].style.top = pos.top;
        divs[i].style.width = pos.width;
    }
}

function genCompareLook(n, w, h) {
    var look = compare[n];
    var c = document.createElement("div");
    c.className = "compare_photo_div";
    var pos = getFittingParams(w,h);

    var e = document.createElement("img");
    e.src = adjustImageSrc(compare[n]['mainim']);
    e.className = "c14";

    if (entries_modified[n] == 1) {
        e.style.opacity = 0;
        e.onload = function() { imageLoaded(this); };
    }

    c.appendChild(e);

    e = document.createElement("div");
    e.className = "c15";
    //e.style="position:absolute;width:38px;height:38px;";

    var e1 = document.createElement("div");
    e1.className = "c16";
    //e1.style="position:absolute;width:100%;height:100%;background:#000000;opacity:0.20;";
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c17";
    //e1.style="position:absolute;width:100%;height:100%;text-align:center;line-height:44px;font-size:32px;font-family:SephoraSerifJune26;font-style:italic;color:#ffffff;";
    e1.innerHTML = n + 1;
    e.appendChild(e1);
    c.appendChild(e);

    //overlays
    e = document.createElement("div");
    e.id = "compare_look_overlays_"+n;
    e.className = "compare_photo_unselected";

    e1=document.createElement("div");
    e1.id = "compare_look_click_"+n;
    e1.className = "c18";
    e1.onclick = function() { selectCompareLook(n); };
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c19";
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c20";
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c21";
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c22";
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c23";
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c24";
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c25";
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c26";
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.className = "c27";
    e1.innerHTML = n + 1;
    e.appendChild(e1);

    e1 = document.createElement("div");
    e1.id = 'compare_look_remove_'+n;
    e1.className = "c28";

    // text and image
    var text = document.createElement("span");
    text.className = "delete_look_txt text_shadow";
    text.innerHTML = toLang("DELETE LOOK", 'en', lang);
    if (lang === 'fr') {
        text.innerHTML = "SUPPRIMER";
    }
    e1.appendChild(text);

    /*var im_container = document.createElement("div");
    im_container.className = "delete_look_btn";
    e1.appendChild(im_container);*/
    var im = document.createElement('img');
    im.src = 'res/white_x.png';
    im.className = "delete_look_btn";
    e1.appendChild(im);

    e1.onclick = function() { removeCompareLook(this.id); };
    e.appendChild(e1);
    c.appendChild(e);

    return c;
}


function removeCompareLook(lookid) {
    var split = lookid.split("_");
    var look_num = parseInt(split[3]);

    for (var i = 0; i < 4; ++i) {
        if (i >= look_num) {
            entries_modified[i] = 1;
            compare[i] = (i == compare.length-1 || compare[i+1] == -1) ? -1 : cloneMakeover(compare[i+1]);
        }
        else
            entries_modified[i] = 0;
    }

    //entries_modified[lookid] = 1;
    //compare[lookid] = -1;
    updateCompareBox();
    prepareCompareScreen();
}


//var currentCompare = 0;
function selectCompareLook(lookid) {
    if(compare.length<=0) {
        return;
    }
    if(typeof lookid === "undefined") {
        lookid = 0;
        for (var i = 0; i < compare.length; ++i) {
            if (compare[i] != -1) {
                lookid = i;
                break;
            }
        }
    }

    currentCompareIndex = lookid;

    for(var i=0;i<compare.length;i++) {
        if (compare[i] != -1)
            document.getElementById('compare_look_overlays_'+i).className = "compare_photo_unselected";
    }

    //document.getElementById('compare_look_overlays_'+lookid).className = "compare_photo_selected";
    if (document.getElementById('compare_look_overlays_'+lookid)) {
        document.getElementById('compare_look_overlays_'+lookid).className = "compare_photo_selected";
    }
    genCompareProducts(lookid);
}


function genEmptyCompareLook(n, w, h) {
    var c = document.createElement("div");
    c.id = "compare_look_"+n;
    c.className = "compare_photo_div";
    c.onclick = function() { addCompareLook(this.id); };
    var pos = getFittingParams(w,h);

    var e = document.createElement("img");
    e.src = adjustImageSrc(uploaded_mainpic); // the 'naked' one
    e.className = "c29";
    if (!prepared) {
        e.style.opacity = 0;
        e.onload = function() { imageLoaded(this); }
    }
    e.style.left = pos.left;
    e.style.top = pos.top;
    e.style.width = pos.width;
    c.appendChild(e);

    e = document.createElement("div");
    e.className = "c30";
    //e.style="position:absolute;width:100%;height:100%;background:#000000;opacity:0.50;";
    c.appendChild(e);

    e = document.createElement("div");
    e.className = "c31";
    //e.style="position:absolute;left:50%;margin-left:-2px;top:43%;width:4px;height:14%;background:#ffffff;";
    c.appendChild(e);

    e = document.createElement("div");
    e.className = "c32";
    //e.style="position:absolute;left:43%;top:50%;margin-top:-2px;width:14%;height:4px;background:#ffffff;";
    c.appendChild(e);

    e = document.createElement("div");
    e.className = "c33";
    //e.style="position:absolute;left:0px;top:60%;width:100%;color:#FFFFFF;text-align:center;font-family:HelveticaNeue-Medium;font-size:16px;";
    if(lang=="fr") {
        e.innerHTML = "Ajoutez un autre look";
    }
    else {
        e.innerHTML = "Add another look";
    }

    c.appendChild(e);

    return(c);
}

function addCompareLook(id) {
    var split = id.split('_');
    currentCompareIndex = split[split.length-1];
    trackEvent("compare:add another look");
    closeTabCompare();
    selectMenu('lips');
    switch_lips();
}

function surpriseCompare() {
    if(compare.length>=4) {
        compare=[];
    }
    for(var i=compare.length;i<4;i++) {
        var look = clone_object(makeover);
        for(var category in look['products']) {
            for(var placement in look['products'][category]) {
                var s = Math.floor(Math.random() * getObjectSize(makeoverobject[category]));
                var sku = "";
                for(var theSku in makeoverobject[category]) {
                    if(s==0) {
                        sku = theSku;
                        break;
                    } else {
                        s--;
                    }
                }
                var c = Math.floor(Math.random() * getObjectSize(makeoverobject[category][sku]));
                var colorId = "";
                for(var theColorId in makeoverobject[category][sku]) {
                    if(c==0) {
                        colorId = theColorId;
                        break;
                    } else {
                        c--;
                    }
                }
                var prod = category+"_"+sku+"_"+colorId;
                look['products'][category][placement] = prod;
            }
        }

        compare[i] = look;
    }
    addToCompare();
    prepareCompareScreen();
    selectCompareLook();
    trackEvent("compare:surprise me");
}

function generateLook(look) {
    return mfid;
}

var prepared = false;
function prepareCompareScreen() {
    var sample = ($('#tab_tryon').css('display') == 'none')? $('#photoquad') : $('#mid_section');
    var w = $(sample).width() / 2;
    var h = $(sample).height() / 2;
    document.getElementById('photoquad').innerHTML = "";
    document.getElementById('compare_products').innerHTML="";
    for(var i=0;i<4;i++) {
        if(typeof compare[i] !== "undefined" && compare[i] != -1) {
            var e = genCompareLook(i, w, h);
            document.getElementById('photoquad').appendChild(e);
        } else {
            var e = genEmptyCompareLook(i, w, h);
            document.getElementById('photoquad').appendChild(e);
        }
    }
    if(currentCompareIndex != -1 && compare[currentCompareIndex] != -1)
        selectCompareLook(currentCompareIndex);
    else
        selectCompareLook();
    prepared = true;
    fitQuadDivs();
}

function genCompareProducts(lookid) {
    var lookid = (typeof lookid !== "undefined") ? lookid : compare.length-1;

    if (compare.length == 0)
    	return;

    document.getElementById('compare_products').innerHTML="";

    var prods = compare[lookid]['products'];
    for(var category in prods) {
        for(var placement in prods[category]) {
            if(prods[category][placement] == -1 || prods[category][placement] == "") {
                continue;
            }

            var prod = prods[category][placement].split("_");
            var category = prod[0];
            var sku = prod[1];
            var colorId = prod[2];

            var prodinfo = makeoverobject[category][sku][colorId];
            var prodBrand = prodinfo['brand'];
            var prodName = prodinfo['productname'];
            var prodShade = prodinfo['shadename'];
            if(prodShade == "") {
                if(typeof prodinfo['colorname'] != "undefined") {
                    prodShade - prodinfo['colorname'];
                }
            }
            var prodPrice = pricef(prodinfo['priceus']);
            if(country=="ca" || country=="CA") {
                prodPrice = pricef(prodinfo['priceca']);
            }
            var prodImg = prodinfo['thumburl'];

            var isFavorite = 0;
            if(typeof myFavorites[category][sku+"_"+colorId] !== "undefined" && myFavorites[category][sku+"_"+colorId] == 1) {
                isFavorite=1;
            }
            var c = document.createElement('div');
            c.className="compare_product_container";


            var e = document.createElement('div');
            e.className = "c34";
            //e.style="float:left;width:100%;height:12px;font-size:16px;font-family:SephoraSerifJune26;font-style:italic;margin-bottom:16px;";

            var Ccategory = category;
            if(lang=="fr"){
                        if(category=="lash") {
                                var Ccategory = "cil";
                        }
                        else if(category=="lips") {
                                var Ccategory = "lèvre";
                        }
                        else {
                                var Ccategory = "fard";
                        }
                }

            e.innerHTML = Ccategory.capitalizeFirstLetter();
            if(placement!="default") {
                var Dplacement = getDisplayName(placement);
                if(lang=="fr") {
                    if(Dplacement=="Outer Corner") {
                        Dplacement = "Coin externe";
                    } else if(Dplacement=="Crease")
                        Dplacement = "Pli";
                    else
                        Dplacement = "Paupière";
                }
                e.innerHTML += " ("+getDisplayName(Dplacement)+")";
            }
            c.appendChild(e);

            e = document.createElement('div');
            e.className = "c35";
            var starId = prods[category][placement] + "_compare_favIcon";
            var info = Object({prodImg:prodImg, prodBrand:prodBrand, prodName:prodName, prodShade:prodShade, prodPrice:prodPrice,
                                category:category, sku:sku, colorId:colorId, isFavorite:isFavorite, placement:placement, starId:starId});
            attachProductDescription(e, info, true);
            c.appendChild(e);
            document.getElementById('compare_products').appendChild(c);
        }
    }
    resizeHandler();
}


function setCurrent(category, sku, colorId) {
    var pBrand = makeoverobject[category][sku][colorId]['brand'] + "<br>";
    var pName = makeoverobject[category][sku][colorId]['productname'];
    var pShade = makeoverobject[category][sku][colorId]['shadename'];
    if(pShade =="") {
        if(typeof makeoverobject[category][sku][colorId]['colorname'] != "undefined") {
            pShade = makeoverobject[category][sku][colorId]['colorname'];
        }
    }
    var pPrice = pricef(makeoverobject[category][sku][colorId]['priceus']);
        if(country=="ca" || country=="CA") {
                pPrice = pricef(makeoverobject[category][sku][colorId]['priceca']);
        }
    var pUrl = makeoverobject[category][sku][colorId]['producturl'];
    var pImage = makeoverobject[category][sku][colorId]['thumburl'];

    var wrap = document.getElementById(category+'_currentProduct');
    if(is.ipad()) {
        hide(category+'_currentProducts');
    }
    wrap.innerHTML="";
    var fid = sku+"_"+colorId;
    var isFavorite = (typeof myFavorites[category][fid] != "undefined" && myFavorites[category][fid] == 1);
    var starId = category+"_"+sku+"_"+colorId+"_current_favIcon";
    var info = Object({prodImg:pImage, prodBrand:pBrand, prodName:pName, prodShade:pShade, prodPrice:pPrice,
                    category:category, sku:sku, colorId:colorId, isFavorite:isFavorite, starId:starId});
    attachProductDescription(wrap, info);
    //$(wrap).animate({opacity:1.0},200);
}


function selectMenu(category) {
    closeRefine();
    for(var c in makeoverobject) {
        if (c != category) {
            hide(c+"_panel");
            hide(c+"_currentProduct");
            if ((c !== 'eyeshadow') && (c !== 'eyeliner')) {
                // Without this statement, eyeshadow_placement will
                // disappear too quickly upon hide
                hide(c+"_placement");
            }
            hide(c+"_textsearch");
        }
    }
   /*  var placement = currentPlacements[currentCategory];
    if (currentMakeover['products'][currentCategory][placement] !== -1) {
        selectShade(currentMakeover['products'][currentCategory][placement] + '_shade');
    }
   */

    if(is.ipad()) {
        hide(category+"_currentProduct");
    }
    else {
        show(category+"_currentProduct");
    }
    show(category+"_panel");
    show(category+"_textsearch");
    currentCategory=category;

    hideOverflowedShades(category);
    prepareFilterPopup(category);

    if(filterApplied[category]==0) {
                //document.getElementById('btnFilter_img').src = "res/icon_filter.png";
                hide('btnFilter_clearAll');
        } else {
                //document.getElementById('btnFilter_img').src = "res/icon_filter_on.png";
                show('btnFilter_clearAll');
        }

    positionIconsTabularly(category + '_family_content', 5, true);

    var placement = currentPlacements[currentCategory];
    if (currentMakeover['products'][currentCategory][placement] !== -1) {
        selectShade(currentMakeover['products'][currentCategory][placement] + '_shade');
    }

    if (currentCategory == 'eyeshadow')
        positionIconsTabularly('eyeshadow_palette_content', 5, false);
    adjustShadeContentWidth(currentCategory);
}


function updateShadeDims(category) {
  if (filtered[category].size > 0) {
      var visible_shades = $(document.getElementById(category + "_shade_content")).children(":visible").filter(".shade_on, .shade_off");
      if (visible_shades.length <= 0)
          return;
      var shade = visible_shades[0];
      shade_dims[category] = [$(shade).outerHeight(true), $(shade).outerWidth(true)];
  }
}

// arguments:
// line_height specifies margin between rows
// boolean stretch specifies if elements should take all the space (similar to justify-content:space-between)
function positionIconsTabularly(container_id, line_height, stretch) {
	if (typeof line_height == "undefined")
		return;

    var width = $('#' + container_id)[0].clientWidth;
    var icons = $('#' + container_id).children();

    if (icons.length <= 0)
        return;

    var icon_width = $(icons[0]).outerWidth(true);
    var icon_height = $(icons[0]).innerHeight();

    // disregard border
    var border_width = parseInt($(icons[0]).css('border-left-width'));
    icon_width -= border_width;

    var max_per_row = Math.floor(width / icon_width);
    if (stretch === true)
    	max_per_row = Math.min(max_per_row, icons.length);

    var space_remaining = width - max_per_row * icon_width;
    var space_between = Math.floor(space_remaining / (max_per_row - 1));
    var gap = space_remaining - (max_per_row - 1) * space_between;
    var offset_left = 0;
    var gap_remaining = gap;

    // squeezed along y-axis
    for (var i = 0; i < icons.length; ++i) {
        var x_ind = i % max_per_row;
        var y_ind = Math.floor(i / max_per_row);

        if (x_ind == 0) {
            gap_remaining = gap;
            offset_left = 0;
        }

        if (gap_remaining > 0) {
            ++offset_left;
            --gap_remaining;
        }

        var left = x_ind * (icon_width + space_between) + offset_left;
        var top = y_ind * (icon_height + line_height);
        space_remaining -= space_between;

        // assumed position: absolute
        icons[i].style.left = left;
        icons[i].style.top = top;
    }

    if (isTabletSize())
        var y_max = 175;
    else
        var y_max = (Math.ceil(icons.length / max_per_row)) * (icon_height + line_height) - line_height;

    $('#' + container_id).css('height', y_max);
}

var currentPlacements = {
    "lips": "default",
    "lash": "natural",
    "eyeshadow": "lid",
    "cheek": "default",
    "eyeliner": "natural"
};


function unselectFamily(category, family) {
    if(category=="lash") {
        document.getElementById(category+"_"+family).className = "style_off";
        document.getElementById(category+"_"+family+"_outline").className = "lash_not_outlined";
    } else if(category=="lips") {
        document.getElementById(category+"_"+family).className = "lips_family_swatch";
    } else {
        var swatch = document.getElementById(category+"_"+family);
        swatch.className = "family_swatch";
        if (category == "cheek")
            $(swatch).css('background-size', '120% 120%');
        $(swatch).children('#' + category + "_" + family + '_inner')[0].className = "swatch_inner";
    }
}

function selectFamily(divid,e,obj) {
    if(typeof e != "undefined" && typeof obj != "undefined" && is.tablet()) {
        tooltip_mouseclick(e,obj);
    }

    var parts = divid.split("_");
        var category = parts[0];
        var family = parts[1];

    var currentFilters=filters['currentFilters'];

	//unselect
    var ind = currentFilters['family'][category].indexOf(family);
    if(ind > -1) {
        currentFilters['family'][category].splice(ind,1);

        ind = filters['appliedFilters']['family'][category].indexOf(family);
        filters['appliedFilters']['family'][category].splice(ind,1);
        unselectFamily(category, family);
    } else {
        switch(category) {
            case "eyeshadow":
                trackEvent("color family:shadow:"+family);
                break;
            case "lips":
                trackEvent("color family:lips:"+family);
                break;
            case "lash":
                trackEvent("color familiy:lash:"+family);
                break;
            case "cheek":
                trackEvent("color family:cheek:"+family);
                break;
            case "eyeliner":
                trackEvent("color family:liner:"+family);
                break;
        }

        if(category=="lash") {
            document.getElementById(category+"_"+family).className = "style_on";
            document.getElementById(category+"_"+family+"_outline").className = "lash_outlined";
        } else if(category=="lips") {
            document.getElementById(category+"_"+family).className = "lips_family_swatch_selected";
        } else {
            var swatch = document.getElementById(category+"_"+family);
            swatch.className = "family_swatch_selected";
            if (category == "cheek")
                $(swatch).css('background-size', '120% 120%');
            $(swatch).children('#' + category + "_" + family + '_inner')[0].className = "swatch_inner_on";
        }

        currentFilters['family'][category].push(family);
        filters['appliedFilters']['family'][category].push(family);
    }

    playFilters(undefined);
    applyFilters(undefined,1);

    var placement = currentPlacements[currentCategory];
    if (currentMakeover['products'][currentCategory][placement] !== -1) {
        selectShade(currentMakeover['products'][currentCategory][placement] + '_shade');
    }
}

function deselect(c) {
    for(var i = 0; i<allFilters['family'][c].length; i++) {
        family = allFilters['family'][c][i];
        var ds = c+"_"+family;
        var split = document.getElementById(ds).className.split("_");
        var state = split[split.length - 1];
        if(state == "selected" || state == "on") {
            selectFamily(ds);
        }
    }
}

function getNumResult(category) {
    var category = (typeof category !== "undefined") ? category : currentCategory;
    var n=0;
    for(var sku in makeoverobject[category]) {
        for(var colorId in makeoverobject[category][sku]) {
            if(passFilter('currentFilters',category,sku,colorId)) {
                n++;
            }
        }
    }
    return n;
}

var ordered = {
"lips" : {},
"eyeliner" : {},
"eyeshadow" : {},
"lash" : {},
"cheek" : {}
};

function orderShades() {
    for(var category in makeoverobject) {
        if(typeof filtered[category] == "undefined") {
            filtered[category] = new Set();
        }
        if(typeof ordered[category] == "undefined") {
            ordered[category] = [];
        }
        for(var sku in makeoverobject[category]) {
            for(var colorId in makeoverobject[category][sku]) {
                ordered[category].push(makeoverobject[category][sku][colorId]);
            }
        }
        if(category!="lash") {
            ordered[category].sort(compareFN);
        }

        // add to filtered
        for(var i = 0; i < ordered[category].length; ++i) {
            var sku = ordered[category][i].sku;
            var colorid = ordered[category][i].colorid;
            filtered[category].add(sku+'_'+colorid);
        }
    }
    /*
    for(var category in makeoverobject) {
        if(typeof filtered[category] == "undefined") {
            filtered[category] = new Set();
        }
        for(var sku in makeoverobject[category]) {
            for(var colorId in makeoverobject[category][sku]) {
                var prodid = sku+"_"+colorId;
                if(category=="lips" || category=="cheek") {
                    var family = makeoverobject[category][sku][colorId]['family'];
                    if(typeof ordered[category][family] == "undefined") {
                        ordered[category][family] = [];
                    }
                    ordered[category][family].push(prodid);
                } else {
                    filtered[category].add(prodid);
                }
            }
        }
        if(category=="lips" || category=="cheek") {
            for(var family in ordered[category]) {
                for(var i=0;i<ordered[category][family].length;i++) {
                    filtered[category].add(ordered[category][family][i]);
                }
            }
        }
    }*/
}

var filtered={};
function filterShade(category) {
    var category = (typeof category !== "undefined") ? category : currentCategory;
    hidePalette(category);
    currentShade[category] = "";


    filtered[category] = new Set();

    if(category=="lips") {
        for(var i = 0; i < ordered['lips'].length; ++i) {
            var sku = ordered['lips'][i].sku;
            var colorId = ordered['lips'][i].colorid;
            if(passFilter('appliedFilters',category,sku,colorId))
                filtered[category].add(sku+"_"+colorId);
        }
    } else {
        for(var sku in makeoverobject[category]) {
            for(var colorId in makeoverobject[category][sku]) {
                if(passFilter('appliedFilters',category,sku,colorId)) {
                    filtered[category].add(sku+"_"+colorId);
                }
            }
        }
    }
    updateFilteredShades(category);
}



function populateFilterFormulations() {
    // only eyeliner -- for now
    var c = 'eyeliner';
    var parent = document.getElementById('filter_eyeliner_formulation');
    for (var i = 0; i < allFilters['formulation'][c].length;++i) {
        var div = document.createElement('div');
        div.className = 'formulation_option';

        var check = document.createElement('div');
        var nospaces = removeSpaces(allFilters['formulation'][c][i].toLowerCase());
        check.id = c+"_formulation_"+nospaces;
        check.className="small_checkmark_0";
        check.onclick=function() { checkFinish(this.id); };
        div.appendChild(check);

        var text = document.createElement('div');
        text.id = nospaces + '_txt';
        text.className = "formulation_option_txt";
        text.innerHTML = toTitleCase(toLang(allFilters['formulation'][c][i], 'en', lang));

        div.appendChild(text);
        parent.appendChild(div);
    }
}

function populateFilterFinish() {
    var c = 'eyeshadow';
    var parent = document.getElementById('finish_content');
    for (var i = 0; i < allFilters['finish'][c].length; ++i) {
        var div = document.createElement('div');
        div.className = 'finish_option';

        var check = document.createElement('div');
        var nospaces = removeSpaces(allFilters['finish'][c][i].toLowerCase());
        check.id = c + "_finish_" + nospaces;
        check.className="small_checkmark_0";
        check.onclick=function() { checkFinish(this.id); };
        div.appendChild(check);

        var text = document.createElement('div');
        text.id = nospaces + '_txt';
        text.className = "formulation_option_txt";

        if (allFilters['finish'][c][i] == 'glitter')
        	text.innerHTML = toTitleCase(toLang('glimmer', 'en', lang));
        else
        	text.innerHTML = toTitleCase(toLang(allFilters['finish'][c][i], 'en', lang));

        div.appendChild(text);
        parent.appendChild(div);
    }
}

function populateFilterCategories() {
    for(var c in allFilters['category']) {
        if(c=="lips") {
            var tbl = document.createElement('table');

            // table should be 2 x 2 by design, will not accommodate more than 4 entries
            var row1 = tbl.insertRow();
            var row2 = tbl.insertRow();
            for(var i=0;i<allFilters['category'][c].length;i++) {
                var div = document.createElement("div");
                div.className = "c51";
                //div.style="float:left;width:110px;height:12px;margin-left:20px;margin-bottom:20px;";

                var check = document.createElement("div");
                check.id = c+"_category_"+removeSpaces(allFilters['category'][c][i].toLowerCase());
                check.className="small_checkmark_0";
                check.onclick=function() { checkFinish(this.id); };

                div.appendChild(check);

                var txt = document.createElement("div");
                var nospaces = removeSpaces(allFilters['category'][c][i].toLowerCase());
                txt.className = "c52";
                txt.id = nospaces + '_txt';
                //txt.style="float:left;text-transform:uppercase;font-size:14px;font-family:HelveticaNeue;line-height:12px;";

                if (lang == 'fr')
                    txt.style.fontSize = '12px';
                else
                    txt.style.fontSize = '14px';

                txt.innerHTML = toTitleCase(toLang(allFilters['category'][c][i], 'en', lang));
                div.appendChild(txt);

                if (i < 2)
                    var cell = row1.insertCell();
                else
                    var cell = row2.insertCell();

                cell.appendChild(div);
            }
            document.getElementById('filter_'+c+'_category').appendChild(tbl);
        } else if (c == "cheek") {
            var cheek_row1 = document.createElement("div");
            var cheek_row2 = document.createElement("div");
            cheek_row1.className = "cheek_row";
            cheek_row2.className = "cheek_row";
            var container = document.getElementById('filter_'+c+'_category');
            container.appendChild(cheek_row1);
            container.appendChild(cheek_row2);

            for(var i=0;i<allFilters['category'][c].length;i++) {
                var div = document.createElement("div");
                div.className = "cheek_category_0";
                div.id = c+"_category_"+removeSpaces(allFilters['category'][c][i].toLowerCase());

                var img = document.createElement("img");
                img.className = "cheek_img";
                img.src="res/cheek_"+i+".png";
                div.appendChild(img);

                var txt = document.createElement("div");
                txt.id = allFilters['category'][c][i].toLowerCase() + '_txt';
                txt.className = "cheek_txt";
                txt.innerHTML = getDisplayName(allFilters['category'][c][i]);
                txt.innerHTML = toTitleCase(toLang(txt.innerHTML, 'en', lang));

                var outline = document.createElement("div");
                outline.id = div.id + "_outline";

                div.appendChild(txt);
                if (Math.floor(i / 2) == 0) {
                    outline.className = "outline_row0_0";
                    div.appendChild(outline);
                    cheek_row1.appendChild(div);
                }
                else {
                    outline.className = "outline_row1_0";
                    div.appendChild(outline);
                    cheek_row2.appendChild(div);
                }

                div.onclick = function() { checkFinish(this.id); toggleCheckBox(this.id + "_outline");};
            }

        }
    }
}

function populatePlacement() {
    for(var c in placements) {
        if (c !== 'eyeliner' && c !== 'eyeshadow') {
              for(var i=0;i<placements[c].length;i++) {
                  var p = placements[c][i];
                  var div = document.createElement("div");
                  div.id = "placement_"+c+"_"+p;
                  div.className = "placement_off";
                  div.style.backgroundImage="url(res/placement_"+c+"_"+placements[c][i]+".png)";
                  //div.style.backgroundImage="url(res/placement_"+c+"_"+placements[c][i]+"_off.png)";
                  // div.style.backgroundImage=url("res/placement_"+c+"_"+placements[c][i]+"_cropped.png");
                  div.style.backgroundColor="#ffffff";
                  // div.style.backgroundSize="cover";
                  div.onclick = function() { selectPlacement(this.id) };

                  var txt = document.createElement("div");
                  txt.className = "c53";
                  txt.id = "placement_txt_" + p;


                  //txt.style = "float:left;width:100%;height:1.5%;margin-top:19%;text-align:center;";
                  var word = p;
                  if(lang=="fr")
                      word = eyeshadow_fr[i];

                  txt.innerHTML = getDisplayName(word);
                  txt.innerHTML = toTitleCase(toLang(txt.innerHTML, 'en', lang));

                  div.appendChild(txt);
                  document.getElementById(c+"_placement").appendChild(div);
              }
            selectPlacement("placement_"+c+"_"+placements[c][0]);
            document.getElementById(c+"_placement").children[0].className = "placement_on";
        }
        //selectPlacement("placement_"+c+"_"+placements[c][0]);
    }
}

function touchupSharePhoto() {
    closeShare();
    photoUsageState = photoUsageStates.SHARE;
    toRefine();
}

var selectedEyelinerColour = "";
function selectPlacement(divid) {
    var parts = divid.split("_");
    var category = parts[1];
    var placement = parts[2];
   /*
    if (currentMakeover['products'][currentCategory][placement] !== -1) {
        selectShade(currentMakeover['products'][currentCategory][placement] + '_shade');
    }
    */
    if (parts[3]) {
        var eyelinerFull = parts[3]
    }

    if(category=="eyeshadow") {
        switch(placement) {
            case "lid":
            case "crease":
                trackEvent("shadow:"+placement);
                break;
            case "outercorner":
                trackEvent("shadow:outer corner");
                break;
        }
    } else if (category === 'eyeliner') {
        switch(placement) {
            case 'natural':
                if (eyelinerFull === 'lower') {
                    trackEvent('liner:style:natural-withLowLash');
                } else if (eyelinerFull === 'only') {
                    trackEvent('liner:style:natural-topOnly');
                }
                break;
            case 'winged':
                if (eyelinerFull === 'lower') {
                    trackEvent('liner:style:winged-withLowLash');
                } else if (eyelinerFull === 'only') {
                    trackEvent('liner:style:winged-topOnly');
                }
                break;
            case 'smoky':
                if (eyelinerFull === 'lower') {
                    trackEvent('liner:style:smoky-withLowLash');
                } else if (eyelinerFull === 'only') {
                    trackEvent('liner:style:smoky-topOnly');
                }
                break;
        }
    }

    if (category === 'eyeliner') {
        currentPlacements[category] = placement;
        if(currentMakeover['products'][category][placement] != "" && currentMakeover['products'][category][placement] != -1) {
            var parts = currentMakeover['products'][category][placement].split("_");
            currentProduct[category] = parts[0]+"_"+parts[1]+"_"+parts[2];
            updateSwatches(parts[0]+"_"+parts[1]+"_"+parts[2]);
            currentShade[category] = parts[0]+"_"+parts[1]+"_"+parts[2];
        } else {
            currentProduct[category] = "";
            updateSwatches(category+"__");
            currentShade[category] = -1;
        }

        $('.eyeliner_background').css('opacity', '0.3');
        $('.eyeliner_background').css('background-color', 'rgb(170, 170, 170)');

        currentMakeover['products'][category]['natural'] = -1;
        currentMakeover['products'][category]['winged'] = -1;
        currentMakeover['products'][category]['smoky'] = -1;



        if (eyelinerFull === 'lower') {
            currentMakeover['eyeliner_lower_on'] = true;
            $('#'+placement+'_lower').css('opacity', '1');

        } else {
            currentMakeover['eyeliner_lower_on'] = false;
            $('#'+placement+'_background').css('opacity', '1');
        }
        if (selectedEyelinerColour !== "") {
            selectShade(selectedEyelinerColour);
        }

    } else {
        for(var i=0;i<placements[category].length;i++) {
            var p = placements[category][i];
            document.getElementById("placement_"+category+"_"+p).className = "placement_off";
        }

        //$("#placement_txt_outercorner").css('bottom', '10px');
        document.getElementById("placement_"+category+"_"+placement).className = "placement_on";

        if (divid === 'placement_eyeshadow_outercorner') {
            $("#placement_txt_outercorner").css('bottom', '-1px');
        }

        if(prev_txt!="") {
            //document.getElementById(prev_txt).style.opacity = "0.4";
            prev_txt = "";
        }
        // document.getElementById("placement_txt_"+placement).style.opacity = "1";

        currentPlacements[category] = placement;

        if(currentMakeover['products'][category][placement] != "" && currentMakeover['products'][category][placement] != -1) {
            var parts = currentMakeover['products'][category][placement].split("_");
            currentProduct[category] = parts[0]+"_"+parts[1]+"_"+parts[2];
            updateSwatches(parts[0]+"_"+parts[1]+"_"+parts[2]);
            currentShade[category] = parts[0]+"_"+parts[1]+"_"+parts[2];
            selectShade(currentMakeover['products']['eyeshadow'][placement] + '_shade');
        } else {
            currentProduct[category] = "";
            updateSwatches(category+"__");
            currentShade[category] = -1;
        }
    }
    updateCurrentProduct(category);
    if (currentMakeover['products'][currentCategory][placement] !== -1) {
        selectShade(currentMakeover['products'][currentCategory][placement] + '_shade');
    }
}

function maintainSelectedShade() {
    if (currentMakeover['products'][currentCategory]) {
        selectShade(currentMakeover['products'][currentCategory] + '_shade');
    }
}


function populateFamily() {
    for(var c in allFilters['family']) {
        if(allFilters['family'][c].length<=0) {
            continue;
        }
        for(var i=0;i<allFilters['family'][c].length;i++) {
            var tooltip_width = "37px";
            var family = allFilters['family'][c][i];
            var div = document.createElement("div");
            div.id = c+"_"+family;
            div.onclick = function(event) { selectFamily(this.id,event,this); };

            if(c=="lash") {
                div.className = "style_off";
                var img = document.createElement("img");
                img.className = "lash_pic_" + family;
                img.src = "res/style_"+c+"_"+allFilters['family'][c][i]+".png";
                var txt = document.createElement("div");
                txt.className = "c54";
                var lash_style = family;

                txt.innerHTML = getDisplayName(lash_style);
                txt.innerHTML = toLang(txt.innerHTML, 'en', lang);

                var pic_and_txt_wrapper = document.createElement("div");
                pic_and_txt_wrapper.id = c+"_"+family+"_outline";
                pic_and_txt_wrapper.className = "lash_not_outlined";
                pic_and_txt_wrapper.appendChild(txt);
                pic_and_txt_wrapper.appendChild(img);
                div.appendChild(pic_and_txt_wrapper);

            } else if(c=="lips") {
                div.className="lips_family_swatch";

                var txt = document.createElement("div");
                txt.className = "c55";

                var lips_color = family;
                if(lang=="fr")
                    lips_color = lips_color_fr[i];

                var img = document.createElement("img");
                img.className = "c56";
                img.onload = function() { imageLoaded(this); }
                img.src = "res/"+c+"_"+family+".png";
                attachToolTip(div, toTitleCase(lips_color), tooltip_width);
                div.appendChild(img);
            } else {
            	div.className="family_swatch";
            	div.style.backgroundImage = "url('res/"+c+"_"+family+".png')";
            	var eyeliner_color = family;

                if (c == "cheek")
                    $(div).css('background-size', '120% 120%');

            	var inner = document.createElement("div");
            	inner.id = c+"_"+family+"_inner";
            	inner.className = "swatch_inner";
            	eyeliner_color = toLang(eyeliner_color, 'en', lang);

            	attachToolTip(div, toTitleCase(eyeliner_color), tooltip_width);
            	div.appendChild(inner);
            }

            document.getElementById(c+"_family_content").appendChild(div);
        }
    }
}

// setups tooltip along with events for given div.
function attachToolTip(div, name, min_width, max_width) {
    if ($(div).children('.tooltip').length > 0) {
        return;
    }
    var tooltip = getToolTip(name, min_width, max_width);
    div.appendChild(tooltip);
    tooltip_mousemove_pto(div);
    $(div).mouseover(function() {tooltip_mousemove_pto(div);});
    $(div).mouseout(function() {tooltip_mouseout(div);});
}

var currentCategory="lips";
var current_shades = {};
var current_visible_shades = {};
var shade_to_index_map = {};  // structore for id to index mapping

// hide all shades and update current_visible_shades
function updateFilteredShades(category) {
    var container = document.getElementById(category+"_shade_content");
    var shades = $(container).children('.shade_off, .shade_on');
    current_shades[category] = [];
    current_visible_shades[category] = [];
    shade_to_index_map[category] = {};

    var cur_index = 0;
    for (var i = 0; i < shades.length; ++i) {
        var parts = shades[i].id.split("_");
        var id = parts[1] + "_" + parts[2];
        if (filtered[category].has(id)) {
            current_shades[category].push(shades[i]);
            shade_to_index_map[category][shades[i].id] = cur_index;
            ++cur_index;
        }
        shades[i].style.display = 'none';
    }
    container.scrollTop = 0;
    hideOverflowedShades(category);
}


function populateShade(category) {
    var container = document.getElementById(category+"_shade_content");
    current_shades[category] = [];
    current_visible_shades[category] = [];
    shade_to_index_map[category] = {};
    document.getElementById(category+"_shade_content").innerHTML="";

    // top padding, for faking scrollbar
    var top_pad = document.createElement("div");
    top_pad.id = category + "_top_pad";
    top_pad.className = "shade_padding";

    container.appendChild(top_pad);
    var cur_index = 0;

    for (var id of filtered[category]) {
        var parts = id.split("_");
        var sku = parts[0];
        var colorId = parts[1];

        //var disp = "circle";
        var prod = makeoverobject[category][sku][colorId];
        var pName = makeoverobject[category][sku][colorId]['productname'];
        var div = document.createElement("div");
        div.id = category+"_"+sku+"_"+colorId+"_shade";
        div.onclick = function() {selectShade(this.id,1);};
        div.className = 'shade_off';

        // need one sample to be shown for updating shade_dims
        if (count == 0) {
            div.style.display = 'block';
            current_visible_shades[category].push(div);
        }
        else
            div.style.display = 'none';

        if(category=="lash") {
            var lashurl = "http://a0dev.modiface.com/sephora-web4.0/res/lash/"+prod['imgname'];
            var div2 = document.createElement("div");
            div2.style.backgroundImage = 'url(' + lashurl + ')';
            div2.className = "c59";
        } else {
            var div2 = document.createElement("div");
            div2.className = "c60";
            div2.style.background="rgb("+prod['rgb']+")";
        }

        // extremely slow if we try attaching a tooltip right now
        (function(div, pName, min_width, max_width) {
            $(div).mouseover(function() {attachToolTip(div, pName, min_width, max_width);});
        })(div, pName, "200px", "200px");
        div.appendChild(div2);

        current_shades[category].push(div);
        shade_to_index_map[category][div.id] = cur_index;
        container.appendChild(div);
        ++cur_index;
    }

    // bottom padding, for faking scrollbar
    var bot_pad = document.createElement("div");
    bot_pad.id = category + "_bot_pad";
    bot_pad.className = "shade_padding";
    container.appendChild(bot_pad);

    if (category === "lips" && selectedLipsShade !== "") {
        selectShade(selectedLipsShade);
    } else if (category === "eyeshadow" && selectedEyeshadowShade !== "") {
        selectShade(selectedEyeshadowShade);
    } else if (category === "lash" && selectedLash !== "") {
        selectShade(selectedLash);
    } else if (category === "cheek" && selectedCheekShade !== "") {
        selectShade(selectedCheekShade);
    }

    hideOverflowedShades(category);
}

// we need sample dimensions that persist even when shade divs are hidden
// shade_dims[category][0] is height, [1] for width
var shade_dims = {};

// to limit the number of visible DOM-elements and decrease latency of the web-page
// will only function when the container div is visible
function hideOverflowedShades(category) {
    updateShadeDims(category);
    var container = document.getElementById(category+"_shade_content");

    if (! $(container).is(":visible") || typeof shade_dims[category] == "undefined")
        return;

    if (current_shades.length <= 0)
        return;

    var elements_per_row = elementsPerRow(container, category);

    // hash params
    var top_bound = $(container).scrollTop();
    var bot_bound = top_bound + $(container).height();
    var row1 = Math.floor(top_bound / shade_dims[category][0]);
    var row2 = Math.ceil(bot_bound / shade_dims[category][0]);
    var first_shade_id = elements_per_row * row1;
    var last_shade_id = elements_per_row * row2 - 1;

    for (var i = 0; i < current_visible_shades[category].length; ++i)
        current_visible_shades[category][i].style.display = 'none';
    current_visible_shades[category] = [];

    for (var i = first_shade_id; i <= last_shade_id; ++i)
    {
        if (i < 0 || i > current_shades[category].length - 1)
            break;
        current_shades[category][i].style.display = 'block';
        current_visible_shades[category].push(current_shades[category][i]);
    }

    // fake the scroll bar by manipulating paddings
    var top_padding = $('#' + category + '_top_pad');
    var bot_padding = $('#' + category + '_bot_pad');
    var max_height = shade_dims[category][0] * Math.ceil(current_shades[category].length / elements_per_row);
    $(top_padding).height(row1 * shade_dims[category][0]);
    $(bot_padding).height(max_height - row2 * shade_dims[category][0]);
}


var currentShade = {
    "lips" : "",
    "lash" : "",
    "eyeshadow" : "",
    "cheek" : "",
    "eyeliner" : ""
};

var prev_txt = "";
function grey_switch() {
    var grey_btn = currentPlacements["eyeshadow"];
    prev_txt = "placement_txt_" + grey_btn;
    //document.getElementById('placement_eyeshadow_'+grey_btn).style.opacity="1";
}

var prev = "";
function grey_off() {
    prev = currentPlacements["eyeshadow"];

    document.getElementById('placement_eyeshadow_'+prev).style.opacity="";
}

function updateSwatches(prodid) {
    var parts = prodid.split("_");
    var category = parts[0];
    var sku = parts[1];
    var id = parts[2];

    if(currentShade[category]!="" && currentShade[category]!=-1) {
        // If a partiular shade has been selected, the x button and the border outline will be removed
        // When we click on another swatch
        var parts = currentShade[category].split("_");
        var s1 = document.getElementById(parts[0]+"_"+parts[1]+"_"+parts[2]+"_palette");
        var s2 = document.getElementById(parts[0]+"_"+parts[1]+"_"+parts[2]+"_shade");
        var remove = document.getElementById(parts[0]+"_"+parts[1]+"_"+parts[2]+"_shade_remove");
        if(s1) {
            s1.className = "shade_off";
            var inner = $(s1).children('.c60_on');
            if (inner.length > 0) {
                $(inner[0]).attr('class', 'c60');
            }
        }

        if(s2) {
            // Removes black border
            s2.className = "shade_off";
            var inner = $(s2).children('.c60_on');
            if (inner.length > 0) {
                $(inner[0]).attr('class', 'c60');
            }
        }

        if(remove) {
            // Removes x off of shade
            remove.parentNode.removeChild(remove);
        }
    }
    if(sku == "" || id == "") {
        return;
    }

    parts = prodid.split("_");
    category = parts[0];
    sku = parts[1];
    id = parts[2];

    var prods = makeoverobject[category][sku];

    if(getObjectSize(prods)>1) {
        // show(category+"_palette_content");
        populatePalette(prodid);
        $('#eyeshadow_palette_content').show();
        if($('#eyeshadow_palette_content').children(':visible').length === 0) {
        // action when all are hidden
            $('#palette_shades_header').hide();
            $('#eyeshadow_palette_content').hide();
        } else {
            $('#palette_shades_header').show();
            $('#eyeshadow_palette_content').show();
            positionIconsTabularly('eyeshadow_palette_content', 5, false);
        }
    } else {
        hidePalette(category);
    }


    var palId = category+"_"+sku+"_"+id+"_palette";
    var shaId = category+"_"+sku+"_"+id+"_shade";

    if(document.getElementById(shaId)) {
        document.getElementById(shaId).className = "shade_on";
        var inner = $('#'+shaId).children('.c60');
        if (inner.length > 0)
            $(inner[0]).attr('class', 'c60_on');

        if(category=="eyeshadow") {
            grey_switch();
        }

        var rem = document.createElement("div");
        rem.id = shaId+"_remove";

        if(category=="lash") {
            rem.className = "shade_remove_lash";
        } else {
            rem.className = "shade_remove";
        }

        rem.onclick = function() { removeInstanceOfShade(this.id) };
        rem.innerHTML = "x";
        document.getElementById(shaId).appendChild(rem);
    }

    if(document.getElementById(palId)) {
        document.getElementById(palId).className = "palette_on";
    }

    /*
    var sw = document.getElementById(shaId);
    var swTop = sw.getClientRects()[0].top;
                document.getElementById(palId).className = "palette_on";
        }*/


    // This code below and the subsequent if statement
    // will auto-scroll the shade box in the case where
    // most of the selected shade lies outside of the box.
    /*
    var sw = document.getElementById(shaId);
    if(sw) {
        var swTop = sw.getClientRects()[0].top;
        var paTop = sw.parentNode.offsetTop;
        var t = swTop - paTop;

        if(t > sw.parentNode.offsetHeight || t < 0) {
            document.getElementById(category+"_shade_content").scrollTop = 0;
            swTop = sw.offsetTop;
            paTop = sw.parentNode.offsetTop;
            t = swTop - paTop;
            document.getElementById(category+"_shade_content").scrollTop = t;
        }
    }
    */
}

// These four global variables store the current look that is being worn.
// They are initialized to the initial look of the model (upon loading)
var selectedLipsShade = "";
var selectedEyeshadowShade = "";
var selectedLash = "";
var selectedCheekShade = "";

var removing=0;
var currentlySelectedShades = [];

function selectShadeTracking(category, sku) {
    switch(category) {
    case "lips":
        var trackcat = "lip";
        break;
    case "lash":
        var trackcat = "lash";
        break;
    case "eyeliner":
        var trackcat = 'eyeliner';
        break;
    case "eyeshadow":
        var trackcat = "shadow";
        break;
    case "cheek":
    default:
        var trackcat = "cheek";
        break;
    }

    if(category=="eyeshadow"||category=="cheek") {
        if(makeoverobject[category][sku].length>1) {
            trackEvent(trackcat+":palette:"+sku);
        } else {
            trackEvent(trackcat+":single:"+sku);
        }
    } else {
        trackEvent(trackcat+":"+sku);
    }
}

function selectShade(prodid,swatchClicked,dont_apply) {
    if(removing==1) {
        removing=0;
        return;
    }
    currentlySelectedShades.push(prodid);

    var parts = prodid.split("_");
    var category = parts[0];
    var sku = parts[1];
    var id = parts[2];
    var from = parts[3];

    if (category === 'eyeliner') {
        eyelinerApplied = true;
    }

    $('.shade_on').removeClass('shade_on').addClass('shade_off');
    $('.c60_on').removeClass('c60_on').addClass('c60');
    var xButtons = document.getElementsByClassName("shade_remove");

    while (xButtons.length !== 0) {
        var xButton = xButtons[0];
        xButton.parentNode.removeChild(xButton);

    }

    // For tablet, clicking swatch again can remove it
    if(typeof swatchClicked != "undefined" && swatchClicked == 1
     && is.tablet()
     && category+"_"+sku+"_"+id == currentShade[category])
    {
        removeInstanceOfShade(category+"_"+sku+"_"+id+"_shade_remove");
        removing = 0;
        return;
    }

    if(typeof(makeoverobject[category][sku]) == "undefined" || typeof(makeoverobject[category][sku][id]) == "undefined") {
        return;
    }

    selectShadeTracking(category, sku);
    var pid = category+"_"+sku+"_"+id;
    updateSwatches(pid);
    currentShade[category] = pid;

    selectProduct(pid, !dont_apply);

    if (category === "lips") {
        selectedLipsShade = prodid;
    } else if (category === "eyeshadow") {
        selectedEyeshadowShade = prodid;
    } else if (category === "lash") {
        selectedLash = prodid;
    } else if (category === "cheek") {
        selectedCheekShade = prodid;
    } else if (category === "eyeliner") {
        selectedEyelinerColour = prodid;
    }

    // scroll if the shade overflows from container a bit
    var shade = document.getElementById(category+"_"+sku+"_"+id+"_shade");
    scrollToShade(shade);
}

var auto_scrolling = false;

// will only work for current category
function scrollToShade(shade) {
    var container = shade.parentNode;
    if ($(shade).parent().css('display') == 'none')
        return;

    // out of view
    if (shade.clientHeight == 0) {
    	var shade_num = shade_to_index_map[currentCategory][shade.id];
    	var elements_per_row = elementsPerRow(container, currentCategory);
	    var from_top = shade_dims[currentCategory][1] * Math.floor(shade_num / elements_per_row)
	    var offset = (container.clientHeight- shade_dims[currentCategory][1]) / 2.0;
	    container.scrollTop = from_top - offset;
	    return;
    }

	var container_top = $(container).offset().top;
    var shade_top = $(shade).offset().top;
    var container_bot = container_top + container.clientHeight;
    var shade_bot = shade_top + shade.clientHeight;

    if (shade_top < container_top) {
        var diff = shade_top - container_top;
        var offset = (shade.clientHeight - container.clientHeight) / 2.0;
    }
    else if (shade_bot > container_bot) {
        var diff = shade_bot - container_bot;
        var offset = (container.clientHeight - shade.clientHeight) / 2.0;
    }
    if (shade_top < container_top || shade_bot > container_bot) {
        var final = container.scrollTop + diff + offset;

        // hide tooltips as it looks funny while scrolling
        for (var i = 0; i < visible_tooltips.length; ++i)
            $(visible_tooltips[i]).hide();
        visible_tooltips = [];

        auto_scrolling = true;
        var scroll_time = (useNewAPI()) ? 0 : 200;
        $(container).animate({scrollTop:final}, scroll_time,function() { auto_scrolling = false;} );
    }
}

var eyelinerApplied = false;
function removeInstanceOfShade(remid) {
    grey_off();
    ttt = prev;
    removing=1;
    var parts = remid.split("_");
    var category = parts[0];
    var sku = parts[1];
    var colorid = parts[2];

    var placement;

    if (category === 'eyeshadow') {
        for (var i = 0; i < placements["eyeshadow"].length; ++i) {
            var p = placements["eyeshadow"][i];
            var state = document.getElementById("placement_" + category + "_" + p).className;
            if (state == "placement_on") {
                placement = p;
                break;
            }
        }
    } else if (category === 'eyeliner') {
        placement = 'natural';
    } else {
        placement = "default"
    }

    var pid = category+"_"+sku+"_"+colorid;
    if (category === 'eyeliner') {
        selectedEyelinerColour = "";
        eyelinerApplied = false;
        currentMakeover['products']['eyeliner']['natural'] = -1;
        currentMakeover['products']['eyeliner']['smoky'] = -1;
        currentMakeover['products']['eyeliner']['winged'] = -1;
        $('.eyeliner_background').css('background-color', 'rgb(170, 170, 170)');
    }

    if(currentMakeover['products'][category][placement] == pid) {
        currentMakeover['products'][category][placement] = -1;
            switch(placement) {
                case "crease":
                    currentmakeover_live["eyeshadow_1"] = "";
                    break;
                case "lid" :
                    currentmakeover_live["eyeshadow_2"] = "";
                    break;
                case "outercorner":
                    currentmakeover_live["eyeshadow_0"] = "";
                    break;
                case "default":
                    if(category == "lips") {
                        currentmakeover_live['lipcolor'] = "";
                    } else if(category == "lash"){
                        currentmakeover_live['lash'] = "";
                    } else {
                        currentmakeover_live['cheek'] = "";
                    }
                    break;
            }
            if(document.getElementById(pid+"_palette")) {
                document.getElementById(pid+"_palette").className = "palette_off";
            }
    }
    if(pid == currentProduct[category]) {
        currentProduct[category] = "";
    }
    if(pid == currentShade[category]) {
        currentShade[category] = "";
    }

    if (document.getElementById(pid+"_shade")) {
        document.getElementById(pid+"_shade").className = "shade_off";
        var inner = $('#'+pid+"_shade").children('.c60_on');
        if (inner.length > 0)
            $(inner[0]).attr('class', 'c60');
    }

    var ele = document.getElementById(remid);
    if (ele) {
        ele.parentNode.removeChild(ele);
    }

    updateMakeoverChange(category, placement, 1);
    apply();
}

function populatePalette(prodid) {
    var parts = prodid.split("_");
    var category = parts[0];
    var sku = parts[1];
    var id = parts[2];

    document.getElementById(category+"_palette_content").innerHTML = "";
    var prods = makeoverobject[category][sku];

    for(var i in prods) {
        var disp = "block";
        var prod = makeoverobject[category][sku][i];

        var div = document.createElement("div");
        div.id = category+"_"+sku+"_"+i+"_palette";
        div.onclick = function() {selectShade(this.id);};
        div.className = "palette_off";
        div.style.display = disp;

        var div2 = document.createElement("div");
        div2.className = "c61";
        div2.style.background="rgb("+prod['rgb']+")";


        div.appendChild(div2);
        document.getElementById(category+"_palette_content").appendChild(div);
    }
    show(category+"_palette");

    if(document.getElementById(category+"_"+sku+"_"+id+"_palette")) {
        document.getElementById(category+"_"+sku+"_"+id+"_palette").className = "palette_on";
    }
}

function hidePalette(category) {
    document.getElementById(category+"_palette_content").innerHTML = "";
    hide(category+"_palette");
}

var currentProduct = {
    "lips": "",
    "lash": "",
    "eyeshadow": "",
    "cheek": "",
    "eyeliner": ""
};

function selectProduct(prodid, apply_makeup) {
    var parts = prodid.split("_");
    var category = parts[0];
    var sku = parts[1];
    var id = parts[2];
    var placement = currentPlacements[category];

    currentProduct[category] = category+"_"+sku+"_"+id;
    currentMakeover["mainim"] = mainim;

    if (currentMakeover["products"][category][placement] != currentProduct[category]) {
	    currentMakeover["products"][category][placement] = currentProduct[category];
	    updateMakeoverChange(category, placement, 1);
        updateCurrentProducts();
        if (apply_makeup)
	       applyMakeup();
    }
    adjustFooter();
}

function applyMakeup(frameid,cb) {
    if (useNewAPI()) {
    	if (mode()=="live" && makeup_modules['main_live_canvas'] && makeup_modules['main_live_canvas'].ready) {
            var effects_array = makeoverToEffectsPTO(currentMakeover);
	        makeup_modules['main_live_canvas'].createEffects(effects_array);

            // replace with nothing afterwards, this is just for testing
            if (typeof makeup_modules['main_live_canvas'] == "undefined") {
                initLiveCanvas();
            }
        }
        // either in photo mode or when photo popup is showing (in which case we need to update makeup on mainim upon looksGood)
        if (makeup_modules['backend_canvas'] && makeup_modules['backend_canvas'].ready
            && (mode() == 'photo' || $('#takePhoto').css('display') != 'none' || currentAdjustStep != 'NA') ) {

            // check if this photo module has been initialized properly (needs an image)
            if (makeup_modules['backend_canvas'].has_set_image) {
                var effects_array = makeoverToEffectsPTO(currentMakeover);
                var module_wrapper = makeup_modules['backend_canvas'];
                var promise = module_wrapper.createEffects(effects_array);
                promise.then(function() {$('#mainim').attr('src', module_wrapper.module.captureAfter());});
                currentMakeover['remote_id'] = -1;
            }
            else {
                console.log('attempted to apply makeup without an image set');
            }
        }
    }
    else {
        var url="proxy.php?psx=24"
        +"&action=mfapi_v4"
        +"&apiserver="+apiserver
        +"&id="+mainim;
    	for(var category in currentMakeover['products']) {
	        for(var placement in currentMakeover['products'][category]) {
	            var prod = currentMakeover['products'][category][placement];
	            if(prod==-1 || prod=="") {
	                continue;
	            }
	            prod = prod.split("_");
	            var sku = prod[1];
	            var colorId = prod[2];
	            var add_lower = currentMakeover.eyeliner_lower_on;
	            var param = gen_makeup_param(category, sku, colorId, placement, "=", add_lower);
	            url+="&"+param;
	        }
    	}

    	var xmlHttp=GetXmlHttpObject();
	    if(xmlHttp==null) {
	        error("Browser does not support HTTP Request");
	        return;
	    }

	    if(mainim != "") {
	        url+="&cachefix="+Math.random();
	        xmlHttp.onreadystatechange=function() {
	            if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete") {
	                var resultarray=xmlHttp.responseText.split(',');
	                var result=resultarray[0];
	                makeoverim = result;

	                updatemain(result);
	                if(typeof cb == "function") {
	                    cb();
	                }
	            }
	        }

	        xmlHttp.open("GET",url,true);
	        xmlHttp.send(null);
	    }
    }
}



var left_panels_ordering = ['menu_lips', 'menu_eyeshadow', 'menu_eyeliner', 'menu_cheek', 'menu_lash', 'menu_compare', 'menu_remove'];

// every panel holds a top border (and no bottom border)
function select_time(id) {
    var menu_id = 'menu_' + id;
    var panel = document.getElementById(menu_id);
    panel.style.backgroundColor = tab_selected_bgcolor;
    panel.style.color = "#000000";
    panel.style.boxShadow = "inset 0 2px 2px 0 rgba(0,0,0,0.10)";
    set_borders(menu_id, 1, 0);
    $('#' + menu_id).children().css('fontFamily', 'SFUIText-Bold');
    set_selected_borders(menu_id, left_panels_ordering);
}


function reset_time(id) {
    if(id!="") {
        var menu_id = 'menu_' + id;

        document.getElementById(menu_id).style.color = "#777777";
        $('#'+menu_id).css('color')
        $('#'+menu_id).css('background-color', 'rgba(238,238,238,0.50)');
        $('#'+menu_id).children().css('fontFamily', 'SFUIText');
        $('#'+menu_id).css('box-shadow', 'none');
        set_unselected_borders(menu_id, left_panels_ordering);

        // always hide the bottom-most panel's top border
        // set_borders(left_panels_ordering[left_panels_ordering.length-1], 1, 0);

        //hide('eyeshadow_placement');
        if (id == "eyeshadow") {
            $('#eyeshadow_placement').css('right', 0);
        } else if (id == 'eyeliner') {
            $('#eyeliner_placement').css('right', 0);
        } else if (id =="compare") {
            closeTabCompare();
        }
    }
}

var id_on="";

function switch_lips() {
    if (id_on == "lips")
        return;

    reset_time(id_on);
    select_time('lips');
    id_on='lips';
}

function switch_lash() {
    if (id_on == "lash")
        return;

    reset_time(id_on);
    select_time('lash');
    id_on='lash';
}

function switch_cheek() {
    if (id_on == "cheek")
        return;

    reset_time(id_on);
    select_time('cheek');
    id_on='cheek';
}

function switch_eyeliner() {
    if (id_on == "eyeliner") {
        return;
    }
    reset_time(id_on);
    select_time('eyeliner');
    id_on = 'eyeliner';
    $('#eyeliner_placement').css('right', '-68px');
}

function switch_eyeshadow() {
    if (id_on == "eyeshadow")
        return;

    reset_time(id_on);
    select_time('eyeshadow');
    id_on='eyeshadow';
    show('blank_eyeshadow_placement');
    // hide('eyeshadow_placement');
    $('#eyeshadow_placement').css('background-color', tab_selected_bgcolor);
    // $('.placement_off').css('opacity', '1.0');
    // $('#eyeshadow_placement').animate({width: 'show'}, 350).css('display', 'inline-flex');
    $('#eyeshadow_placement').css('right', '-68px'); //animate({'right': '-68px'}, 350);
}

function switch_compare() {
    if (id_on == "compare")
        return;
    addToCompare();
}

function gen_makeup_param(category, sku, colorId, placement, conn, add_lower) {
    if(typeof(conn)=="undefined") {
        conn = "=";
    }

    // for 2d
    if(category=="lash") {
        var imgName = makeoverobject[category][sku][colorId]['imgname'];
        var isBottom = makeoverobject[category][sku][colorId]['isbottomlash'];
        return "lash_default"+conn+imgName+","+isBottom;
    }

    var p = makeoverobject[category][sku][colorId];
    var x=10;
    var y=p['rgb'];
    var sp,gl;
    var myrgb=y.split(',');

    if("finish" in p && p['finish'].toLowerCase()=="shimmer") {
        sp = 4;
    } else {
        sp = parseInt(p['glitter'])/50;
    }

    if("finish" in p && p['finish'].toLowerCase()=="matte") {
        gl = 0;
    } else {
        gl = 2.5;
    }
    gl=gl*0.5;

    if(category=="cheek") {
        placement = p['cheekcategory'].toLowerCase();
    }
    var t=category+"_"+placement+conn;

    switch(category) {
        case 'cheek':
            t+=(x)+","+y+","+gl*0.1+","+sp*0.25;
            break;
        case 'eyeshadow':
            t+=(x*0.4)+","+y+","+gl*0.1+","+sp*0.25;
            break;
        case 'lips':
            t+=(x*0.7)+","+y+","+gl*-0.1+","+sp*0.15;
            break;
        case 'eyeliner':
            t+=(x*0.4)+","+y+","+gl*0.1+","+sp*0.25;
            break;
        default:
            break;
    }

    if (category == "eyeliner") {
        if (add_lower === true)
            t += ",1";
        else
            t += ",0";
    }

    return t;
}

var currentlyWornProducts = [];

function updateCurrentProducts() {
	if (makeoverChange.change == 0)
		return;

	if (makeoverChange.category != '' && makeoverChange.placement != '') {
		var category = makeoverChange.category;
		var placement = makeoverChange.placement;
		var prodstr = currentMakeover["products"][category][placement];
		var parent_id = 'wearingSection_' + category + '_' + placement + '_placeholder';
		var prodstr = currentMakeover["products"][category][placement];
	    if(prodstr == -1) {
	        if(document.getElementById('placement_'+category+'_'+placement+'_bg') && (category !== 'eyeliner')) {
	            document.getElementById('placement_'+category+'_'+placement+'_bg').style.backgroundColor = "#aaa";
	        }
	    }
	    else {
	    	var parts = prodstr.split("_");
		    var sku = parts[1];
		    var colorId = parts[2];

		    if(document.getElementById('placement_'+category+'_'+placement + '_bg') && (category !== 'eyeliner')) {
            var rgb = makeoverobject[category][sku][colorId]['rgb'];
            document.getElementById('placement_'+category+'_'+placement +'_bg').style.backgroundColor = "rgb("+rgb+")";
	        }
	        if(document.getElementById('placement_'+category+'_'+placement) && (category === 'eyeliner')) {
	            var rgb = makeoverobject[category][sku][colorId]['rgb'];
	        }
	        if (category === 'eyeliner') {
	            var rgb = makeoverobject[category][sku][colorId]['rgb'];
	            if (currentMakeover['eyeliner_lower_on']) {
	                document.getElementById(placement+'_lower').style.backgroundColor = "rgb("+rgb+")";
	                document.getElementById(placement+'_lower').style.opacity = 1;
	            } else {
	                document.getElementById(placement+'_background').style.backgroundColor = "rgb("+rgb+")";
	                document.getElementById(placement+'_background').style.opacity = 1;
	            }
	        }

	        // remove the previous one
		    var product = document.getElementById(category+'_'+placement+'_product_wrapper');
		    if (product) {
		    	product.parentNode.removeChild(product);
		   	}

	        currentlyWornProducts.push(category+"_"+sku+"_"+colorId+"_"+placement);
	        var a = genProductUsed(category, sku, colorId, placement);
	        document.getElementById(parent_id).appendChild(a);
	        show(parent_id);
	    }
        updateCurrentProduct(category);
    }
    else if (makeoverChange.change == 1) {

        // call updateCurrentProduct to remove current product
        for (var category in currentMakeover['products'])
            updateCurrentProduct(category);
    }

    // remove all products as specified by currentMakeover
    var children = $('#wearingSection').children();
    for (var i = 0; i < children.length; ++i) {
    	var split = children[i].id.split('_');
    	var category = split[1];
    	var placement = split[2];
    	if (currentMakeover['products'][category][placement] == -1) {
    		$(children[i]).hide();
    		children[i].innerHTML = '';
    	}
    	else {
    		var prodstr = currentMakeover["products"][category][placement];
    		if (prodstr != -1) {
	    		var parts = prodstr.split("_");
			    var sku = parts[1];
			    var colorId = parts[2];

			    // favoriting
		        var fid = category + '_' + sku + '_' + colorId + '_wearing_favIcon';
		        var fav_icon = $('.'+fid);
		        if (myFavorites[category][sku+"_"+colorId] === 1)
		        	$(fav_icon).css('background', 'black');
		        else
		        	$(fav_icon).css('background', 'white');
	    	}
    	}
    }

    // favoriting in right panel
    var cur_product_icons = $('.c40');
    for (var i = 0; i < cur_product_icons.length; ++i) {
    	var parts = cur_product_icons[i].id.split('_');
    	var category = parts[0];
	    var sku = parts[1];
	    var colorId = parts[2];

	    if (myFavorites[category][sku+"_"+colorId] === 1)
	    	$(cur_product_icons[i]).css('background', 'black');
	    else
	    	$(cur_product_icons[i]).css('background', 'white');
    }

    makeoverChange.change = 0;
    makeoverChange.category = '';
    makeoverChange.placement = '';
}

function initializeProductPlaceholders() {
	currentlyWornProducts = [];
    document.getElementById('wearingSection').innerHTML="";
    for(var category in currentMakeover["products"]) {
        for(var placement in currentMakeover["products"][category]) {
        	var wrapper = document.createElement('div');
        	wrapper.className = 'mid_section_product_container_placeholder';
        	wrapper.id = 'wearingSection_' + category + '_' + placement + '_placeholder';
        	document.getElementById('wearingSection').appendChild(wrapper);
        }
    }
}

function updateCurrentProduct(category) {
    if(currentProduct[category] !="" && currentProduct[category]!=-1) {
        var cp = currentProduct[category].split("_");
        setCurrent(cp[0], cp[1], cp[2]);
    } else {
        document.getElementById(category+"_currentProduct").innerHTML = "";
        // fade out
        //$('#' + category+'_currentProduct').animate({opacity:0.0}, 200, function() { document.getElementById(category+"_currentProduct").innerHTML = "" });
    }
}

function removeProduct(pid) {
    var parts = pid.split("_");
    var category = parts[0];
    var sku = parts[1];
    var colorId = parts[2];
    var placement = parts[3];

    // removeInstanceOfShade(category + '_' + sku + '_' + colorId + '_shade_remove');
    // var prodid=category+"_"+sku+"_"+colorId;

    //only remove selected placement
    currentMakeover['products'][category][placement] = -1;

    switch(category) {
        case "lips":
            currentmakeover_live['lipcolor'] = {};
            break;
        case "lash":
            currentmakeover_live['lash'] = {};
            break;
        case "cheek":
            currentmakeover_live['cheek'] = {};
        case "eyeshadow":
            switch (placement) {
                case "lid":
                    currentmakeover_live['eyeshadow_2'] = {};
                    break;
                case "crease" :
                    currentmakeover_live['eyeshadow_1'] = {};
                    break;
                case "outercorner":
                    currentmakeover_live['eyeshadow_0'] = {};
                    break;
            }
            break;
    }



    for(var c in currentPlacements) {
        if(currentMakeover['products'][c][currentPlacements[c]] != ""
        && currentMakeover['products'][c][currentPlacements[c]] != -1) {
            var parts = currentMakeover['products'][c][currentPlacements[c]].split("_");
            currentProduct[c] = parts[0]+"_"+parts[1]+"_"+parts[2];
        } else {
            currentProduct[c] = "";
        }
    }

    if (category === 'eyeshadow') {
        if (currentPlacements['eyeshadow'] === placement) {
            removeInstanceOfShade(category + '_' + sku + '_' + colorId + '_shade_remove');
        }
        $('#placement_eyeshadow_' + placement + '_bg').css('background-color', 'rgb(170, 170, 170)');
    } else {
        removeInstanceOfShade(category + '_' + sku + '_' + colorId + '_shade_remove');
    }

    var remid = category + '_' + sku + '_' + colorId + '_shade_remove';

    updateMakeoverChange('', '', 1);
    apply();
    removing = 0;
    adjustFooter();
}

function updateMakeoverChange(category, placement, change) {
	makeoverChange.placement = placement;
    makeoverChange.category = category;
    makeoverChange.change = change;
}


function elementsPerRow(container, category) {
    return Math.floor(container.clientWidth / shade_dims[category][1]);
}

function surpriseMe() {
    trackEvent("surprise me");
    var container = document.getElementById(currentCategory+"_shade_content");
    var num_shades = current_shades[currentCategory].length;

    if (num_shades <= 0)
    	return;

    var n = Math.floor(Math.random() * num_shades);
    n = Math.min(n, num_shades-1);
    selectShade(current_shades[currentCategory][n].id, 0);
}

function check(divid) {
    var div = document.getElementById(divid);
    var parts = div.className.split("_");
    parts[2] = "1";
    document.getElementById(divid).className=parts.join("_");
}

function uncheck(divid) {
    var div = document.getElementById(divid);
    if(div == null) {
        console.log("error: missing div with id "+divid);
    }
    var parts = div.className.split("_");
    parts[2] = "0";
    document.getElementById(divid).className=parts.join("_");
}

function toggleCheckBox(divid) {
    var div = document.getElementById(divid);
    var parts = div.className.split("_");
    if(parts[2] == "0") {
        check(divid);
        return 1;
    } else {
        uncheck(divid)
        return 0;
    }
}

function isChecked(divid) {
    var div = document.getElementById(divid);
    if (!div) {
        return 0;
    }
    var parts = div.className.split("_");
    if(parts[2] == "1") {
        return 1;
    } else {
        return 0;
    }
}

function checkFilter(divid) {
    var parts = divid.split("_");
    filters['currentFilters'][parts[2]][parts[1]] = toggleCheckBox(divid);
    playFilters();
}

function checkFinish(divid) {
    var checked = toggleCheckBox(divid);
    addSummaryText(checked, divid);
    playFilters();
}

function checkPalette(divid) {
    var checked = toggleCheckBox(divid);
    playFilters();
}

function checkBrand(divid) {
    var checked = toggleCheckBox(divid);
    addSummaryText(checked, divid);
    playFilters();
}

function clearSummaryTexts(category) {
    $('#'+category+'_brand_txt').empty();
    $('#'+category+'_finish_txt').empty();
    $('#'+category+'_category_txt').empty();
    $('#'+category+'_formulation_txt').empty();
    handleSummaries();
}

function addSummaryText(checked, divid) {
    var parts = divid.split("_");
    var parent_id = parts[0]+"_"+parts[1]+"_txt";
    var summary_section = $('#' + parent_id).parent();
    if(checked==1) {
        s = document.createElement("div");
        s.id="display_"+parts[2];
        s.className = "sing_brand";
        s.innerHTML = document.getElementById(parts[2]+"_txt").innerHTML + "  ";
        document.getElementById(parent_id).appendChild(s);
        var all_text = $('#' + parent_id).children();

        // add comma to previous element
        if (all_text.length - 2 >= 0) {
          var prev = all_text[all_text.length - 2];
          prev.innerHTML += ",";
        }

        if (parts[1] == 'category') {
            $('#' + parent_id).css('padding-top', 7);
            $('#category_title_wrapper').css('padding-bottom', 20);
        }

        $(summary_section).show();
    } else {
        var item = document.getElementById("display_"+parts[2]);
        item.parentNode.removeChild(item);

        var all_text = $('#' + parent_id).children();

        // remove comma from last element
        if (all_text.length - 1 >= 0) {
          var prev = all_text[all_text.length - 1];
          var str = prev.innerHTML;
          if (str[str.length-1] == ',')
            prev.innerHTML = str.substr(0, str.length-1);
        }
        else if (parts[1] == 'category') {
          $('#' + parent_id).css('padding-top', 0);
          $('#category_title_wrapper').css('padding-bottom', 13.5);
        }

        // if empty, hide
        if ($('#'+parent_id).contents().length == 0)
        	$(summary_section).hide();
    }
}

function checkColorIQ(divid) {
    var v0 = ($("#ciq0").val() === "");
    var v1 = ($("#ciq1").val() === "");
    var v2 = ($("#ciq2").val() === "");
    var v3 = ($("#ciq3").val() === "");

    var div = document.getElementById(divid);
    var parts = div.className.split("_");

    if (!(v0 || v1 || v2 || v3) && parts[2] == "0") {

        var checked = toggleCheckBox(divid);
        playFilters();
    } else {
        uncheck(divid);
    }
/*
    var div = document.getElementById(divid);
    var parts = div.className.split("_");
    if(parts[2] == "0") {
        check(divid);
        return 1;
    } else {
        uncheck(divid)
        return 0;
    }*/
}

function fillCIQ() {
    for(var c in allFilters['colorIQ']) {
        for(var sku in makeoverobject[c]) {
            for(var colorId in makeoverobject[c][sku]) {
                for(var i=0;i<makeoverobject[c][sku][colorId]['ciq'].length;i++) {
                    var zone = makeoverobject[c][sku][colorId]['ciq'][i];
                    if(typeof allFilters['colorIQ'][c][zone] == "undefined") {
                        allFilters['colorIQ'][c][zone] = {};
                    }
                    if(typeof allFilters['colorIQ'][c][zone][sku] == "undefined") {
                        allFilters['colorIQ'][c][zone][sku] = [];
                    }
                    allFilters['colorIQ'][c][zone][sku].push(colorId);
                }
            }
        }
    }
}

function fillBrands() {
    for(var c in makeoverobject) {
        allFilters['brand'][c] = {};
        for(var i=0;i<alphabet.length;i++) {
            allFilters['brand'][c][alphabet[i]] = {};
        }
        for(var sku in makeoverobject[c]) {
            for(var color in makeoverobject[c][sku]) {
                var brand = makeoverobject[c][sku][color]['brand'];
                if(brand=="") {
                    continue;
                }

                var firstLetter = brand.charAt(0).toLowerCase();
                if(typeof(allFilters['brand'][c][firstLetter][brand]) == "undefined") {
                    allFilters['brand'][c][firstLetter][brand]=[];
                }
                allFilters['brand'][c][firstLetter][brand].push(sku);
                break;
            }
        }
    }
}

function populateFilterBrands() {
    var container="";
    var div="";
    var txt="";
    var check="";
    for(var category in allFilters['brand']) {
        if(!document.getElementById("filter_"+category+'_brand')) {
            continue;
        }
        container = document.getElementById("filter_"+category+'_brand');
        for(var letter in allFilters['brand'][category]) {
            if(getObjectSize(allFilters['brand'][category][letter]) > 0) {
                div=document.createElement("div");
                div.className = "c64";
                //div.style="float:left;width:100%;height:30px;background:#dddddd;";
                txt=document.createElement("div");
                txt.className = "c65";
                //txt.style="float:left;font-size:16px;font-family:HelveticaNeue-Bold;margin-left:22px;line-height:30px;";
                txt.innerHTML=letter.toUpperCase();
                div.appendChild(txt);
                container.appendChild(div);

                for(var b in allFilters['brand'][category][letter]) {
                    div = document.createElement("div");
                    div.className = "c66";
                    //div.style="float:left;width:100%;height:36px;background:#eeeeee;";
                    check = document.createElement("div");
                    check.id = category+"_brand_"+b.split(" ").join("").toLowerCase();
                    check.className="small_checkmarkbrand_0";
                    check.style.margin="12px 20px 12px 22px;";
                    check.onclick = function() { checkBrand(this.id); };
                    div.appendChild(check);
                    txt = document.createElement("div");
                    txt.className = "c67";
                    txt.id=b.split(" ").join("").toLowerCase() + "_txt";
                    //txt.style="float:left;font-size:14px;font-family:HelveticaNeue;line-height:36px;";
                    txt.innerHTML = b;
                    div.appendChild(txt);
                    container.appendChild(div);
                }
            }
        }
    }
}

function manFilter(id) {
    var category = currentCategory;
    var parts = id.split("_");

    for(var filter in allFilters) {
        hide(filter+"_content");
        hide(filter+"_title");
        hide(filter+'_title_wrapper');

        if(typeof allFilters[filter][category] != "undefined") {
            show(filter+"_title");
            show(filter+"_title_wrapper");
        }
        // If the current filter exists for the currentCategory,
        // show that filter. For example, lips have brand so
        // the brand will appear in the lips filter
    }
    hide(id);
    hide(id+'_wrapper');
    if(parts[1] == "title") {
        show(parts[0]+"_content");
    } else {
        show(parts[0]+"_title");
        show(parts[0]+"_title_wrapper");
    }
}

function prepareFilterPopup(category) {
    for(var filter in allFilters) {
        hide(filter+"_content");
        hide(filter+'_title');
        hide(filter+"_title_wrapper");

        for(var c in allFilters[filter]) {
            if(c!=category) {
                hide(c+"_numResult");
                hide(c+"_myCIQ");
                hide("filter_"+c+"_"+filter);
                hide(c+"_filter_popup_title_text");
            } else {
                show(c+"_numResult");
                show(c+"_myCIQ");
                show("filter_"+c+"_"+filter);
                show(c+"_filter_popup_title_text");
                if(filter=="colorIQ") {
                    document.getElementById("filter_"+c+"_"+filter).style.display="inline-block";
                }
                hide(filter+"_content");
                show(filter+'_title');
                show(filter+"_title_wrapper");
            }
        }
    }

    // spacing adjustments depending on which filter comes up
    if (category == "cheek") {
    	$('#category_content').css('padding-top', 13.5);
    	$('#category_title_wrapper').css('padding-top', 13.5);
    	$('#palette_title').css('height', 46);
    }
    else {
    	$('#category_content').css('padding-top', 23);
    	$('#category_title_wrapper').css('padding-top', 23);
    	$('#palette_title').css('height', 53);
    }

    if (category == "eyeliner") {
        show('formulation_border_bottom');
        hide('brand_border_bottom');
    }
    else {
        show('brand_border_bottom');
        hide('formulation_border_bottom');
    }

    var brand_summary_txt = $('#' + category + '_brand_txt');
    if (category != "cheek")
        $('#brand_title_wrapper').css('padding-bottom', 20);
    else
        $('#brand_title_wrapper').css('padding-bottom', 13.5);

    if ($('#brand_content').css('display') != 'none' || $('#category_content').css('display') != 'none')
        $('#filter_bottom_section').css('margin-top', 20);
    else
        $('#filter_bottom_section').css('margin-top', 5);

    handleSummaries();
}

function clearAllFilters(category) {
    var category = (typeof category != "undefined") ? category : currentCategory;
    clearSummaryTexts(category);
    for(var filter in allFilters) {
        if(typeof allFilters[filter][category] !== "undefined") {
            if(filter == "family") {
                filters['currentFilters']['family'][category] = [];
                filters['appliedFilters']['family'][category] = [];
                for(var i=0;i<allFilters['family'][category].length;i++) {
                    var family = removeSpaces(allFilters['family'][category][i]).toLowerCase();
                    unselectFamily(category, family);
                }
            } else if(filter == "palette" || filter == "finish" || filter=="category") {
                for(var i=0;i<allFilters[filter][category].length;i++) {
                    var keyword = removeSpaces(allFilters[filter][category][i]).toLowerCase();
                    uncheck(category+"_"+filter+"_"+keyword);
                }
            } else if(filter == "brand") {
                for(var l in allFilters[filter][category]) {
                    for(var brand in allFilters[filter][category][l]) {
                        uncheck(category+"_"+filter+"_"+brand.split(" ").join("").toLowerCase());
                    }
                }
            } else if(filter == "colorIQ" || filter == "myFavorites" || filter == "justArrived" || filter == "bestSellers") {
                uncheck("filter_"+category+"_"+filter);
            } else if(filter == "searchString") {
                document.getElementById(category+"_textsearch").value = "";
                filters['currentFilters']['searchString'][category] = "";
                filters['appliedFilters']['searchString'][category] = "";
            } else {
                uncheck(category+"_"+filter);
            }
        }
    }

    $("#"+category+"_brand_txt").empty();
    $('.colorIQinput').val('');
    playFilters();
    applyFilters(undefined,undefined);
}

function showFilterPopup() {
    switch(currentCategory) {
        case "lips":
        case "lash":
        case "cheek":
            trackEvent("filters:"+currentCategory);
            break;
        case "eyeshadow":
            trackEvent("filters:shadows");
            break;
        case "eyeliner":
            trackEvent("filters:liner");
            break;

    }

    $('.brand_txt').hide();
    $('#' + currentCategory + '_brand_txt').show();

    // different behaviours of category header depending if it's cheek
    var txt1 = document.getElementById('txt233');
    var txt2 = document.getElementById('txt233_0');
    if (currentCategory == "cheek") {
        if (lang === 'fr') {
            txt1.innerHTML = toLang("Cheek", 'en', 'fr');
            txt2.innerHTML = toLang("Cheek", 'en', 'fr');
        } else {
            txt1.innerHTML = "Cheek";
            txt2.innerHTML = "Cheek";
        }

        var colorstr = "8px solid rgb(238, 238, 238)";
        document.getElementById('category_title_wrapper').style.borderBottom = colorstr;
        document.getElementById('category_content').style.borderBottom = colorstr;
    } else {
        if (lang === 'fr') {
            txt1.innerHTML = toLang("Category", 'en', 'fr');
            txt2.innerHTML = toLang("Category", 'en', 'fr');
        } else {
            txt1.innerHTML = "Category";
            txt2.innerHTML = "Category";
        }
        document.getElementById('category_title_wrapper').style.borderBottom = "hidden";
        document.getElementById('category_content').style.borderBottom = "hidden";
    }
    var num_results = parseInt(document.getElementById(currentCategory + '_numResult').innerHTML);
    if (num_results < numNonFilteredResults[currentCategory])
        $('#txt127').css({'opacity': 1.0, 'cursor':'pointer', 'pointer-events':'all'});
    else
        $('#txt127').css({'opacity': 0.0, 'cursor':'default', 'pointer-events':'none'});

    // palette comes before brand if category is eyeshadow, so need conditional swap
    var prev = $('#brand_title_wrapper').prev();
    if ($('#brand_title_wrapper').isBefore('#palette_title') || $('#brand_title_wrapper').isAfter('#palette_title')) {
        if (currentCategory == "eyeshadow") {
            $('#palette_title').insertAfter(prev);
            $('.palette_title').css('border-bottom', '1px solid rgb(238, 238, 238)');
        }
        else {
            $('#palette_title').insertAfter('#brand_bottom_border');
            $('.palette_title').css('border-bottom', '8px solid rgb(238, 238, 238)');
        }
    }

    show('filters');
}

function handleSummaries() {
	for (var category in makeoverobject) {
	 	hide('filter_'+category+'_display');
	    hide('filter_'+category+"_display_category");
	    hide('filter_'+category+"_display_formulation");
        hide('filter_'+category+"_display_finish");
	}

	if ($('#'+currentCategory+'_brand_txt').contents().length > 0)
	    show('filter_'+currentCategory+'_display');
	if ($('#'+currentCategory+'_category_txt').contents().length > 0)
	    show('filter_'+currentCategory+"_display_category");
	if ($('#'+currentCategory+'_formulation_txt').contents().length > 0)
	    show('filter_'+currentCategory+"_display_formulation");
    if ($('#'+currentCategory+'_finish_txt').contents().length > 0)
        show('filter_'+currentCategory+"_display_finish");

}

//var prevB = "";
function displaySummaries() {
    /*if(prevB!=""){
        hide(prevB);
        hide(prevB+"_category");
        hide(prevB+"_formulation");
    }*/
    show('filter_'+currentCategory+'_display');
    show('filter_'+currentCategory+"_display_category");
    show('filter_'+currentCategory+"_display_formulation");
    //prevB = 'filter_'+currentCategory+'_display';
}


function playFilters(category) {
    var category = (typeof category !== "undefined") ? category : currentCategory;
    updateFilters('currentFilters',category,1);
    var n = getNumResult(category);

    if(lang=="fr"){
        if(n==1) {
            document.getElementById(category+"_numResult").innerHTML = n+" Résultat";
        } else {
            document.getElementById(category+"_numResult").innerHTML = n+" Résultats";
        }
    } else {
        if(n==1) {
            document.getElementById(category+"_numResult").innerHTML = n+" result";
        } else {
            document.getElementById(category+"_numResult").innerHTML = n+" results";
        }
    }

    var numResults = getNumResult(category);
    if (n < numNonFilteredResults[category])
        $('#txt127').css({'opacity': 1.0, 'cursor':'pointer', 'pointer-events':'all'});
    else
        $('#txt127').css({'opacity': 0.0, 'cursor':'default', 'pointer-events':'none'});
}

function applyFilters(category,notrack) {
    var category = (typeof category !== "undefined") ? category : currentCategory;
    updateFilters('appliedFilters',category,notrack);

    fade_out('filters');
    if(filterApplied[category]==0) {
        //document.getElementById('btnFilter_img').src = "res/icon_filter.png";
        hide('btnFilter_clearAll');
    } else {
        //document.getElementById('btnFilter_img').src = "res/icon_filter_on.png";
        appendToOnFilters();
        show('btnFilter_clearAll');
    }
    filterShade();
}


var filterApplied= {
"lips": 0,
"lash": 0,
"eyeshadow": 0,
"cheek":0,
"eyeliner":0
};

function updateFilters(filterUsed,category,notrack) {
    if(typeof notrack == "undefined") {
        notrack = 0;
    }

    filterApplied[category]=0;
    var category = (typeof category !== "undefined") ? category : currentCategory;
    var currentFilters = filters[filterUsed];

    var tracking_pm = [];

    for(var filter in allFilters) {
        if(typeof allFilters[filter][category] !== "undefined") {
            if(filter == "family") {
                if(filters['appliedFilters']['family'][category].length>0) {
                    filterApplied[category]=1;
                }
            } else if(filter == "finish" || filter == "category") {
                currentFilters[filter][category] = [];
                for(var i=0;i<allFilters[filter][category].length;i++) {
                	var keyword = removeSpaces(allFilters[filter][category][i]).toLowerCase();
                    if(isChecked(category+"_"+filter+"_"+keyword)) {
                        currentFilters[filter][category].push(keyword);
                        filterApplied[category]=1;
                    }
                }
                var tp2 = filter+"=";
                if(currentFilters[filter][category].length>0) {
                    tp2 += currentFilters[filter][category].join("|");
                    tracking_pm.push(tp2);
                } else {
                    tp2 += allFilters[filter][category].join("|");
                }
            } else if(filter == "brand") {
                currentFilters[filter][category] = [];
                var fullnames = [];
                var fulllist = [];
                for(var l in allFilters[filter][category]) {
                    for(var brand in allFilters[filter][category][l]) {
                        var b=brand.split(" ").join("").toLowerCase();
                        fulllist.push(brand);
                        if(isChecked(category+"_"+filter+"_"+b)) {
                            currentFilters[filter][category].push(b);
                            fullnames.push(brand);
                            filterApplied[category]=1;
                        }
                    }
                }
                var tp2 = "brand=";
                if(currentFilters[filter][category].length>0) {
                    tp2 += fullnames.join("|");
                    tracking_pm.push(tp2);
                } else {
                    tp2 += fulllist.join("|");
                }
                //tracking_pm.push(tp2);
            } else if (filter == "formulation") {
                currentFilters[filter][category] = [];
                for (var i = 0; i < allFilters[filter][category].length; ++i) {
                    var keyword = allFilters[filter][category][i].split(" ").join("").toLowerCase();
                    if(isChecked(category+'_'+filter+'_'+keyword)) {
                        currentFilters[filter][category].push(keyword);
                        filterApplied[category]=1;
                    }
                }
            }
            else if(filter == "colorIQ") {
                var enabled = document.getElementById("filter_"+category+"_colorIQ").className;
                enabled = enabled.split("_");
                enabled = enabled[2];
                enabled = parseInt(enabled);

                currentFilters['colorIQ'][category][0] = enabled;

                var userCIQ = document.getElementById('ciq0').value
                            + document.getElementById('ciq1').value
                            + document.getElementById('ciq2').value
                            + document.getElementById('ciq3').value;
                    userCIQ = userCIQ.trim().split(" ").join("").toUpperCase();

                currentFilters['colorIQ'][category][1] = userCIQ;

                if(enabled && typeof ciqobject[userCIQ] != "undefined") {
                    document.getElementById(category+'_myCIQ').innerHTML = ": "+userCIQ;
                    tracking_pm.push("coloriq="+userCIQ);
                    filterApplied[category]=1;
                } else {
                    document.getElementById(category+'_myCIQ').innerHTML = "";
                }
            } else if(filter == "searchString") {
                var searchString = document.getElementById(category+"_textsearch").value;
                searchString = searchString.trim().toLowerCase().split(" ").join("");
                if(searchString != "") {
                    currentFilters[filter][category] = searchString;
                    filterApplied[category]=1;
                }
            } else if (filter === 'palette')  {
                currentFilters[filter][category] = [];

                if (isChecked(category+"_"+filter+"_"+allFilters[filter][category][0]) && isChecked(category+"_"+filter+"_"+allFilters[filter][category][1])) {
                    currentFilters[filter][category].push(allFilters[filter][category][0]);
                    currentFilters[filter][category].push(allFilters[filter][category][1]);
                    filterApplied[category]=1;
                } else if (isChecked(category+"_"+filter+"_"+allFilters[filter][category][0])) {
                    currentFilters[filter][category].push(allFilters[filter][category][0]);
                    filterApplied[category]=1;
                    var tp2 = filter+"=yes";
                    tracking_pm.push(tp2);
                } else if (isChecked(category+"_"+filter+"_"+allFilters[filter][category][1])) {
                    currentFilters[filter][category].push(allFilters[filter][category][1]);
                    filterApplied[category]=1;
                    var tp2 = filter+"=no";
                    tracking_pm.push(tp2);
                }

            } else {
                if(isChecked("filter_"+category+"_"+filter)) {
                    currentFilters[filter][category] = 1;
                    tracking_pm.push(filter+"=yes");
                    filterApplied[category]=1;
                } else {
                    currentFilters[filter][category] = 0;
                }
            }
        }
    }

    if(tracking_pm.length > 0 && notrack == 0) {
        var tp2string = tracking_pm.join(",");
        trackEventFilter(tp2string);
    }
}

function favorite(fid) {
    var parts = fid.split("_");
    var category = parts[0];
    var sku = parts[1];
    var colorId = parts[2];
    if(typeof myFavorites[category][sku+"_"+colorId] != "undefined" && myFavorites[category][sku+"_"+colorId] == 1) {
        myFavorites[category][sku+"_"+colorId] = 0;
        trackEvent("unfavorites:"+sku);
    } else {
        trackEvent("favorites:"+sku);
        myFavorites[category][sku+"_"+colorId] = 1;
    }
    updateMakeoverChange('', '', 2);
    updateCurrentProducts();

    if ($('tab_compare').attr('display') == 'none')
        genCompareProducts(currentCompareIndex);
}

var compare = [-1, -1, -1, -1];

function productSearch(e) {
    if (!e)
        return;

    var keyCode = e.keyCode || e.which;
    var newSearch = document.getElementById(currentCategory+'_textsearch').value;
    newSearch = newSearch.trim().toLowerCase().split(" ").join("");
    if(newSearch == filters['appliedFilters']['searchString'][currentCategory]) {
        return;
    } else {
        filters['currentFilters']['searchString'][currentCategory] = newSearch;
        filters['appliedFilters']['searchString'][currentCategory] = newSearch;
        playFilters(undefined);
        trackEvent("search:"+currentCategory+":"+document.getElementById(currentCategory+'_textsearch').value);
        applyFilters(undefined,1);
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
            playFilters(undefined);
            trackEvent("search:"+currentCategory+":"+document.getElementById(currentCategory+'_textsearch').value);
            applyFilters(undefined,1);
        }
    }
    */
}

function handleProductType(id){

    var changed = (id.split('_')[0] != currStat.currProductType);

    if (id == "lips_product_tab"){
        $(containerId+"#lash_product_tab").removeClass("option_tab_selected");
        $(containerId+"#lips_product_tab").addClass("option_tab_selected");
        $(".lash_family_container").hide();
        $(".color_family_container").fadeIn();
        $(".shade_search_txt").html("<?=$txtarray['txt107'][$countrycode]?>");
        $(".shade_search_input").attr("placeholder", "<?=$txtarray['txt118'][$countrycode]?>");
        currStat.currProductType = "lips";
        currFilter.category = "lips";
    }
    else{
        $(containerId+"#lips_product_tab").removeClass("option_tab_selected");
        $(containerId+"#lash_product_tab").addClass("option_tab_selected");
        $(".color_family_container").hide();
        $(".lash_family_container").fadeIn();
        $(".shade_search_txt").html("<?=$txtarray['txt80'][$countrycode]?>");
        $(".shade_search_input").attr("placeholder", "<?=$txtarray['txt119'][$countrycode]?>");
        currStat.currProductType = "lash";
        currFilter.category = "lash";
    }
    resetFilter(true);

    // switch product info position
    for (var i=0; i<editContainers.length && changed && currStat.currShade.lips && currStat.currShade.lash; i++){
        var lipsHtml = $("."+editContainers[i]+" #lips_product").html();
        var lashHtml = $("."+editContainers[i]+" #lash_product").html();
        $("."+editContainers[i]+" #lips_product").html(lashHtml);
        $("."+editContainers[i]+" #lash_product").html(lipsHtml);

        $("."+editContainers[i]+" #lash_product").addClass("originid");
        $("."+editContainers[i]+" #lips_product").attr('id', 'lash_product');
        $("."+editContainers[i]+" .originid").attr('id', 'lips_product');
        $(".originid").removeClass("originid");
    }
}

// convert to format needed to use makeupModule API
// makeover is an object (not an array like in instant looks)
function makeoverToEffectsPTO(makeover, intensity) {
    var effects_dict = {};
    for(var category in makeover['products']) {
        for(var placement in makeover['products'][category]) {
            var prod = makeover['products'][category][placement];

            if(prod==-1 || prod=="") {
                continue;
            }

            prod = prod.split("_");
            var sku = prod[1];
            var colorId = prod[2];
            var add_lower = makeover.eyeliner_lower_on;

            var p = makeoverobject[category][sku][colorId];
            var mfcategory = p['mfcategory'];
            var cate = category;
            var x = 10;

            addProductToEffects(p, placement, category, effects_dict, intensity, makeover.eyeliner_lower_on);
        }
    }

    var effects_array = [];
    for (type in effects_dict)
        effects_array.push(effects_dict[type]);
    return effects_array;
}

var onFilters = []; // Stores all filters that are on

function removeOnFilters() {
	var index = onFilters.indexOf(currentCategory);
    if (index > -1) {
        onFilters.splice(index, 1);
    }
}

function clearAllSelectedShades() {
    /* for (var i = 0; i < currentlySelectedShades.length; i++) {
         removeInstanceOfShadeNoApply(currentlySelectedShades[i]+"_remove");
    } */

    for (var i = 0; i < currentlyWornProducts.length; i++) {
        removeProductNoApply(currentlyWornProducts[i]);
    }

    $('.eyeliner_background').css('background-color', 'rgb(170, 170, 170)');

    removing = 0;
    currentlySelectedShades = [];

    $('.palette_on').removeClass('palette_on').addClass('palette_off');

    apply();
    adjustFooter();

    trackEvent('remove makeup');
}

function appendToOnFilters() {
	onFilters.push(currentCategory);
	if ($.inArray(currentCategory, onFilters) === -1) {
		onFilters.push(currentCategory);
	}
}

function removeProductNoApply(pid) {
/*    var parts = pid.split("_");
    var category = parts[0];
    var sku = parts[1];
    var colorId = parts[2];
    var placement = parts[3];

    var prodid=category+"_"+sku+"_"+colorId;

    //only remove selected placement
    currentMakeover['products'][category][placement] = -1;

    switch(category) {
        case "lips":
            currentmakeover_live['lipcolor'] = {};
            break;
        case "lash":
            currentmakeover_live['lash'] = {};
            break;
        case "cheek":
            currentmakeover_live['cheek'] = {};
        case "eyeshadow":
            switch (placement) {
                case "lid":
                    currentmakeover_live['eyeshadow_2'] = {};
                    break;
                case "crease" :
                    currentmakeover_live['eyeshadow_1'] = {};
                    break;
                case "outercorner":
                    currentmakeover_live['eyeshadow_0'] = {};
                    break;
            }
            break;
    }

    for(var category in currentPlacements) {
        if(currentMakeover['products'][category][
        currentPlacements[category]] != ""
        && currentMakeover['products'][category][currentPlacements[category]] != -1) {
            var parts = currentMakeover['products'][category][currentPlacements[category]].split("_");
            currentProduct[category] = parts[0]+"_"+parts[1]+"_"+parts[2];
        } else {
            currentProduct[category] = "";
        }
    }

    updateMakeoverChange('', '', 1); */

    var parts = pid.split("_");
    var category = parts[0];
    var sku = parts[1];
    var colorId = parts[2];
    var placement = parts[3];

    // removeInstanceOfShade(category + '_' + sku + '_' + colorId + '_shade_remove');
    // var prodid=category+"_"+sku+"_"+colorId;

    //only remove selected placement
    currentMakeover['products'][category][placement] = -1;

    switch(category) {
        case "lips":
            currentmakeover_live['lipcolor'] = {};
            break;
        case "lash":
            currentmakeover_live['lash'] = {};
            break;
        case "cheek":
            currentmakeover_live['cheek'] = {};
        case "eyeshadow":
            switch (placement) {
                case "lid":
                    currentmakeover_live['eyeshadow_2'] = {};
                    break;
                case "crease" :
                    currentmakeover_live['eyeshadow_1'] = {};
                    break;
                case "outercorner":
                    currentmakeover_live['eyeshadow_0'] = {};
                    break;
            }
            break;
    }



    for(var c in currentPlacements) {
        if(currentMakeover['products'][c][currentPlacements[c]] != ""
        && currentMakeover['products'][c][currentPlacements[c]] != -1) {
            var parts = currentMakeover['products'][c][currentPlacements[c]].split("_");
            currentProduct[c] = parts[0]+"_"+parts[1]+"_"+parts[2];
        } else {
            currentProduct[c] = "";
        }
    }

    if (category === 'eyeshadow') {
        if (currentPlacements['eyeshadow'] === placement) {
            removeInstanceOfShadeNoApply(category + '_' + sku + '_' + colorId + '_shade_remove');
        }
        $('#placement_eyeshadow_' + placement + '_bg').css('background-color', 'rgb(170, 170, 170)');
    } else {
        removeInstanceOfShadeNoApply(category + '_' + sku + '_' + colorId + '_shade_remove');
    }

    var remid = category + '_' + sku + '_' + colorId + '_shade_remove';

    updateMakeoverChange('', '', 1);
    removing = 0;
    adjustFooter();
}

function removeInstanceOfShadeNoApply(remid) {
    grey_off();
    ttt = prev;
    removing=1;
    var parts = remid.split("_");
    var category = parts[0];
    var sku = parts[1];
    var colorid = parts[2];

    var placement;

    if (category === 'eyeshadow') {
        for (var i = 0; i < placements["eyeshadow"].length; ++i) {
            var p = placements["eyeshadow"][i];
            var state = document.getElementById("placement_" + category + "_" + p).className;
            if (state == "placement_on") {
                placement = p;
                break;
            }
        }
    } else if (category === 'eyeliner') {
        placement = 'natural';
    } else {
        placement = "default"
    }

    var pid = category+"_"+sku+"_"+colorid;
    if (category === 'eyeliner') {
        selectedEyelinerColour = "";
        document.getElementById(pid+"_shade").className = "shade_off";
        eyelinerApplied = false;
        currentMakeover['products']['eyeliner']['natural'] = -1;
        currentMakeover['products']['eyeliner']['smoky'] = -1;
        currentMakeover['products']['eyeliner']['winged'] = -1;
        $('.eyeliner_background').css('background-color', 'rgb(170, 170, 170)');
    }

    if(currentMakeover['products'][category][placement] == pid) {
        currentMakeover['products'][category][placement] = -1;
            switch(placement) {
                case "crease":
                    currentmakeover_live["eyeshadow_1"] = "";
                    break;
                case "lid" :
                    currentmakeover_live["eyeshadow_2"] = "";
                    break;
                case "outercorner":
                    currentmakeover_live["eyeshadow_0"] = "";
                    break;
                case "default":
                    if(category == "lips") {
                        currentmakeover_live['lipcolor'] = "";
                    } else if(category == "lash"){
                        currentmakeover_live['lash'] = "";
                    } else {
                        currentmakeover_live['cheek'] = "";
                    }
                    break;
            }
            document.getElementById(pid+"_shade").className = "shade_off";

            if(document.getElementById(pid+"_palette")) {
                document.getElementById(pid+"_palette").className = "palette_off";
            }
    }
    if(pid == currentProduct[category]) {
        currentProduct[category] = "";
    }
    if(pid == currentShade[category]) {
        currentShade[category] = "";
    }

    if (document.getElementById(pid+"_shade")) {
        document.getElementById(pid+"_shade").className = "shade_off";
        var inner = $('#'+pid+"_shade").children('.c60_on');
        if (inner.length > 0)
            $(inner[0]).attr('class', 'c60');
    }

    var ele = document.getElementById(remid);
    if (ele) {
        ele.parentNode.removeChild(ele);
    }

    updateMakeoverChange(category, placement, 1);
    // updateCurrentProducts();
}

var latestLook = 1;


/*function removeLookCompareBox() {
    $('#corner_' + (latestLook - 1).toString()).css('background-image', 'none');
}*/

/*function addLookCompareBox() {
    // $('#corner_' + latestLook.toString()).css('background-image', "url('res/black_dot.png')");
    if (latestLook <= 4) {
        $('#corner_' + latestLook.toString()).css('background-image', "url('res/black_dot.png')");
        ++latestLook;
    }
}*/
