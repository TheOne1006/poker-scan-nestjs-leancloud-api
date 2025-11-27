'use strict';

const tableName = 'purchases';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING, INTEGER, DATE, JSONB, ENUM } = Sequelize;

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
        product_id: {
          type: STRING(100),
          allowNull: false,
          comment: '产品id',
        },
        transaction_id: {
          type: STRING(100),
          allowNull: false,
          comment: '交易id',
        },
        payload: {
          type: JSONB,
          allowNull: false,
          comment: '交易数据',
        },
        environment: {
          type: ENUM('Sandbox', 'Production', 'Xcode', 'LocalTesting'),
          allowNull: false,
          comment: '环境',
        },
        platform: {
          type: ENUM('ios', 'custom', 'site'),
          allowNull: false,
          comment: '平台',
        },
        status: {
          type: ENUM('pending', 'completed', 'failed', 'refunded', 'expired'),
          allowNull: false,
          defaultValue: 'pending',
          comment: '状态',
        },
        purchase_date: {
          type: DATE,
          allowNull: false,
          comment: '购买日期',
        },
        expires_date: {
          type: DATE,
          allowNull: true,
          comment: '过期日期',
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
    await queryInterface.addIndex(tableName, ['transaction_id'], { unique: true });
  },

  down: async (queryInterface) => {
    return queryInterface.dropTable(tableName);
  },
};
