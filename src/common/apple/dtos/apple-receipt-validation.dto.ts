


export enum AppleEnvironment {
  PRODUCTION = 'production',
  SANDBOX = 'sandbox'
}


/**
 * Apple 收据验证响应接口
 * 根据 Apple 官方文档定义的标准响应格式
 */
export interface AppleReceiptValidationResponse {
  status: number; // 状态码，0表示成功
  environment: 'Sandbox' | 'Production'; // 环境标识
  receipt: {
    receipt_type: 'ProductionSandbox' | 'Production'; // 收据类型
    adam_id: number; // App Store Connect 中的应用ID
    app_item_id: number; // App 的唯一标识符
    bundle_id: string; // 应用的Bundle ID
    application_version: string; // 应用版本号
    download_id: number; // 下载事务的唯一标识符
    version_external_identifier: number; // 应用的外部版本标识符
    receipt_creation_date: string; // 收据创建日期
    receipt_creation_date_ms: string; // 收据创建日期（毫秒）
    receipt_creation_date_pst: string; // 收据创建日期（PST时区）
    request_date: string; // 请求日期
    request_date_ms: string; // 请求日期（毫秒）
    request_date_pst: string; // 请求日期（PST时区）
    original_purchase_date: string; // 原始购买日期
    original_purchase_date_ms: string; // 原始购买日期（毫秒）
    original_purchase_date_pst: string; // 原始购买日期（PST时区）
    original_application_version: string; // 原始应用版本
    in_app: InAppPurchase[]; // 内购交易数组
  };
  latest_receipt_info?: InAppPurchase[]; // 最新收据信息（主要用于订阅）
  latest_receipt?: string; // 最新收据数据（Base64编码）
  pending_renewal_info?: PendingRenewalInfo[]; // 待续订信息（仅订阅）
}

/**
 * 内购交易信息接口
 * 包含每个内购交易的详细信息
 */
export interface InAppPurchase {
  quantity: string; // 购买数量
  product_id: string; // 产品ID
  transaction_id: string; // 交易ID
  original_transaction_id: string; // 原始交易ID
  purchase_date: string; // 购买日期
  purchase_date_ms: string; // 购买日期（毫秒）
  purchase_date_pst: string; // 购买日期（PST时区）
  original_purchase_date: string; // 原始购买日期
  original_purchase_date_ms: string; // 原始购买日期（毫秒）
  original_purchase_date_pst: string; // 原始购买日期（PST时区）
  expires_date?: string; // 过期日期（仅订阅产品）
  expires_date_ms?: string; // 过期日期（毫秒，仅订阅产品）
  expires_date_pst?: string; // 过期日期（PST时区，仅订阅产品）
  web_order_line_item_id?: string; // Web订单行项目ID
  is_trial_period?: string; // 是否为试用期（"true"或"false"）
  is_in_intro_offer_period?: string; // 是否为介绍性优惠期
  cancellation_date?: string; // 取消日期
  cancellation_date_ms?: string; // 取消日期（毫秒）
  cancellation_date_pst?: string; // 取消日期（PST时区）
  cancellation_reason?: string; // 取消原因
}

/**
 * 待续订信息接口
 * 用于订阅产品的续订状态跟踪
 */
export interface PendingRenewalInfo {
  product_id: string; // 产品ID
  original_transaction_id: string; // 原始交易ID
  auto_renew_product_id: string; // 自动续订产品ID
  auto_renew_status: string; // 自动续订状态（"0"关闭，"1"开启）
  expiration_intent?: string; // 过期意图（取消原因）
  grace_period_expires_date?: string; // 宽限期过期日期
  grace_period_expires_date_ms?: string; // 宽限期过期日期（毫秒）
  grace_period_expires_date_pst?: string; // 宽限期过期日期（PST时区）
  is_in_billing_retry_period?: string; // 是否在计费重试期
  offer_code_ref_name?: string; // 优惠代码引用名称
  price_increase_status?: string; // 价格上涨状态
  promotional_offer_id?: string; // 促销优惠ID
}

/**
 * 验证结果接口
 * 统一的验证结果格式
 */
export interface PurchaseValidationResult {
  isValid: boolean; // 是否有效
  transactionId: string; // 交易ID
  productId: string; // 产品ID
  purchaseDate: Date; // 购买日期
  expiresDate?: Date; // 过期日期（仅订阅）
  originalTransactionId: string; // 原始交易ID
  isSubscription: boolean; // 是否为订阅产品
  environment: AppleEnvironment; // 环境
  bundleId: string; // Bundle ID
  errorMessage?: string; // 错误信息
}

/**
 * 恢复购买结果接口
 * 恢复购买操作的结果格式
 */
export interface RestorePurchasesResult {
  isValid: boolean; // 恢复是否成功
  purchases: PurchaseValidationResult[]; // 恢复的购买记录
  errorMessage?: string; // 错误信息
}