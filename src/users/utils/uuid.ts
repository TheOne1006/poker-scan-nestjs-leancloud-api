import { createHash } from 'crypto';

// 定义UUID命名空间（官方预定义或自定义）
const NAMESPACE_UUID = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'; // 官方URL命名空间

/**
 * 基于crypto生成UUID v5（固定输入→固定输出）
 * @param name 名称（字符串，如"user:123"）
 * @param namespace 命名空间UUID
 */
export function generateFixedUuid(name: string, namespace: string = NAMESPACE_UUID): string {
    // 1. 将命名空间UUID转换为16字节缓冲区
    const namespaceBuffer = Buffer.from(namespace.replace(/-/g, ''), 'hex');

    // 2. 组合命名空间和名称（UTF-8编码）
    const nameBuffer = Buffer.from(name, 'utf8');
    const combined = Buffer.concat([namespaceBuffer, nameBuffer]);

    // 3. 用SHA-1哈希（v5规范）
    const hash = createHash('sha1').update(combined).digest();

    // 4. 按照UUID格式处理哈希结果（取前16字节）
    const bytes = hash.subarray(0, 16);

    // 5. 设置UUID版本和变体（v5的标识位）
    bytes[6] = (bytes[6] & 0x0f) | 0x50; // 版本5
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC4122变体

    // 6. 转换为UUID字符串格式
    return [
        bytes.subarray(0, 4).toString('hex'),
        bytes.subarray(4, 6).toString('hex'),
        bytes.subarray(6, 8).toString('hex'),
        bytes.subarray(8, 10).toString('hex'),
        bytes.subarray(10, 16).toString('hex'),
    ].join('-');
}