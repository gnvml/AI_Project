var http = require('http');
const path = require("path");
var fs = require('fs');
const multer = require("multer");
var execSync = require('child_process').execSync;
const express = require("express");

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const upload = multer({
    dest: "./UPLOAD",
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

app.get("/", function(req, res){
    fs.readFile('./index.html', "UTF-8", function(err, html) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    });
})
app.get("/run", function(req, res){
    var cmd = "python ai_model.py";

    var options = {
        encoding: 'utf8'
    };

    console.log(execSync(cmd, options));
    sleep(5000)
    fs.readFile('./OUTPUT/out.txt', "utf8", function(err, txt) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(txt);
    });
})

const handleError = (err, res) => {
    res
      .status(500)
      .contentType("text/plain")
      .end("Oops! Something went wrong!");
};

app.post(
    "/uploadImage",
    upload.single("photo" /* name attribute of <file> element in your form */),
    (req, res) => {
      const tempPath = req.file.path;
      const targetPath = path.join(__dirname, "./UPLOAD/upload.jpg");
  
      //if (path.extname(req.file.originalname).toLowerCase() === ".png") {
      if(true){
        fs.rename(tempPath, targetPath, err => {
          if (err) return handleError(err, res);
  
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end();

          //res.end();
            //.status(200)
            //.contentType("text/plain")
            //.end("File uploaded!");
        });
      } else {
        fs.unlink(tempPath, err => {
          if (err) return handleError(err, res);
  
          res
            .status(403)
            .contentType("text/plain")
            .end("Only .png files are allowed!");
        });
      }
    }
);

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}