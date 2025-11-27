'use strict';

const tableName = 'feedbacks';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING, INTEGER, DATE, TEXT, ENUM, JSON } = Sequelize;

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
        description: {
          type: TEXT,
          allowNull: false,
          comment: '问题描述',
        },
        images: {
          type: JSON,
          allowNull: true,
          comment: '图片文件名 (JSON array of strings)',
        },
        type: {
          type: ENUM('bug', 'suggestion', 'feature'),
          allowNull: false,
          comment: '反馈类型',
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

    await queryInterface.addIndex(tableName, ['uid']);
  },

  down: async (queryInterface) => {
    return queryInterface.dropTable(tableName);
  },
};
