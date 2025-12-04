import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';


export class UserAppleLoginDto {
    @ApiProperty({
        example: 'appleTokenxxxx',
        description: 'appleToken',
    })
    @IsNotEmpty()
    @IsString()
    appleToken: string;


    @ApiProperty({
        example: 'code',
        description: 'authorizationCode',
    })
    @IsNotEmpty()
    @IsString()
    authorizationCode: string;

}


export class UserAppleLoginDtoWithRSA extends UserAppleLoginDto {
    @ApiProperty({
        example: 'xxxxxxx',
        description: 'RSA 加密的数据, 格式为: {"appleToken":"xxxxx"}',
    })
    @IsNotEmpty()
    @IsString()
    rsaData: string;
}


export class UserGuestLoginDto {
    @ApiProperty({
        example: 'ios-xxxxxx',
        description: '设备 id',
    })
    @IsNotEmpty()
    @IsString()
    deviceId: string;
}


export class UserGuestLoginDtoWithRSA extends UserGuestLoginDto {
    @ApiProperty({
        example: 'xxxxxxx',
        description: 'RSA 加密的数据, 格式为: {"appleToken":"xxxxx"}',
    })
    @IsNotEmpty()
    @IsString()
    rsaData: string;
}
