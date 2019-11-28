var xmlHttp = GetXmlHttpObject();
if (xmlHttp == null) {
    alert("Browser does not support HTTP Request");
    return;
}

//var url="parsedata.php";
var url = 'https://sephoravirtualartist.com/parsedata.php'
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