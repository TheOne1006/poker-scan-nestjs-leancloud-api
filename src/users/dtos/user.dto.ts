import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';



export enum UserType {
  EMAIL = 'email',
  APPLE = 'apple', 
  GUEST ='guest',
}



export class UserDto {
  @Expose({
    name: 'objectId',
  })
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  deviceId: String;

  @Expose()
  isVip: boolean;

  @Expose() // vip 到期时间
  vipExpireAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class UserRegisterDto {
  @ApiProperty({
    example: 'user123',
    description: '用户名',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: '邮箱',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: '密码',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class UserRegisterDtoWithRSA extends UserRegisterDto {
  @ApiProperty({
    example: 'xxxxxxx',
    description: 'RSA 加密的数据, 格式为: {"username":"user123","email":"user@example.com","password":"password123"}',
  })
  @IsNotEmpty()
  @IsString()
  rsaData: string;
}

export class UserRegisterOnServerDto extends UserRegisterDto {
  salt: string;
  // 用户类型
  type: UserType;
  // apple 的 唯一标识
  appleSub: string;
  // 设备id
  deviceId: string;

  isVip: boolean;
  vipExpireAt: Date;
}

export class UserOnServerDto extends UserDto {
  salt: string;
  password: string;
  type: UserType;
  appleSub: string;
}


export class UserLoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '邮箱',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: '密码',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

}

export class UserLoginDtoWithRSA extends UserLoginDto {
  @ApiProperty({
    example: 'xxxxxxx',
    description: 'RSA 加密的数据, 格式为: {"email":"user@example.com","password":"password123"}',
  })
  @IsNotEmpty()
  @IsString()
  rsaData: string;
}



export class UserProfileDto {
  // @Expose({
  //   name: 'objectId',
  // })
  @Expose()
  @Transform(({ obj }) => obj.objectId || obj.id)
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose() // vip 到期时间
  vipExpireAt: Date;

  @Expose()
  isVip: boolean;

  @Expose()
  deviceId: string;
}


export class UserLoginResponseDto {
  @Expose()
  @Type(() => UserProfileDto)
  user: UserProfileDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '访问令牌',
  })
  token: string;
}