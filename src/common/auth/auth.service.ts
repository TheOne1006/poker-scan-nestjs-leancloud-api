import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
// import * as Redis from 'ioredis';
// import { RedisService } from 'nestjs-redis';
import { RequestUser } from '../interfaces';
import { UserProfileDto } from '../../users/dtos';


/**
 * 用户认证
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 检查 token
   *
   * @param  {string} token
   * @param  {string} ip
   * @returns Promise
   */
  async check(token: string, ip: string): Promise<RequestUser> {
    const user = {
      uid: null,
      username: '',
      email: '',
      roles: [],
      ip,
      token,
    } as RequestUser;

    if (!token) {
      return user;
    }

    try {
      const currentUser = await this.verify(token);
      user.uid = currentUser.uid;
      user.username = currentUser.username;
      user.email = currentUser.email;
      // todo check roles
      // const roles = await currentUser.getRoles();
      user.roles = ['user'];
    } catch (error) {
      this.logger.error('decode error with:', token, ip);
    }
    return user;
  }

  async verify(token: string): Promise<UserProfileDto> {
    const decoded = await this.jwtService.verify(token);
    return {
      username: decoded.username,
      email: decoded.email,
      deviceId: decoded.deviceId,
      isVip: decoded.isVip,
      vipExpireAt: decoded.vipExpireAt,
      uid: decoded.uid,
      type: decoded.type,
    };
  }


  async sign(user: UserProfileDto): Promise<string> {
    return this.jwtService.sign({
      username: user.username,
      email: user.email,
      deviceId: user.deviceId,
      isVip: user.isVip,
      vipExpireAt: user.vipExpireAt,
      uid: user.uid,
      type: user.type,
    });
  }
}
