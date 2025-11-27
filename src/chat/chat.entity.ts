import {
  Column,
  Model,
  Table,
  DataType,
  CreatedAt,
  UpdatedAt,
  Index,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../users/users.entity';

@Table({
  tableName: `chats`,
})
export class Chat extends Model<Chat> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'id',
  })
  id: number;

  @ForeignKey(() => User)
  @Index('uid-index')
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'uid',
    comment: 'uid',
  })
  uid: string;

  @BelongsTo(() => User, {
    foreignKey: 'uid',
    targetKey: 'uid',
  })
  user: User;

  @Index({ name: 'conversation_id-index' })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'conversation_id',
    comment: '会话id',
  })
  conversationId: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'log_start_at',
    comment: '记录开始时间',
  })
  logStartAt: Date;

  @Column({
    type: DataType.JSONB,
    field: 'logs',
  })
  logs: any[];

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
}
