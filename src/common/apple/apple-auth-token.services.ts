import { Injectable, BadRequestException } from '@nestjs/common';
import { sign, Algorithm, SignOptions } from 'jsonwebtoken';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { config } from '../../../config';

interface AppleTokenVerifyResult {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    id_token: string;
}


@Injectable()
export class AppleAuthTokenService {
    private clientId: string = config.apple.clientID;
    private teamID: string = config.apple.teamID;

    private authPrivateKeyPem: string;

    /** 缓存生成的 client_secret，避免频繁生成 */
    private clientSecretCache: string | null = null;

    /** client_secret 的过期时间戳（秒） */
    private clientSecretExpiresAt: number = 0;

    constructor(private readonly http: HttpService) {
        // 转换成 pem 格式
        const moreLine = config.apple.authKey
            .replace(/(.{64})/g, '$1\n'); // 每64字符添加换行

        // 前后添加 换行
        this.authPrivateKeyPem = `-----BEGIN PRIVATE KEY-----\n${moreLine}\n-----END PRIVATE KEY-----`;
    }


    /**
     * 生成 Apple client_secret（JWT）
     * @returns {string} 生成的 client_secret
     */
    private generateAppleClientSecret(): string {
        const now = Math.floor(Date.now() / 1000);

        // 检查缓存是否有效（提前 30 秒视为过期，确保网络传输过程中有效）
        if (this.clientSecretCache && now < this.clientSecretExpiresAt - 30) {
            return this.clientSecretCache;
        }

        const expiresIn = 600; // 10 分钟
        const exp = now + expiresIn;

        // 2. 配置 JWT 核心参数（Apple 强制要求格式）
        const payload = {
            iss: this.teamID, // 替换为你的 Team ID
            iat: now, // 当前时间戳（秒）
            exp: exp, // 有效期：10 分钟（建议 5-10 分钟，避免泄露风险）
            aud: 'https://appleid.apple.com', // 固定值：Apple 令牌服务地址
            sub: this.clientId // 替换为你的 Client ID（Bundle ID）
        };

        const options = {
            algorithm: 'ES256' as Algorithm,
            keyid: config.apple.keyID,
        }

        // 3. 生成并返回 client_secret（JWT 签名）
        let clientSecretCache = sign(payload, this.authPrivateKeyPem, options);

        this.clientSecretCache = clientSecretCache
        this.clientSecretExpiresAt = exp;

        return clientSecretCache;
    }

    // 兑换令牌（authorization_code 模式）
    async exchangeAppleToken(authCode: string): Promise<AppleTokenVerifyResult> {
        const clientSecret = this.generateAppleClientSecret();

        const data = new URLSearchParams();
        data.append('client_id', this.clientId);
        data.append('client_secret', clientSecret);
        data.append('code', authCode);
        data.append('grant_type', 'authorization_code');
        // data.append('redirect_uri', ''); // 只有 Web 登录才需要 redirect_uri，原生 App 不需要，或者必须与配置一致
        try {
            const response = await lastValueFrom(this.http.post('https://appleid.apple.com/auth/token', data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }));
            return response.data as AppleTokenVerifyResult;
        } catch (error) {
            console.error('Apple Auth Token Exchange Error:', error.response?.data || error.message);
            throw error;
        }
    }

    // 吊销token（refresh_token 模式）
    async revokeAppleToken(refreshToken: string): Promise<any> {
        const clientSecret = this.generateAppleClientSecret();

        const data = new URLSearchParams();
        data.append('client_id', this.clientId);
        data.append('client_secret', clientSecret);
        data.append('token', refreshToken);
        data.append('token_type_hint', 'refresh_token');

        try {
            await lastValueFrom(this.http.post('https://appleid.apple.com/auth/revoke', data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }));
        } catch (error) {
            console.error('Apple Auth Token Revoke Error:', error.response?.data || error.message);
            throw error;
        }
    }
}

