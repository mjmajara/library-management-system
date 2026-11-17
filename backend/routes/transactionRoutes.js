const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAllTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.post('/', transactionController.createTransaction);

module.exports = router;
