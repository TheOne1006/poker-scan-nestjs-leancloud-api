import {
  Column,
  Model,
  Table,
  DataType,
  CreatedAt,
  UpdatedAt,
  Index,
} from 'sequelize-typescript';
import { PlatformType } from './dtos/base-feedback.dto';

@Table({
  tableName: 'base_feedbacks',
})
export class BaseFeedback extends Model<BaseFeedback> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'id',
  })
  id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Feedback content',
  })
  content: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Contact info',
  })
  contact: string;

  @Column({
    type: DataType.ENUM(...Object.values(PlatformType)),
    allowNull: false,
    comment: 'Platform',
  })
  platform: PlatformType;

  @Index('device_id_index')
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'device_id',
    comment: 'Device Unique ID',
  })
  deviceId: string;

  @Index('ip_index')
  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'IP Address',
  })
  ip: string;

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
