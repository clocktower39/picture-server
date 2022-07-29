const User = require("../models/user");
const mongoose = require("mongoose");

const signup_user = (req, res) => {
  let user = new User(req.body);
  let saveUser = () => {
    user.save((err) => {
      if (err) {
        res.send({ error: { err } });
      } else {
        res.send({
          status: "success",
          user,
        });
      }
    });
  };
  saveUser();
};

const list_users = (req, res) => {
  User.
  find({}).
  exec(function (err, users) {
    if(err) res.send(err)
    res.json(users)
  })
}

const upload_profile_picture = (req, res) => {
  User.findOneAndUpdate({ username: req.body.username }, { profilePicture: res.req.file.id }, (err, user) => {
    if(err){
      return res.send(err);
    }
    
    return res.json({ src: res.req.file.filename })
  })
}

const get_profile_picture = (req, res) => {
  let gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });

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
}

module.exports = {
  signup_user,
  list_users,
  get_profile_picture,
  upload_profile_picture,
};