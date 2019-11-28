var http = require('http');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function(req, res) {
    //var real = './sephoravirtualartist.com' + req.url;
    console.log(`${req.method} request for ${req.url}`);

    if (req.url === '/') {
        fs.readFile('./index.html', "UTF-8", function(err, html) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
        });
    } else if (req.url.match('css')) {
        fs.readFile(req.url, "UTF-8", function(err, html) {
            res.writeHead(200, { "Content-Type": "text/css" });
            res.end(html);
        });
    } else if (req.url.match('png')) {
        fs.readFile(req.url, "UTF-8", function(err, html) {
            res.writeHead(200, { "Content-Type": "image/png" });
            res.end(html);
        });
    } else {
        fs.readFile(req.url, "UTF-8", function(err, html) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
        });
    }

    //show image in page
    //to display image
    if (req.url == "/img/logo.png") {
        console.log(`Request image in page ${req.url}`)
        var img = fs.readFileSync('./img/logo.png');
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(img, 'binary');

        return;

    }
    //for request favicon
    if (req.url.match("/requestFavicon" || req.url.match("/logo"))) {
        console.log('Request for favicon');

        var img = fs.readFileSync('img/favicon.png');
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end(img, 'binary');

        //var icoPath = path.join(__dirname, 'public', req.url);
        //var fileStream = fs.createReadStream(icoPath, "base64");
        //res.writeHead(200, {"Content-Type": "image/x-icon"});
        //fileStream.pipe(res);
    }
});
server.listen(8080, function() {
    console.log("Connect Success!!!")
    console.log("Server run in 8080 port")
});