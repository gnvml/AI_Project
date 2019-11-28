/* You may give each page an identifying name, server, and channel on
the next lines. */
if(0) {
s.pageName="virtual artist:landing page"
s.server="sephora"
s.channel="virtual artist"
s.pageType=""
s.visitorNamespace="sephora";
s.prop1="virtual artist"
s.prop2="virtual artist"
s.prop3="virtual artist"
s.prop4=""
s.prop5=""

s.eVar6=s.pageName;
if(is.desktop()) {
	s.eVar19="deskop web";
	s.eVar21="web";
} else if(is.tablet()) {
	s.eVar19="tablet web";
	s.eVar21="web";
} else if(is.mobile()) {
	s.eVar19="mobile";
	s.eVar21="mobile";
} else {
	s.eVar19="desktop web";
	s.eVar21="web";
}
s.eVar40=window.location.href;
s.eVar58=navigator.userAgent;

if(country=="CA") {
  s.eVar62=country.toLowerCase()+"-"+lang;
} else {
  s.eVar62="us-en";
}

s.eVar63=window.location.href;

if(country=="CA") {
  s.prop10=country.toLowerCase();
} else {
  s.prop10="us";
}


s.prop15=s.eVar21+":"+s.pageName;
var currentDate=new Date();
s.prop25=currentDate.getFullYear()+"|"+(currentDate.getMonth()+1)+"|"+currentDate.getDate();
if(currentDate.getHours()>11) {
  var curHour=currentDate.getHours()-12;
  var cm="PM";
} else {
  var curHour=currentDate.getHours();
  var cm="AM";
}
s.prop39=curHour  + ":" + currentDate.getMinutes() + cm;
s.prop46=s.eVar62;

/* Conversion Variables */
s.campaign=""
s.state=""
s.zip=""
s.events=""
s.products=""
s.purchaseID=""
s.eVar1=""
s.eVar2=""
s.eVar3=""
s.eVar4=""
s.eVar5=""
var s_code=s.t();if(s_code)document.write(s_code);
}


function initLipAndLashPage(pageid) {
	/* You may give each page an identifying name, server, and channel on
	the next lines. */
	s.pageName=pageid
	s.server="sephora"
	s.channel=pageid
	s.pageType=""
	s.visitorNamespace="sephora";
	s.prop1=pageid
	s.prop2=pageid
	s.prop3=pageid
	s.prop4=""
	s.prop5=""


	s.eVar6=s.pageName;
	if(is.desktop()) {
		s.eVar19="deskop web";
		s.eVar21="web";
	} else if(is.tablet()) {
		s.eVar19="tablet web";
		s.eVar21="web";
	} else if(is.mobile()) {
		s.eVar19="mobile";
		s.eVar21="mobile";
	} else {
		s.eVar19="desktop web";
		s.eVar21="web";
	}
	s.eVar40=window.location.href;
	s.eVar58=navigator.userAgent;

	if(country=="CA") {
	  s.eVar62=country.toLowerCase()+"-"+lang;
	} else {
	  s.eVar62="us-en";
	}

	s.eVar63=window.location.href;

	if(country=="CA") {
	  s.prop10=country.toLowerCase();
	} else {
	  s.prop10="us";
	}

	s.prop15=s.eVar21+":"+s.pageName;
	var currentDate=new Date();
	s.prop25=currentDate.getFullYear()+"|"+(currentDate.getMonth()+1)+"|"+currentDate.getDate();
	if(currentDate.getHours()>11) {
	  var curHour=currentDate.getHours()-12;
	  var cm="PM";
	} else {
	  var curHour=currentDate.getHours();
	  var cm="AM";
	}
	s.prop39=curHour  + ":" + currentDate.getMinutes() + cm;
	s.prop46=s.eVar62;

	/* Conversion Variables */
	s.campaign=""
	s.state=""
	s.zip=""
	s.events=""
	s.products=""
	s.purchaseID=""
	s.eVar1=""
	s.eVar2=""
	s.eVar3=""
	s.eVar4=""
	s.eVar5=""
	var s_code=s.t();if(s_code)document.write(s_code);
}

function resetTracker() {
  s.prop1="";
  s.prop2="";
  s.prop3="";
  s.prop4="";
  s.prop5="";
  s.prop10="";
  s.prop15="";
  s.prop25="";
  s.prop39="";
  s.prop46="";
  s.prop55="";

  s.eVar6="";
  s.eVar8="";
  s.eVar11="";
  s.eVar12="";
  s.eVar19="";
  s.eVar21="";
  s.eVar27="";
  s.eVar28="";
  s.eVar38="";
  s.eVar39="";
  s.eVar40="";
  s.eVar44="";
  s.eVar45="";
  s.eVar46="";
  s.eVar47="";
  s.eVar49="";
  s.eVar56="";
  s.eVar58="";
  s.eVar62="";
  s.eVar63="";
  s.eVar75="";

  s.products="";
}

