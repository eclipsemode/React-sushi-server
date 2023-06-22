'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.addColumn('products', 'temp_price', {
                type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER),
                allowNull: false,
                defaultValue: []
            }, {transaction});

            await queryInterface.sequelize.query('UPDATE products SET temp_price = ARRAY[price]', {transaction});

            await queryInterface.removeColumn('products', 'price', {transaction});

            await queryInterface.renameColumn('products', 'temp_price', 'price', {transaction});
        })
    },

    async down(queryInterface, Sequelize) {
        return await queryInterface.sequelize.transaction(async (transaction) => {
            return await queryInterface.changeColumn('products', 'price', {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            }, {transaction})
        })
    }
};
