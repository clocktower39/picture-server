const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', userController.signup_user);
router.get('/users', userController.list_users);

module.exports = router;