const express = require('express');
const sourceController = require('../controllers/usersource');
const telegramController = require('../controllers/telegram');
const router = new express.Router();

router.get('/', sourceController.listSources);
router.get('/source/:name', sourceController.getSourceInfo);
router.post('/source/:name', sourceController.updateSourceToken);
router.post('/source/telegram/send', telegramController.sendCode);
router.post('/source/telegram/save', telegramController.saveCode);

module.exports = router;
