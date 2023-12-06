'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.bulkInsert('branches', [
                {
                    name: 'Армавир'
                },
                {
                    name: 'Кропоткин'
                }
            ], {transaction});
        })
    },

    async down(queryInterface, Sequelize) {
        return await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.bulkDelete('branches', null, {transaction});
        })
    }
};
