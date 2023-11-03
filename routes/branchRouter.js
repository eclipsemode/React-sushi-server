import { Router } from "express";
const router = Router();
import BranchController from "../controllers/BranchController.js";
router.get('/', BranchController.getAll);
export default router;
//# sourceMappingURL=branchRouter.js.map