import BranchService from "../service/BranchService.js";
class BranchController {
    async getAll(req, res, next) {
        try {
            const branches = await BranchService.getAll();
            return res.json(branches);
        }
        catch (e) {
            next(e);
        }
    }
}
export default new BranchController();
//# sourceMappingURL=BranchController.js.map