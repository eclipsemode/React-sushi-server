import Router from 'express';
const router = Router();
import productController from '../controllers/ProductController.js';
import checkRoleMiddleware from '../middleware/checkRoleMiddleware.js';
router.post('/', checkRoleMiddleware('ADMIN'), productController.create);
router.get('/', productController.getAll);
router.delete('/:id', checkRoleMiddleware('ADMIN'), productController.delete);
router.put('/', checkRoleMiddleware('ADMIN'), productController.change);
router.post('/change-order', checkRoleMiddleware('ADMIN'), productController.changeOrderIndex);
export default router;
//# sourceMappingURL=productRouter.js.map