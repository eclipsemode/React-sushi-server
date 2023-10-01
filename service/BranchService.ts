import {Branch} from "../models/models.js";

class BranchService {
    async getAll() {
        const branches = await Branch.findAll({
            order: [
                ['name', 'asc']
            ]
        });
        return branches;
    }
}

export default new BranchService();