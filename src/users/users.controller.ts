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
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';

import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';
import { Roles, SerializerClass, User } from '../common/decorators';
import { RolesGuard } from '../common/auth';
import { ROLE_USER } from '../common/constants';
import { RequestUser } from '../common/interfaces';
import { RSAService } from '../common/rsa/rsa.service';
import { UsersService } from './users.service';

import {
  UserDto,
  UserRegisterDto,
  UserLoginDto,
  UserLoginResponseDto,
  UserProfileDto,
  UserRegisterDtoWithRSA,
  UserLoginDtoWithRSA,
} from './dtos';


@Controller('api/users')
@ApiTags('users')
@UseInterceptors(SerializerInterceptor)
export class UsersController {
  private readonly logger = new Logger('app:UsersController');
  
  constructor(
    protected readonly service: UsersService,
    private readonly rsaService: RSAService,
  ) {}

  @Post('/register')
  @ApiOperation({
    summary: '用户注册',
  })
  @SerializerClass(UserLoginResponseDto)
  async register(@Body() dto: UserRegisterDtoWithRSA): Promise<UserLoginResponseDto> {
    // 解析
    const { rsaData, ...registerDtoWithoutRSA } = dto;
    const isRSAValid = this.rsaService.checkDataWithRSA(registerDtoWithoutRSA, rsaData);
    if (!isRSAValid) {
      throw new Error('RSA 数据验证失败');
    }

    return await this.service.register(registerDtoWithoutRSA);
  }

  @Post('/login')
  @ApiOperation({
    summary: '用户登录',
  })
  @SerializerClass(UserLoginResponseDto)
  async login(@Body() dto: UserLoginDtoWithRSA): Promise<UserLoginResponseDto> {
    const { rsaData, ...loginDtoWithoutRSA } = dto;
    const isRSAValid = this.rsaService.checkDataWithRSA(loginDtoWithoutRSA, rsaData);
    if (!isRSAValid) {
      throw new Error('RSA 数据验证失败');
    }

    return await this.service.login(loginDtoWithoutRSA);
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
    const fixFormatUserIns = { 
      id: user.id,
      username: user.username,
      email: user.email,
    } as UserProfileDto;
    return fixFormatUserIns as UserProfileDto;
  }
}
