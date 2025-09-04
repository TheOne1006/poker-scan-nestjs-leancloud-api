import { IsObject } from 'class-validator';

export class AnyDto {
    // 验证请求体必须是对象（可选，根据需求添加）
    [key: string]: any;
}