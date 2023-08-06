const BranchService = require('../service/BranchService');
class BranchController {
    async getAll(req, res, next){
        try {
            const branches = await BranchService.getAll();
            return res.json(branches);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new BranchController();