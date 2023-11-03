import Router from 'express';
const router = Router();
import promoCodeController from '../controllers/PromoCodeController.js';
import checkRoleMiddleware from '../middleware/checkRoleMiddleware.js';
router.post('/create', checkRoleMiddleware('ADMIN'), promoCodeController.create);
router.get('/get', checkRoleMiddleware('ADMIN'), promoCodeController.getAll);
router.post('/delete', checkRoleMiddleware('ADMIN'), promoCodeController.delete);
router.put('/change', checkRoleMiddleware('ADMIN'), promoCodeController.change);
router.post('/use', promoCodeController.use);
router.post('/check', promoCodeController.check);
export default router;
//# sourceMappingURL=promoCodeRouter.js.map