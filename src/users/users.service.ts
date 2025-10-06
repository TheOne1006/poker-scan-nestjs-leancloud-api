import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AV } from '../common/leancloud';
import { AuthService } from '../common/auth/auth.service';
import { LeanCloudBaseService } from '../common/leancloud';
import {
  UserDto,
  UserRegisterDto,
  UserLoginDto,
  UserLoginResponseDto,
  UserProfileDto,
  UserRegisterOnServerDto,
  UserOnServerDto,
  UserType,
} from './dtos';

const MODEL_NAME = 'app_users';

// 注册之后免费 3 天
const FREE_VIP_DAYS = 3;

@Injectable()
export class UsersService extends LeanCloudBaseService<
  UserDto,
  UserRegisterOnServerDto,
  UserProfileDto
> {
  private readonly logger = new Logger('app:UsersService');

  constructor(
    private readonly authService: AuthService,
  ) {
    super(MODEL_NAME);
  }

  // 密码加密
  async encryptPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  // 根据 salt 校验密码
  async verifyPassword(password: string, salt: string, hashedPassword: string): Promise<boolean> {
    return await this.encryptPassword(password, salt) === hashedPassword;
  }

  /**
   * 计算过期时间
   * @param expiredDays 天数
   * @returns Date
   * 1. 如果 vipExpireAt 存在，如果小于当前时间使用当前时间，如果 > 当前时间
   * 2. vip 到期时间 + N 天
   * 3. 强制将 vip 时间改为当前的 23:59:55 秒
   */
  private genExpiredAt(expiredDays: number,  vipExpireAt?: Date): Date {

    let startAt = new Date();

    // 如果 vipExpireAt 存在，如果小于当前时间使用当前时间，如果 > 当前时间
    if (vipExpireAt && vipExpireAt.getTime() > startAt.getTime()) {
      startAt = vipExpireAt;
    }

    // 使用 setDate 逐日增加，避免 DST/时区带来的偏差
    const expireAt = new Date(startAt);
    expireAt.setDate(expireAt.getDate() + expiredDays);

    // 将时间强制设为当天的 23:59:55
    expireAt.setHours(23, 59, 55, 0);

    return expireAt
  }

  // genUserProfile
  private genUserProfile(userIns: (AV.Queriable & UserDto)): UserProfileDto {
    return {
      id: userIns.id,
      username: userIns.get('username'),
      email: userIns.get('email'),
      isVip: userIns.get('isVip'),
      vipExpireAt: userIns.get('vipExpireAt'),
      deviceId: userIns.get('deviceId'),
    }
  }

  // 注册
  async register(registerDto: UserRegisterDto): Promise<UserLoginResponseDto> {
    // email 是否存在
    const query = new AV.Query(MODEL_NAME);
    query.equalTo('email', registerDto.email);
    const queryIns = await query.first();
    if (queryIns) {
      throw new Error("email already exists");
    }

    // 加密密码
    const salt = bcrypt.genSaltSync(10);

    const vipExpireAt = this.genExpiredAt(FREE_VIP_DAYS);

    const registerDtoWithEncryptedPassword = {
      ...registerDto,
      password: await this.encryptPassword(registerDto.password, salt),
      salt,
      type: UserType.EMAIL,
      isVip: true,
      vipExpireAt,
      appleSub: "",
      deviceId: ""
    } as UserRegisterOnServerDto;

    // 创建用户
    try {
      const ins = await this.create(registerDtoWithEncryptedPassword);

      const payload = this.genUserProfile(ins);
      // 生成token
      const token = await this.authService.sign(payload);
      return {
        user: payload,
        token,
      };
    } catch (error) {
      this.logger.error("create user failed", error);
      throw new Error("create user failed");
    }
  }

  /**
   * apple 注册
   * @param appleSub apple sub
   * @param email 更新的邮箱
   * @param username 更新的用户名
   * @returns 
   */
  async appleRegister(appleSub: string, email: string, username: string): Promise<UserLoginResponseDto> {
    // email 是否存在
    const query = new AV.Query(MODEL_NAME);
    query.equalTo('appleSub', appleSub);
    const queryIns = await query.first();
    if (queryIns) {
      throw new Error("appleSub already exists");
    }

    let appleUsername = username;
    if (!appleUsername) {
      appleUsername = this.generateRandomUsername("Apple");
    }

    const vipExpireAt = this.genExpiredAt(FREE_VIP_DAYS);

    const appleRegData = {
      appleSub,
      email,
      username: appleUsername,
      type: UserType.APPLE,
      salt: '',
      password: '',
      deviceId: '',
      isVip: true,
      vipExpireAt,
    } as UserRegisterOnServerDto;

    // create user
    try {
      const ins = await this.create(appleRegData);

      const payload = this.genUserProfile(ins);
      // 生成token
      const token = await this.authService.sign(payload);
      return {
        user: payload,
        token,
      };
    } catch (error) {
      this.logger.error("create user failed", error);
      throw new Error("create user failed");
    }
  }

  /**
   * apple 登录
   * @param appleSub apple sub
   * @param updateEmail 更新的邮箱
   * @param updateUsername 更新的用户名
   * @returns UserLoginResponseDto
   */
  async appleLogin(appleSub: string, updateEmail: string, updateUsername: string): Promise<UserLoginResponseDto> {
    const ins = await this.findOne({
      appleSub: appleSub,
    });
    // if not found, throw error
    if (!ins) {
      throw new Error("user not found");
    }

    // 如果与 ins 不一致，则更新
    if (ins.get('email') !== updateEmail || ins.get('username') !== updateUsername) {
      ins.set('email', updateEmail);
      ins.set('username', updateUsername);
      await ins.save();
    }

    const payload = {
      id: ins.id,
      username: ins.get('username'),
      email: ins.get('email'),
    } as UserProfileDto;

    const token = await this.authService.sign(payload);

    return {
      user: payload,
      token,
    };
  }

  // 生成随机用户名
  private generateRandomUsername(prefix="游客"): string {
    const randomStr = Math.random().toString(36).slice(-8);
    return `${prefix}${randomStr}`;
  }

  /**
   * 游客 注册
   * @param deviceId string 设备id
   * @returns 
   */
  async guestRegister(deviceId: string): Promise <UserLoginResponseDto> {
    // email 是否存在
    const query = new AV.Query(MODEL_NAME);
    query.equalTo('deviceId', deviceId);
    const queryIns = await query.first();
    if(queryIns) {
      throw new Error("deviceId already exists");
    }

    let username = this.generateRandomUsername("游客")

    const vipExpireAt = this.genExpiredAt(FREE_VIP_DAYS);
    // create user
    try {
        const ins = await this.create({
          salt: "",
          type: UserType.GUEST,
          appleSub: "",
          deviceId: deviceId,
          username: username,
          email: "",
          password: "",
          isVip: true,
          vipExpireAt: vipExpireAt,
        });

        const payload = this.genUserProfile(ins);
        // 生成token
        const token = await this.authService.sign(payload);
        return {
          user: payload,
          token,
        };
      } catch(error) {
        this.logger.error("create user failed", error);
        throw new Error("create user failed");
      }
  } 


  /**
   * guest 登录
   * @param appleLoginDto apple 登录信息
   * @returns 
   */
  async guestLogin(deviceId: string): Promise<UserLoginResponseDto> {
    const ins = await this.findOne({
      deviceId: deviceId,
    });
    // if not found, throw error
    if (!ins) {
      throw new Error("user not found");
    }

    const payload = this.genUserProfile(ins);

    const token = await this.authService.sign(payload);

    return {
      user: payload,
      token,
    };
  }



  // 登录
  async login(loginDto: UserLoginDto): Promise<UserLoginResponseDto> {
    const ins = await this.findOne({
      email: loginDto.email,
    });
    if (!ins) {
      throw new Error("user not found");
    }

    // 校验密码
    const inputPassword = loginDto.password;
    const salt = ins.get('salt');
    const passwordInDB = ins.get('password');

    const isPasswordValid = await this.verifyPassword(inputPassword, salt, passwordInDB);
    if (!isPasswordValid) {
      throw new Error("invalid password");
    }

    const payload = this.genUserProfile(ins);

    const token = await this.authService.sign(payload);

    return {
      user: payload,
      token,
    };
  }


  // async create(createDto: UserRegisterDto): Promise<AV.Queriable & UserDto> {
  //   throw new Error("not implemented");
  // }

  async updateByPk(pk: string, updateDto: UserProfileDto): Promise<AV.Queriable & UserDto> {
    throw new Error("not implemented");
  }
}
