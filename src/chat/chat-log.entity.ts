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

export enum ChatMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FEEDBACK = 'feedback',
  COMMAND = 'command',
}

export enum ChatMessageSender {
  USER = 'user',
  HUMAN_CUSTOMER = 'human_customer',
  SYSTEM = 'system',
  AUTO_REPLY = 'auto_reply',
  AI_CUSTOMER = 'ai_customer',
  COMMAND = 'command',
}

export enum ChatLogStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Table({
  tableName: `chat_logs`,
})
export class ChatLog extends Model<ChatLog> {
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

  @Index('conversation_id-index')
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'conversation_id',
    comment: '会话id',
  })
  conversationId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: '消息内容',
  })
  text: string;

  @Column({
    type: DataType.ENUM(...Object.values(ChatMessageType)),
    allowNull: false,
    comment: '消息类型',
  })
  type: ChatMessageType;

  @Column({
    type: DataType.ENUM(...Object.values(ChatLogStatus)),
    allowNull: false,
    comment: '状态',
  })
  status: ChatLogStatus;

  @Column({
    type: DataType.ENUM(...Object.values(ChatMessageSender)),
    allowNull: false,
    comment: '发送者',
  })
  sender: ChatMessageSender;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'support_id',
    comment: '客服id',
  })
  supportId: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: '关联的实体',
  })
  relation: any;

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
