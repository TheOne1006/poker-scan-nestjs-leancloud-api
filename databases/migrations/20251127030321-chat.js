'use strict';

const tableName = 'chats';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING, INTEGER, DATE, JSONB } = Sequelize;

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
          type: STRING(50),
          allowNull: false,
          comment: '用户id',
        },
        conversation_id: {
          type: STRING(50),
          allowNull: false,
          comment: '会话id',
        },
        log_start_at: {
          type: DATE,
          allowNull: false,
          comment: '记录开始时间',
        },
        logs: {
          type: JSONB,
          allowNull: true,
          comment: '会话记录',
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

    await queryInterface.addIndex(tableName, ['uid'], { unique: true });
    await queryInterface.addIndex(tableName, ['conversation_id']);
  },

  down: async (queryInterface) => {
    return queryInterface.dropTable(tableName);
  },
};
