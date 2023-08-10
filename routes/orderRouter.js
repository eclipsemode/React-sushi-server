const Router = require('express');
const router = new Router();
const orderController = require("../controllers/OrderController");
const authMiddleware = require("../middleware/authMiddleware");

router.post('/create', orderController.create);
router.get('/get', authMiddleware, orderController.getAll);
router.get('/get/:id', authMiddleware, orderController.getAllByUserId );
router.post('/change-status-webhook', orderController.changeStatusWebhook);

module.exports = router;