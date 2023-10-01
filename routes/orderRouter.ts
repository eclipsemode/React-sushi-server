import Router from 'express';
const router = Router();
import orderController from "../controllers/OrderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

router.post('/create', orderController.create);
router.get('/get', authMiddleware, orderController.getAll);
router.get('/get-by-user', authMiddleware, orderController.getAllByUserId );
router.post('/change-status-webhook', orderController.changeStatusWebhook);

export default router;