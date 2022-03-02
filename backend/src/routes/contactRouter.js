const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const contactController = require('../controllers/contactController');

router.post('/', verifyToken, contactController.newContact);
router.delete('/:contactId', verifyToken, contactController.deleteContact);
router.get('/', verifyToken, contactController.getContacts);

module.exports = router;