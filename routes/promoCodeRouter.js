const Router = require('express');
const router = new Router();
const promoCodeController = require('../controllers/PromoCodeController');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const authMiddleware = require("../middleware/authMiddleware");

router.post('/create', promoCodeController.create);
router.get('/get', promoCodeController.getAll);

module.exports = router;