function trackGA(v0,v1,v2) {
    if(typeof(notrack) != "undefined" && notrack ==1) {
        return;
    }
  if(typeof v1=="undefined" && typeof v2=="undefined") {
    var tempv0=v0.split(":");
    v0=tempv0[0];

    if(tempv0.length>1) {
      v1=tempv0[1];
    }

    if(tempv0.length>2) {
      v2=tempv0[2];
    }
  }

  if(typeof v0!="undefined" && v0!="") {
    if(typeof v1!="undefined" && v1!="") {
      if(typeof v2!="undefined" && v2!="") {
        ga('send', 'event', v0, v1, v2);
      } else {
        ga('send', 'event', v0, v1);
      }
    } else {
      ga('send', 'event', v0);
    }
  }

}

var track_suite="sephoracom";

function trackEventVA(param) {
    if(typeof(notrack) != "undefined" && notrack ==1) {
        return;
    }
  if(isSEA) {
    return;
  }

  resetTracker();

  var pagename="virtual artist";
  var s=s_gi(track_suite);

  var tp=pagename+":"+param;
  s.prop55=tp;

  s.linkTrackVars = 'prop55';
  s.linkTrackEvents = 'None';

  s.tl(true,'o','vto',null);

  trackGA(param);
}

function trackEvent(param) {
    if(typeof(notrack) != "undefined" && notrack ==1) {
        return;
    }
  resetTracker();

  var pagename="virtual try on";
  var s=s_gi(track_suite);

  var tp=pagename+":"+param;
  s.prop55=tp;

  s.linkTrackVars = 'prop55';
  s.linkTrackEvents = 'None';

  s.tl(true,'o','vto',null);

  trackGA(param);
}

function trackEventLooks(param) {
    if(typeof(notrack) != "undefined" && notrack ==1) {
        return;
    }
	resetTracker();
	
	var pagename = "virtual looks";
	var s=s_gi(track_suite);
	var tp=pagename+":"+param;
	s.prop55=tp;

  s.linkTrackVars = 'prop55';
  s.linkTrackEvents = 'None';

  s.tl(true,'o','vto',null);

  trackGA(param);
}


function trackEventFilter(tp2) {
    if(typeof(notrack) != "undefined" && notrack ==1) {
        return;
    }
	resetTracker();

    var pagename="virtual try on";
    var s=s_gi(track_suite);

	var mf = filters['appliedFilters'];

	switch(currentCategory) {
		case "lips":
			var tp=pagename+":filters:lip";
			break;
		case "eyeshadow":
			var tp=pagename+":filters:shadow";
            break;
		case "lash":
			var tp=pagename+":filters:lash";
			break;
        case "cheek":
            var tp=pagename+":filters:cheek";
            break;
	}

    s.prop55=tp;
    s.eVar56=tp2;

    s.linkTrackVars = 'prop55,eVar56';
    s.linkTrackEvents = 'None';

    s.tl(true,'o','vto',null);

    trackGA('filter by',tp2);
}

function trackEventFilterNew(tp2) {
    if(typeof(notrack) != "undefined" && notrack ==1) {
        return;
    }
	resetTracker();

    var pagename="virtual try on";
    var s=s_gi(track_suite);

	var mf = filters['appliedFilters'];

	switch(currentCategory) {
		case "lips":
			var tp=pagename+":filters:lip";
			break;
		case "eyeshadow":
			var tp=pagename+":filters:shadow";
            break;
		case "lash":
			var tp=pagename+":filters:lash";
			break;
        case "cheek":
            var tp=pagename+":filters:cheek";
            break;
	}

    s.prop55=tp;
    s.eVar56=tp2;

    s.linkTrackVars = 'prop55,eVar56';
    s.linkTrackEvents = 'None';

    s.tl(true,'o','vto',null);

    trackGA('filter by',tp2);
}

function trackProduct(finish,skuid) {
    if(typeof(notrack) != "undefined" && notrack ==1) {
        return;
    }
  if(isSEA) {
    return;
  }

  resetTracker();

  var pagename="virtual try on";
  var s=s_gi(track_suite);

  if(finish=="") {
    finish="n/a";
  }

  if(currStat.currProductType=="lash") {
    var tp=pagename+":"+finish+":"+skuid;
  } else {
    var tp=pagename+":shades:"+finish+":"+skuid;
  }
  s.prop55=tp;
  s.products=";"+skuid;

  s.linkTrackVars = 'prop55,products';
  s.linkTrackEvents = 'None';

  s.tl(true,'o','vto',null);

  trackGA('shades',finish,skuid);
}

function trackEventTut(param) {
    if(typeof(notrack) != "undefined" && notrack ==1) {
        return;
    }
  if(isSEA) {
    return;
  }

  resetTracker();

  var pagename="virtual tutorial";
  var s=s_gi(track_suite);

  var tp=pagename+":"+param;
  s.prop55=tp;

  s.linkTrackVars = 'prop55';
  s.linkTrackEvents = 'None';

  s.tl(true,'o','vto',null);

  trackGA(param);
}
