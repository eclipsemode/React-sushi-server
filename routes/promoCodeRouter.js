const Router = require('express');
const router = new Router();
const promoCodeController = require('../controllers/PromoCodeController');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');

router.post('/create', checkRoleMiddleware('ADMIN'), promoCodeController.create);
router.get('/get', checkRoleMiddleware('ADMIN'), promoCodeController.getAll);
router.post('/delete', checkRoleMiddleware('ADMIN'), promoCodeController.delete);
router.put('/change', checkRoleMiddleware('ADMIN'), promoCodeController.change);
router.post('/use', promoCodeController.use);
router.post('/check', promoCodeController.check);

module.exports = router;