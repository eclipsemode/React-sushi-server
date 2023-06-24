'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('products', 'name', {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      }, {transaction})

      await queryInterface.addColumn('products', 'size', {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }, {transaction})
    })
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('products', 'name', {
        type: Sequelize.DataTypes.STRING,
        unique: true,
        allowNull: false
      }, {transaction})

      await queryInterface.removeColumn('products', 'size', {transaction})
    })
  }
};
