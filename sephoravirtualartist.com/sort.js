function rgbToHsl(r,g,b) {

    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
        h *= 360;
    }

    return [ h, s, l ];
}


function compareFN(lhs, rhs) {

    var category = lhs['category'];
    var RGB1 = lhs['rgb'].split(",");
    var RGB2 = rhs['rgb'].split(",");

    var HSL1 = rgbToHsl(RGB1[0],RGB1[1],RGB1[2]);
    var HSL2 = rgbToHsl(RGB2[0],RGB2[1],RGB2[2]);

    if(category=="eyeliner") {
        var veryWhiteLeft = 1;
        var veryWhiteRight = 1;
        for(var i=0;i<3;i++) {
            if(RGB1[i] < 200) {
                veryWhiteLeft=0;
            }
            if(RGB2[i] < 200) {
                veryWhiteRight=0;
            }
        }
        if(veryWhiteLeft && !veryWhiteRight) return -1;
        if(veryWhiteRight && !veryWhiteLeft) return 1;
    }

    var hue1 = parseInt( ((HSL1[0] + ((category == "eyeliner")? 190:180)) % 360) / ((category=="eyeliner") ? 8:12) ); 
    var hue2 = parseInt( ((HSL2[0] + ((category == "eyeliner")? 190:180)) % 360) / ((category=="eyeliner") ? 8:12) );

    if(hue1 < hue2) return -1;
    else if(hue2 < hue1) return 1;
    else {
        var light1 = 1;
        if(HSL1[1] > 0.8) light1=2;
        else if(HSL1[1] < 0.6 && HSL1[2] < 0.4) light1 = 0;

        var light2 = 1;
        if(HSL2[1] > 0.8) light2=2;
        else if(HSL2[1] < 0.6 && HSL2[2] < 0.4) light2 = 0;

        if(light1 < light2) return ((hue1 % 2 == 0) ? -1:1);
        else if(light1 > light2) return ((hue1 % 2 == 0)? 1:-1);
        else {
            var lum1 = Math.sqrt( 0.299 * RGB1[0] + 0.587 * RGB1[1] + 0.114 * RGB1[2] );
            var lum2 = Math.sqrt( 0.299 * RGB2[0] + 0.587 * RGB2[1] + 0.114 * RGB2[2] );

            var result=0;
            if(lum1 < lum2) result = ((hue1 % 2 ==0) ? -1:1);
            else if(lum1 > lum2) result = ((hue1 % 2 == 0) ? 1:-1);

            if(light1 == 0 || light1 == 2) result *=-1;

            return result;
        }
    }
}

function orderShades2() {
    for(var category in makeoverobject) {
        if(typeof filtered[category] == "undefined") {
            filtered[category] = [];
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
    }
}

var ordered = {};
