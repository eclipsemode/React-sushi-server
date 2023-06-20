'use strict';

const {DataTypes} = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return await queryInterface.addColumn('orders', 'status', {
            type: Sequelize.DataTypes.ENUM('new', 'production', 'produced', 'delivery', 'completed', 'deleted'),
            allowNull: false,
            defaultValue: 'new'
        })
    },

    async down(queryInterface, Sequelize) {
        return await queryInterface.removeColumn('orders', 'status')
    }
};
