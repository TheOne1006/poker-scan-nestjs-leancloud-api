import {
  Column,
  Model,
  Table,
  DataType,
  CreatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'user_registration_logs',
  updatedAt: false,
})
export class UserRegistrationLog extends Model<UserRegistrationLog> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'id',
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'uid',
  })
  uid: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'device_id',
    comment: '设备id',
  })
  deviceId: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'apple_sub',
    comment: 'apple sub',
  })
  appleSub: string;

  @CreatedAt
  @Column({
    field: 'created_at',
    comment: '注册时间',
  })
  createdAt: Date;
}
