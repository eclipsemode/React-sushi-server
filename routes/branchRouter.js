const Router = require('express');
const router = new Router();
const BranchController = require('../controllers/BranchController');

router.get('/', BranchController.getAll);

module.exports = router;