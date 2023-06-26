const Router = require('express');
const router = new Router();
const productController = require('../controllers/ProductController');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');

router.post('/', checkRoleMiddleware('ADMIN'), productController.create);
router.get('/', productController.getAll);
router.delete('/:id', checkRoleMiddleware('ADMIN'), productController.delete);
router.put('/', checkRoleMiddleware('ADMIN'), productController.change);

module.exports = router;