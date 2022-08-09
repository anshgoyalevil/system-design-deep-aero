require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const deepai = require('deepai');
const _ = require('lodash');
deepai.setApiKey(process.env.API_KEY);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/app", function (req, res) {
    res.render("mainapp");
});

var files = [];
var i = 0;
var score = -1;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "." + _.lowerCase(path.extname((file.originalname))));
    }
});

var upload = multer({ storage: storage });

var multipleUpload = upload.fields([{ name: 'file1', maxCount: 1 }, { name: 'file2', maxCount: 1 }]);

app.post("/upload", multipleUpload, function (req, res) {
    if (req.files) {
        console.log("file uploaded successfully");
        const testFolder = 'public/uploads';
        fs.readdirSync(testFolder).forEach(file => {
            files[i] = file;
            i++;
        });

        (async function() {
            var resp = await deepai.callStandardApi("image-similarity", {
                image1: fs.createReadStream("public/uploads/" + files[0]),
                image2: fs.createReadStream("public/uploads/" + files[1]),
            });
            score = resp.output.distance;
            res.redirect("/popup");
        })()
    }
    
});

app.get("/popup", function (req, res) { 
    res.render("popup", {
        score: score,
    });
 });

app.listen(3000, function () {
    console.log("App successfully spinned up on port 3000");
});