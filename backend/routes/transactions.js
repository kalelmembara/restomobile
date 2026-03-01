const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Routes
router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/daily/summary', transactionController.getDailySummary);
router.get('/stats/weekly', transactionController.getWeeklyStats);
router.get('/stats/monthly', transactionController.getMonthlyStats);

module.exports = router;
