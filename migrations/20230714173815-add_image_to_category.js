'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('categories', 'image', {
        type: Sequelize.STRING,
        defaultValue: ''
      }, {transaction});
    })
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('categories', 'image', {transaction});
    })
  }
};
