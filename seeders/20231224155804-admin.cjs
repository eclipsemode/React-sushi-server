'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.bulkInsert('users', [
                {
                    name: 'Daniel',
                    role: 'ADMIN',
                    tel: '+7 (918) 000-00-00',
                    isActivated: true
                }
            ], {transaction});
        })
    },

    async down(queryInterface, Sequelize) {
        return await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.bulkDelete('users', {name: 'Daniel'}, {transaction});
        })
    }
};
