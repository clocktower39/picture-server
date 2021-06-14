const router = require("express").Router();
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");
let path = require("path");
let User = require("../models/user.modal");
const { resolve } = require("path");
const crypto = require("crypto");

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'images');
//     },
//     filename: function(req, file, cb) {
//         cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

const storage2 = new GridFsStorage({
  url: process.env.ATLAS_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(dile.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// let upload = multer({ storage, fileFilter });
let upload = multer({ storage2 });

router.route("/add").post(upload.single("file"), (req, res, next) => {
  const name = req.body.name;
  const birthdate = req.body.birthdate;
  const photo = req.file.filename;

  User.findOne({ photo: photo }).then((image) => {
    console.log(image);
    if (image) {
      return res.status(200).json({
        success: false,
        message: "Image already exists",
      });
    }
    const newUserData = {
      name,
      birthdate,
      photo,
    };
    const newUser = new User(newUserData);
    newUser
      .save()
      .then(() => res.json("User Added"))
      .catch((err) => res.status(400).json("Error: " + err));
  });
});

module.exports = router;
