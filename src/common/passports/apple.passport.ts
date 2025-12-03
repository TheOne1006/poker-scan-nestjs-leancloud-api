import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-apple';
import { config } from '../../../config';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
    constructor() {
        super({
            clientID: config.apple.clientID,
            teamID: config.apple.teamID,
            keyID: config.apple.keyID,
            privateKeyString: config.apple.privateKeyString,
            callbackURL: config.apple.callbackURL,
            scope: ['name', 'email'],
        });
    }

    validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): void {
        // 处理用户信息验证逻辑
        const user = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            accessToken,
            refreshToken,
        };
        done(null, user);
    }
}
