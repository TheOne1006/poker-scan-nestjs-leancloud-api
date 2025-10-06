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
import { AppleAuthService } from '../common/auth/apple-auth.services';

import {
  UserDto,
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
    private readonly rsaService: RSAService,
  ) {}

  @Post('/apple/login')
  @ApiOperation({
    summary: 'Apple 登录',
  })
  @SerializerClass(UserLoginResponseDto)
  async appleLogin(@Body() dto: UserAppleLoginDto): Promise<UserLoginResponseDto> {

    const { appleToken } = dto;

    const appleUser = await this.appleAuthService.verifyAndParseAppleToken(appleToken);
    const appleSub = appleUser.userId;
    const updateEmail = appleUser.email;
    const updateUsername = appleUser.name
      ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim() : null;

    // find One
    const ins = await this.service.findOne({
      appleSub: appleSub,
    });

    if (ins) {
      return await this.service.appleLogin(appleSub, updateEmail, updateUsername);
    } else {
      return await this.service.appleRegister(appleSub, updateEmail, updateUsername);
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
      return await this.service.guestRegister(deviceId);
    }
  }


  // @Get('/apple/callback')
  // @UseGuards(AuthGuard('apple'))
  // appleCallback(@Request() req) {
  //   // 处理回调逻辑，返回用户信息或生成令牌
  //   return req.user;
  // }

}
