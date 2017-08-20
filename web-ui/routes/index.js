const express = require('express');
const userController = require('../controllers/user');
const router = new express.Router();

router.get('/', userController.listUsers);
router.get('/user/:id', userController.getUserInfo);

module.exports = router;
