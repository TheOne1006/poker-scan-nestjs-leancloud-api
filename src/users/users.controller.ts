import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Logger,
  UseInterceptors,
  Headers,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';

import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';

import { Roles, SerializerClass, User, RSAFields } from '../common/decorators';
import { RolesGuard, RSAValidateGuard } from '../common/auth';
import { ROLE_USER } from '../common/constants';
import { RequestUser } from '../common/interfaces';
import { UsersService } from './users.service';

import {
  UserDto,
  UserRegisterDto,
  UserLoginDto,
  UserLoginResponseDto,
  UserProfileDto,
  UserRegisterDtoWithRSA,
  UserLoginDtoWithRSA,
  UserDeleteResponseDto,
} from './dtos';


@Controller('api/users')
@ApiTags('users')
@UseInterceptors(SerializerInterceptor)
export class UsersController {
  private readonly logger = new Logger('app:UsersController');
  
  constructor(
    protected readonly service: UsersService,
  ) {}

  @Post('/register')
  @ApiOperation({
    summary: '用户注册',
  })
  @RSAFields('username', 'email', 'password')
  @UseGuards(RSAValidateGuard)
  @SerializerClass(UserLoginResponseDto)
  async register(@Body() dto: UserRegisterDtoWithRSA): Promise<UserLoginResponseDto> {
    // 解析
    const { rsaData, ...registerDtoWithoutRSA } = dto;

    return await this.service.register(registerDtoWithoutRSA);
  }

  @Post('/login')
  @ApiOperation({
    summary: '用户登录',
  })
  @RSAFields('email', 'password')
  @UseGuards(RSAValidateGuard)
  @SerializerClass(UserLoginResponseDto)
  async login(@Body() dto: UserLoginDtoWithRSA): Promise<UserLoginResponseDto> {
    const { rsaData, ...loginDtoWithoutRSA } = dto;

    try {
      return await this.service.login(loginDtoWithoutRSA);
    } catch (error) {
      this.logger.error("login failed", error);
      throw new Error("login failed");
    }
  }


  @UseGuards(RolesGuard)
  @Get('/profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '获取用户信息',
  })
  @Roles(ROLE_USER)
  @SerializerClass(UserProfileDto)
  async getProfile(@User() user: RequestUser): Promise<UserProfileDto> {
    let userIns = await this.service.findByUId(user.uid);

    let payload = this.service.genUserProfile(userIns)

    return payload;
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
    await this.service.deleteUser(user.uid);
    return {
      deleted: true,
    };
  }
}
