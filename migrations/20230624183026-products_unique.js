'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('products', 'temp_name', {
        type: Sequelize.DataTypes.STRING,
        unique: false,
        allowNull: false,
        defaultValue: 'product'
      }, {transaction})

      await queryInterface.sequelize.query('UPDATE products SET temp_name=name ', {transaction});
      await queryInterface.removeColumn('products', 'name', {transaction});
      await queryInterface.renameColumn('products', 'temp_name', 'name', {transaction});
    })
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('products', 'temp_name', {
        type: Sequelize.DataTypes.STRING,
        unique: true,
        allowNull: false
      }, {transaction})

      await queryInterface.sequelize.query('UPDATE products SET temp_name=name ', {transaction});
      await queryInterface.removeColumn('products', 'name', {transaction});
      await queryInterface.renameColumn('products', 'temp_name', 'name', {transaction});
    })
  }
};
