'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('products', 'type', {
        type: Sequelize.DataTypes.ENUM('pizza', 'other'),
        defaultValue: 'other'
      }, {transaction})

      await queryInterface.addColumn('products', 'orderIndex', {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: null
      }, {transaction})

      await queryInterface.addColumn('products', 'sku', {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
        defaultValue: null
      }, {transaction})
    })
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('products', 'type', {transaction});
      await queryInterface.removeColumn('products', 'orderIndex', {transaction});
      await queryInterface.removeColumn('products', 'sku', {transaction});
    })
  }
};
