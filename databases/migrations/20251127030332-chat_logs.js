'use strict';

const tableName = 'chat_logs';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING, INTEGER, DATE, TEXT, ENUM, JSONB } = Sequelize;

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
        text: {
          type: TEXT,
          allowNull: false,
          comment: '消息内容',
        },
        type: {
          type: ENUM('text', 'image', 'feedback', 'command'),
          allowNull: false,
          comment: '消息类型',
        },
        status: {
          type: ENUM('pending', 'completed', 'failed'),
          allowNull: false,
          comment: '状态',
        },
        sender: {
          type: ENUM(
            'user',
            'human_customer',
            'system',
            'auto_reply',
            'ai_customer',
            'command',
          ),
          allowNull: false,
          comment: '发送者',
        },
        support_id: {
          type: STRING(100),
          allowNull: true,
          comment: '客服id',
        },
        relation: {
          type: JSONB,
          allowNull: true,
          comment: '关联的实体',
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

    await queryInterface.addIndex(tableName, ['conversation_id']);
  },

  down: async (queryInterface) => {
    return queryInterface.dropTable(tableName);
  },
};
