const express = require('express');
const userController = require('../controllers/userController');
const { upload } = require("../mygridfs");

const router = express.Router();

router.post('/signup', userController.signup_user);
router.post('/upload', upload.single("file"), userController.upload_profile_picture);
router.get('/users', userController.list_users);
router.get('/image/:id', userController.get_profile_picture);
router.get('/image/remove/:username', userController.delete_profile_picture);

module.exports = router;