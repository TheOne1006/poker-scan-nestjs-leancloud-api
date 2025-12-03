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

export enum FeedbackType {
  BUG = 'bug',
  SUGGESTION = 'suggestion',
  FEATURE = 'feature',
}

@Table({
  tableName: `feedbacks`,
})
export class Feedback extends Model<Feedback> {
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
    comment: '用户id',
  })
  uid: string;

  @BelongsTo(() => User, {
    foreignKey: 'uid',
    targetKey: 'uid',
  })
  user: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: '问题描述',
  })
  description: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: '图片文件名 (JSON array of strings)',
  })
  images: string[];

  @Column({
    type: DataType.ENUM(...Object.values(FeedbackType)),
    allowNull: false,
    comment: '反馈类型',
  })
  type: FeedbackType;

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
