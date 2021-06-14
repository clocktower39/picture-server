const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(methodOverride('_method'));

const mongoURI = process.env.ATLAS_URI;

// connection
const conn = mongoose.createConnection(mongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

let gfs;

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
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
            bucketName: "uploads"
          };
          resolve(fileInfo);
        });
      });
    }
  });
  
  const upload = multer({
    storage
  });

  // get / page
  app.get('/', (req, res) => {
    gfs.files.find().toArray((err, files) => {
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
        const readstream = gfs.createReadStream(files[1]);
        readstream.pipe(res);
      }
    });
  });

  app.post("/upload", upload.single("file"), (req, res) => {
    res.redirect("/");
  });
  

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
