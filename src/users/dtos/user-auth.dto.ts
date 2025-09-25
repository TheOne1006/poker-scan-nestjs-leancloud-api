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
