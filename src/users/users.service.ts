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
} from './dtos';

const MODEL_NAME = 'app_users';

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

    const registerDtoWithEncryptedPassword = {
      ...registerDto,
      password: await this.encryptPassword(registerDto.password, salt),
      salt,
    } as UserRegisterOnServerDto;

    // 创建用户
    try {
      const ins = await this.create(registerDtoWithEncryptedPassword);

      const payload = {
        id: ins.id,
        username: ins.get('username'),
        email: ins.get('email'),
      } as UserProfileDto;
      // 生成token
      const token = await this.authService.sign(payload);
      return {
        ...payload,
        token,
      };
    } catch (error) {
      this.logger.error("create user failed", error);
      throw new Error("create user failed");
    }
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

    const payload = {
      id: ins.id,
      username: ins.get('username'),
      email: ins.get('email'),
    } as UserProfileDto;

    const token = await this.authService.sign(payload);

    return {
      ...payload,
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
