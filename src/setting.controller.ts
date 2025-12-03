import { Controller, Get, UseInterceptors } from '@nestjs/common';
// import { join } from 'path';

import { SerializerClass } from './common/decorators';
import { SerializerInterceptor } from './common/interceptors/serializer.interceptor';


class SettingDto {
    announcement: String
}

@Controller('/api/settings')
@UseInterceptors(SerializerInterceptor)
export class SettingController {
    @Get()
    @SerializerClass(SettingDto)
    getSettings(): SettingDto {
        return {
            // 通告
            announcement: "",
        }
    }
}
