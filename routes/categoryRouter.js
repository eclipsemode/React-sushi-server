const Router = require('express');
const router = new Router();
const categoryRouter = require('../controllers/CategoryController');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');

router.post('/', checkRoleMiddleware('ADMIN'), categoryRouter.create);
router.get('/', categoryRouter.getAll);
router.delete('/:id', checkRoleMiddleware('ADMIN'), categoryRouter.delete);
router.put('/', checkRoleMiddleware('ADMIN'), categoryRouter.change);
router.patch('/', checkRoleMiddleware('ADMIN'), categoryRouter.changeOrder);

module.exports = router;