const http = require("http");
const path = require("path");
const fs = require("fs");

const express = require("express");

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 3000;

httpServer.listen(3000, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// put the HTML file containing your form in a directory named "public" (relative to where this script is located)
//app.get("/", express.static(path.join(__dirname, "./public")));
app.get("/", function(req, res){
    fs.readFile('./index.html', "UTF-8", function(err, html) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    });
})
const multer = require("multer");

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: "./UPLOAD"
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});


app.post(
  "/uploadImage",
  upload.single("photo" /* name attribute of <file> element in your form */),
  (req, res) => {
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "./UPLOAD/image.png");

    //if (path.extname(req.file.originalname).toLowerCase() === ".png") {
    if(true){
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);

        res
          .status(200)
          .contentType("text/plain")
          .end("File uploaded!");
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