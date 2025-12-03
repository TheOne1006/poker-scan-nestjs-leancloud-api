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

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',
}

export enum Platform {
  IOS = 'ios',
  CUSTOM = 'custom',
  SITE = 'site',
}

export enum Environment {
  SANDBOX = 'Sandbox',
  PRODUCTION = 'Production',
  XCODE = 'Xcode',
  LOCAL_TESTING = 'LocalTesting',
}

@Table({
  tableName: `purchases`,
})
export class Purchase extends Model<Purchase> {
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
    type: DataType.STRING(100),
    allowNull: false,
    field: 'product_id',
    comment: '产品id',
  })
  productId: string;

  @Index({ name: 'transaction_id-unique', unique: true })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'transaction_id',
    comment: '交易id',
  })
  transactionId: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    comment: '交易数据',
  })
  payload: any;

  @Column({
    type: DataType.ENUM(...Object.values(Environment)),
    allowNull: false,
    comment: '环境',
  })
  environment: Environment;

  @Column({
    type: DataType.ENUM(...Object.values(Platform)),
    allowNull: false,
    comment: '平台',
  })
  platform: Platform;

  @Column({
    type: DataType.ENUM(...Object.values(PurchaseStatus)),
    allowNull: false,
    defaultValue: PurchaseStatus.PENDING,
    comment: '状态',
  })
  status: PurchaseStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'purchase_date',
    comment: '购买日期',
  })
  purchaseDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'expires_date',
    comment: '过期日期',
  })
  expiresDate: Date;

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
