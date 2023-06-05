const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/',authController.handleUserLogin);

module.exports = router;
