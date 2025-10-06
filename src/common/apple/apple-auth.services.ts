import { Injectable, BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { config } from '../../../config';



interface AppleUserByToken {
    userId: string;
    email: string;
    emailVerified: boolean;
    issuer: string;
    issuedAt: Date;
    expiresAt: Date;
    name?: {
        firstName?: string;
        lastName?: string;
    };
}

@Injectable()
export class AppleAuthService {
    private clientId: string = config.apple.clientID;
    // Apple的公钥获取端点
    private jwksClient = new JwksClient({
        jwksUri: 'https://appleid.apple.com/auth/keys',
        // 缓存
        cache: true,
        cacheMaxAge: 600000 * 2, // 20 分钟 (默认值)
        // 限流
        rateLimit: true,
        // 每分钟请求次数
        jwksRequestsPerMinute: 10
    });

    // 获取用于验证JWT签名的公钥
    private async getApplePublicKey(kid: string): Promise<string> {
        try {
            const key = await this.jwksClient.getSigningKey(kid);
            return key.getPublicKey();
        } catch (error) {
            throw new BadRequestException('无法获取Apple公钥，验证失败');
        }
    }

    // 验证并解析Apple的id_token
    async verifyAndParseAppleToken(idToken: string): Promise<AppleUserByToken> {
        if (!idToken) {
            throw new BadRequestException('缺少Apple ID令牌');
        }

        try {
            // 先解码未验证的token以获取header中的kid（用于查找对应的公钥）
            const decodedHeader = jwt.decode(idToken, { complete: true })?.header;
            if (!decodedHeader?.kid) {
                throw new BadRequestException('无效的Apple令牌格式');
            }

            // 获取对应的公钥
            const publicKey = await this.getApplePublicKey(decodedHeader.kid);

            // 验证并解析token
            const payload = jwt.verify(idToken, publicKey, {
                algorithms: ['RS256'], // Apple使用RS256算法签名
                issuer: 'https://appleid.apple.com', // 验证发行者必须是Apple
                audience: this.clientId, // 验证受众必须是你的服务ID（clientID）
            }) as any;

            // 返回解析后的用户信息
            return {
                userId: payload.sub, // Apple用户唯一标识
                email: payload.email, // 用户邮箱（仅首次授权返回）
                emailVerified: payload.email_verified,
                issuer: payload.iss,
                issuedAt: new Date(payload.iat * 1000),
                expiresAt: new Date(payload.exp * 1000),
                name: payload.name,
            } as AppleUserByToken;
        } catch (error) {
            throw new BadRequestException(`Apple令牌验证失败: ${error.message}`);
        }
    }
}

