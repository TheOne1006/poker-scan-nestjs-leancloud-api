import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { generateFixedUuid } from './utils';
import { AuthService } from '../common/auth/auth.service';
import {
  UserDto,
  UserRegisterDto,
  UserLoginDto,
  UserLoginResponseDto,
  UserProfileDto,
  UserRegisterOnServerDto,
  UserOnServerDto,
} from './dtos';
import { User, UserType } from './users.entity';

const MODEL_NAME = 'app_users';
// RFC4122 URL namespace for UUID v5
// const UUID_V5_NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

// 注册之后免费 3 天
const FREE_VIP_DAYS = 3;

@Injectable()
export class UsersService {
  private readonly logger = new Logger('app:UsersService');

  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly authService: AuthService,
  ) {}

  async findOne(where: any): Promise<User> {
    return this.userModel.findOne({ where });
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
  genUserProfile(userIns: User): UserProfileDto {
    return {
      username: userIns.username,
      email: userIns.email,
      isVip: userIns.isVip,
      vipExpireAt: userIns.vipExpireAt,
      deviceId: userIns.deviceId,
      uid: userIns.uid,
      type: userIns.type as any
    }
  }

  // 注册
  async register(registerDto: UserRegisterDto): Promise<UserLoginResponseDto> {
    // email 是否存在
    const existingUser = await this.userModel.findOne({
      where: { email: registerDto.email }
    });
    
    if (existingUser) {
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
      appleSub: undefined,
      deviceId: undefined,
      uid: generateFixedUuid(registerDto.email)
    };

    // 创建用户
    try {
      const ins = await this.userModel.create(registerDtoWithEncryptedPassword);

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
   * @param refreshToken apple refresh token
   * @param email 更新的邮箱
   * @param username 更新的用户名
   * @returns 
   */
  async appleRegister(appleSub: string,
     refreshToken: string, email: string, username: string): Promise<UserLoginResponseDto> {
    // email 是否存在
    const existingUser = await this.userModel.findOne({
      where: { appleSub: appleSub }
    });

    if (existingUser) {
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
      appleRefreshToken: refreshToken,
      password: '',
      deviceId: undefined,
      isVip: true,
      vipExpireAt,
      uid: generateFixedUuid(appleSub)
    };

    // create user
    try {
      const ins = await this.userModel.create(appleRegData);

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
   * @param refreshToken apple refresh token
   * @param updateEmail 更新的邮箱
   * @param updateUsername 更新的用户名
   * @returns UserLoginResponseDto
   */
  async appleLogin(appleSub: string, refreshToken: string, updateEmail: string, updateUsername: string): Promise<UserLoginResponseDto> {
    const ins = await this.userModel.findOne({
      where: { appleSub: appleSub }
    });

    // if not found, throw error
    if (!ins) {
      throw new Error("user not found");
    }

    let needUpdate = false;
    // 如果与 ins 不一致，则更新
    if (ins.email !== updateEmail) {
      ins.email = updateEmail;
      needUpdate = true;
      // ins.username = updateUsername;
    }
    if (refreshToken && ins.appleRefreshToken !== refreshToken) {
      ins.appleRefreshToken = refreshToken;
      needUpdate = true;
    }
    if (updateUsername && ins.username !== updateUsername) {
      ins.username = updateUsername;
      needUpdate = true;
    }

    if (needUpdate === true) {
      await ins.save();
    }

    const payload = this.genUserProfile(ins);

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

  private generateRandomEmail(): string {
    const randomStr = Math.random().toString(36).slice(-8);

    return `pokerscan${randomStr}@theone.io`;
  }

  /**
   * 游客 注册
   * @param deviceId string 设备id
   * @returns 
   */
  async guestRegister(deviceId: string): Promise <UserLoginResponseDto> {
    // email 是否存在
    const existingUser = await this.userModel.findOne({
      where: { deviceId: deviceId }
    });
    
    if(existingUser) {
      throw new Error("deviceId already exists");
    }

    let username = this.generateRandomUsername("游客")
    let email = this.generateRandomEmail();

    const vipExpireAt = this.genExpiredAt(FREE_VIP_DAYS);
    // create user
    try {
        const ins = await this.userModel.create({
          salt: "",
          type: UserType.GUEST,
          appleSub: undefined,
          deviceId: deviceId,
          username: username,
          email: email,
          password: "",
          isVip: true,
          vipExpireAt: vipExpireAt,
          uid: generateFixedUuid(email),
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
    const ins = await this.userModel.findOne({
      where: { deviceId: deviceId }
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
    const ins = await this.userModel.findOne({
      where: { email: loginDto.email }
    });
    
    if (!ins) {
      throw new Error("user not found");
    }

    // 校验密码
    const inputPassword = loginDto.password;
    const salt = ins.salt;
    const passwordInDB = ins.password;

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

  async findByUId(uid: string): Promise<User> {
    return this.userModel.findOne({
      where: { uid }
    });
  }


  async updateVipDate(ins: User, vipDays: number): Promise<User> {

    let currentExpireAt = new Date()

    try {
      // Sequelize date field is already a Date object
      if (ins.vipExpireAt) {
        currentExpireAt = ins.vipExpireAt;
      }
    } catch (error) {
      this.logger.error("get expire date failed", error);
    }

    const nextExpireAt = this.genExpiredAt(vipDays, currentExpireAt);
    ins.vipExpireAt = nextExpireAt;
    ins.isVip = true;
    
    // save instance
    await ins.save();

    return ins;
  }

  // 注销用户
  async deleteUser(uid: string): Promise<void> {
    const user = await this.findByUId(uid);
    if (user) {
      await user.destroy();
    }
  }
}
