const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const methodOverride = require('method-override');
const userRoutes = require('./routes/userRoutes');
const User = require("./models/user");

const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/', userRoutes);

const mongoURI = process.env.ATLAS_URI;
const promise = mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// connection
const conn = mongoose.createConnection(mongoURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

let gridfsBucket;

conn.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  console.log('mongodb connection established')
});

// Storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
          metadata: { user: req.body.username }
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({
  storage
});

app.post("/upload", upload.single("file"), (req, res) => {
  console.log(res.req.file.id)
  User.findOneAndUpdate({ username: req.body.username }, { profilePicture: res.req.file.id }, (err, user) => {
    if(err){
      return res.send(err);
    }
    
    return res.json({ src: res.req.file.filename })
  })
});

// get / page
app.get('/', (req, res) => {
  gridfsBucket.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      const readstream = gridfsBucket.openDownloadStream(files[files.length - 1]);
      readstream.pipe(res);
    }
  });
});

app.get('/files', (req, res) => {
  gridfsBucket.find('').toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }
    // Files exist
    return res.json(files);
  });
});

app.get('/image/:id', (req, res) => {
  gridfsBucket.find({ _id: mongoose.Types.ObjectId(req.params.id) }).toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Check if image
    if (files[0].contentType === 'image/jpeg' || files[0].contentType === 'image/png') {
      // Read output to browser
      const readstream = gridfsBucket.openDownloadStream(files[0]._id);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
