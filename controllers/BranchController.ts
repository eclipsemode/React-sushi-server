import BranchService from "../service/BranchService.js";
import {Response, Request, NextFunction} from "express";
class BranchController {
    async getAll(req: Request, res: Response, next: NextFunction){
        try {
            const branches = await BranchService.getAll();
            return res.json(branches);
        } catch (e) {
            next(e);
        }
    }
}

export default new BranchController();