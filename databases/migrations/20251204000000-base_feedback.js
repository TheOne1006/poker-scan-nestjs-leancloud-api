'use strict';

const tableName = 'base_feedbacks';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING, INTEGER, DATE, TEXT, ENUM } = Sequelize;

    await queryInterface.createTable(
      tableName,
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: 'id',
        },
        content: {
          type: TEXT,
          allowNull: false,
          comment: 'Feedback content',
        },
        contact: {
          type: STRING,
          allowNull: true,
          comment: 'Contact info',
        },
        platform: {
          type: ENUM('iOS', 'Android', 'Web', 'Other'),
          allowNull: false,
          comment: 'Platform',
        },
        device_id: {
          type: STRING,
          allowNull: false,
          comment: 'Device Unique ID',
        },
        ip: {
          type: STRING,
          allowNull: true,
          comment: 'IP Address',
        },
        created_at: {
          type: DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          comment: '创建时间',
        },
        updated_at: {
          type: DATE,
          allowNull: false,
          comment: '更新时间',
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
    );

    await queryInterface.addIndex(tableName, ['device_id'], {
      name: 'device_id_index'
    });

    await queryInterface.addIndex(tableName, ['ip'], {
      name: 'ip_index'
    });
  },

  down: async (queryInterface) => {
    return queryInterface.dropTable(tableName);
  },
};
