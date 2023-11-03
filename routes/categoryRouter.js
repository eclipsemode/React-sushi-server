import Router from 'express';
const router = Router();
import categoryRouter from '../controllers/CategoryController.js';
import checkRoleMiddleware from '../middleware/checkRoleMiddleware.js';
router.post('/', checkRoleMiddleware('ADMIN'), categoryRouter.create);
router.get('/', categoryRouter.getAll);
router.delete('/:id', checkRoleMiddleware('ADMIN'), categoryRouter.delete);
router.put('/', checkRoleMiddleware('ADMIN'), categoryRouter.change);
router.patch('/', checkRoleMiddleware('ADMIN'), categoryRouter.changeOrder);
export default router;
//# sourceMappingURL=categoryRouter.js.map