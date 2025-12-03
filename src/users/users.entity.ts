import {
  Column,
  Model,
  Table,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
} from 'sequelize-typescript';

export enum UserType {
  EMAIL = 'email',
  APPLE = 'apple',
  GUEST = 'guest',
}

@Table({
  tableName: `users`,
  version: true, // 启用乐观锁
  paranoid: true, // 启用软删除
})
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'id',
  })
  id: number;

  @Index({ name: 'uid-unique', unique: true })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'uid',
  })
  uid: string;

  @Index({ name: 'username' })
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '用户名',
  })
  username: string;

  @Index({ name: 'email-unique', unique: true })
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: 'email',
  })
  email: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'password',
  })
  password: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    comment: 'salt',
  })
  salt: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserType)),
    allowNull: false,
    defaultValue: UserType.EMAIL,
    comment: '用户类型: email, apple, guest',
  })
  type: UserType;

  @Column({
    type: DataType.JSON,
    defaultValue: [],
    comment: '角色',
  })
  roles: any[];

  @Index('device_id-index')
  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'device_id',
    comment: '设备id',
  })
  deviceId: string;

  @Index('apple_sub-index')
  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'apple_sub',
    comment: 'apple sub',
  })
  appleSub: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_vip',
    comment: '是否是vip',
  })
  isVip: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'vip_expire_at',
    comment: 'vip过期时间',
  })
  vipExpireAt: Date;

  @CreatedAt
  @Column({
    field: 'created_at',
  })
  createdAt: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
  })
  updatedAt: Date;


  @DeletedAt
  @Column({
    field: 'deleted_at',
  })
  deletedAt: Date;
}
