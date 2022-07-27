const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    profilePicture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "uploads.files"
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
