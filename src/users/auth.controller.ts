import {
  Controller,
  Post,
  Get,
  Body,
  Logger,
  UseInterceptors,
  Headers,
  UnauthorizedException,
  UseGuards,
  Request,
  BadRequestException,
  Delete,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';

import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';
// import { AuthGuard } from '@nestjs/passport';
import { Roles, SerializerClass, User, RSAFields } from '../common/decorators';
import { RolesGuard, RSAValidateGuard } from '../common/auth';
import { ROLE_USER } from '../common/constants';
import { RequestUser } from '../common/interfaces';
import { RSAService } from '../common/rsa/rsa.service';
import { UsersService } from './users.service';
import { UserRegistrationLogsService } from './user-registration-log.service';
import { AppleAuthService } from '../common/apple/apple-auth.services';
import { AppleAuthTokenService } from '../common/apple/apple-auth-token.services';

import {
  UserDto,
  UserDeleteResponseDto,
  // UserRegisterDto,
  // UserLoginDto,
  UserLoginResponseDto,
  // UserProfileDto,
  // UserRegisterDtoWithRSA,
  // UserLoginDtoWithRSA,
  UserAppleLoginDto,
  UserAppleLoginDtoWithRSA,
  UserGuestLoginDto,
  UserGuestLoginDtoWithRSA,
  UserType,
} from './dtos';


@Controller('api/users')
@ApiTags('users')
@UseInterceptors(SerializerInterceptor)
export class AuthController {
  private readonly logger = new Logger('app:UsersController');
  
  constructor(
    protected readonly service: UsersService,
    private readonly appleAuthService: AppleAuthService,
    private readonly appleAuthTokenService: AppleAuthTokenService,
    private readonly registerLogService: UserRegistrationLogsService,
  ) {}


  private generateRandomAppleEmail(): string {
    const randomStr = Math.random().toString(36).slice(-8);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // 获取 YYMMDD 格式日期
    return `apple${dateStr}${randomStr}@theone.io`;
  }

  @Post('/apple/login')
  @ApiOperation({
    summary: 'Apple 登录',
  })
  @RSAFields('authorizationCode')
  @UseGuards(RSAValidateGuard)
  @SerializerClass(UserLoginResponseDto)
  async appleLogin(@Body() dto: UserAppleLoginDto): Promise<UserLoginResponseDto> {

    const { appleToken, authorizationCode } = dto;


    // 校验 authorizationCode
    const [authorizationResponse, appleUser] = await Promise.all([
      this.appleAuthTokenService.exchangeAppleToken(authorizationCode),
      this.appleAuthService.verifyAndParseAppleToken(appleToken)
    ]);

    const appleSub = appleUser.userId;
    const updateEmail = appleUser.email;

    const updateUsername = appleUser.name
      ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim() : null;

    // find One
    const ins = await this.service.findOne({
      appleSub: appleSub,
    });

    if (ins) {
      return await this.service.appleLogin(appleSub, authorizationResponse.access_token, updateEmail, updateUsername);
    } else {

      // 检查注册日志
      const log = await this.registerLogService.findOne({ appleSub });
      // 如果存在记录，则不允许免费 VIP
      const allowFreeVip = !log;

      // fix 短期内 注销时无法重新注册
      const email = updateEmail || this.generateRandomAppleEmail();

      const ins = await this.service.appleRegister(appleSub, authorizationResponse.access_token, email, updateUsername, allowFreeVip);

      // 免费 VIP 注册，记录注册日志
      if (allowFreeVip) {
        await this.registerLogService.insert(
          ins.user.uid,
          ins.user.deviceId,
          appleSub,
        );
      }

      return ins
    }
  }


  @Post('/guest/login')
  @ApiOperation({
    summary: '游客登录',
  })
  @RSAFields('deviceId')
  @UseGuards(RSAValidateGuard)
  @SerializerClass(UserLoginResponseDto)
  async guestLogin(@Body() dto: UserGuestLoginDtoWithRSA): Promise<UserLoginResponseDto> {

    const { deviceId } = dto;

    // 校验 deviceId 是否为 UUID, 正则
    if (!deviceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(deviceId)) {
      throw new BadRequestException('deviceId 必须为有效的 UUID。');
    }

    // find One
    const ins = await this.service.findOne({
      deviceId: deviceId,
    });

    if (ins) {
      return await this.service.guestLogin(deviceId);
    } else {

      // 检查注册日志
      const log = await this.registerLogService.findOne({ deviceId });
      // 如果存在记录，则不允许免费 VIP
      const allowFreeVip = !log;

      const ins = await this.service.guestRegister(deviceId, allowFreeVip);

      // 免费 VIP 注册，记录注册日志
      if (allowFreeVip) {
        await this.registerLogService.insert(
          ins.user.uid,
          ins.user.deviceId,
          "",
        );
      }

      return ins
    }
  }

  @UseGuards(RolesGuard)
  @Delete('/delete')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '注销用户',
  })
  @Roles(ROLE_USER)
  @SerializerClass(UserDeleteResponseDto)
  async deleteUser(@User() user: RequestUser): Promise<UserDeleteResponseDto> {
    // 校验用户是否存在
    const ins = await this.service.findByUId(user.uid);
    if (!ins) {
      throw new Error("user not found");
    }

    // 如果是 apple 用户，校验 refresh token 是否有效
    if (ins.type === UserType.APPLE && ins.appleRefreshToken) {
      const refreshToken = ins.appleRefreshToken;
      // 执行吊销 token 操作
      await this.appleAuthTokenService.revokeAppleToken(refreshToken);
    }

    await this.service.deleteUser(user.uid);

    return {
      deleted: true,
    };
  }
}
