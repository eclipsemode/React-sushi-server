const {Branch} = require("../models/models");

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

module.exports = new BranchService();