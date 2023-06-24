'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query('UPDATE products SET sku = NULL', {transaction});

      await queryInterface.changeColumn('products', 'sku', {
        type: Sequelize.DataTypes.STRING,
        defaultValue: null
      }, {transaction});
    })
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      return await queryInterface.changeColumn('products', 'sku', {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
        allowNull: true,
        defaultValue: []
      }, {transaction})
    })
  }
};
