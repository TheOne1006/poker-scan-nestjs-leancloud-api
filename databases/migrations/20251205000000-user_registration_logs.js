'use strict';

const tableName = 'user_registration_logs';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING, INTEGER, DATE } = Sequelize;

    await queryInterface.createTable(
      tableName,
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: 'id',
        },
        uid: {
          type: STRING(100),
          allowNull: false,
          comment: 'uid',
        },
        device_id: {
          type: STRING(100),
          allowNull: true,
          comment: '设备id',
        },
        apple_sub: {
          type: STRING(100),
          allowNull: true,
          comment: 'apple sub',
        },
        created_at: {
          type: DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          comment: '注册时间',
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      }
    );
  },

  down: async (queryInterface) => {
    return queryInterface.dropTable(tableName);
  },
};
