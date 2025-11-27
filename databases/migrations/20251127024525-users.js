'use strict';

const tableName = 'users';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING, BOOLEAN, INTEGER, DATE, JSON } = Sequelize;

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
        username: { type: STRING(50), allowNull: false, comment: '用户名' },
        email: {
          type: STRING(50),
          allowNull: false,
          comment: 'email',
        },
        password: {
          type: STRING(100),
          allowNull: false,
          comment: 'password',
        },
        salt: {
          type: STRING(30),
          allowNull: false,
          comment: 'salt',
        },
        type: {
          type: STRING(20),
          allowNull: false,
          defaultValue: 'email',
          comment: '用户类型: email, apple, guest',
        },
        roles: {
          type: JSON,
          defaultValue: [],
          comment: '角色',
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
        is_vip: {
          type: BOOLEAN,
          defaultValue: false,
          comment: '是否是vip',
        },
        vip_expire_at: {
          type: DATE,
          allowNull: true,
          comment: 'vip过期时间',
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
        version: {
          type: INTEGER,
          defaultValue: 0,
          allowNull: false,
          comment: '更新版本',
        },
        deleted_at: {
          type: DATE,
          allowNull: true,
          comment: '删除时间',
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
    );

    await queryInterface.addIndex(tableName, ['uid'], {
      unique: true,
    });

    await queryInterface.addIndex(tableName, ['username']);

    await queryInterface.addIndex(tableName, ['email'], {
      unique: true,
    });

    await queryInterface.addIndex(tableName, ['device_id']);
    
    await queryInterface.addIndex(tableName, ['apple_sub']);
  },

  down: async (queryInterface) => {
    return queryInterface.dropTable(tableName);
  },
};
