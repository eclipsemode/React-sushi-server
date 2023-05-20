'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return await queryInterface.addColumn('promocodes', 'discount', {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false
        })
    },

    async down(queryInterface, Sequelize) {
        return await queryInterface.removeColumn('promocodes', 'discount')
    }
};
