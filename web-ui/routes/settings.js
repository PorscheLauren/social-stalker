const express = require('express');
const sourceController = require('../controllers/usersource');
const router = new express.Router();

router.get('/', sourceController.listSources);
router.get('/source/:name', sourceController.getSourceInfo);
router.post('/source/:name', sourceController.updateSourceToken);

module.exports = router;
