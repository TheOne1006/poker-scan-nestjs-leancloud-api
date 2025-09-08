import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
// 导入RxJS的转换工具
import { firstValueFrom } from 'rxjs';
import { config } from '../../../config';
import { DifyChatResDto } from './dtos';


@Injectable()
export class DifyService {
    private token: string;
    private baseUrl: string;

    /**
     * @param logger 日志服务
     */
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
        private readonly httpService: HttpService,
    ) {
        this.baseUrl = config.dify.baseUrl;
        this.token = config.dify.token;
    }


    async chat(question: string, userId: string, conversationId: string = ''): Promise<DifyChatResDto> {

        let data: Record<string, any> = {
            response_mode: 'blocking',
            inputs: {},
            query: question,
            user: userId,
            conversationId,
        };

        // prediction
        try {
            // 使用firstValueFrom将Observable转换为Promise
            const response = await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/v1/chat-messages`, data, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json', // 补充请求头（可选，根据接口要求）
                    },
                })
            );

            // response是AxiosResponse对象，实际数据在response.data中
            return response.data;
        } catch (error) {
            this.logger.error('Dify chat request failed', error.stack);
            throw new Error(`调用Dify接口失败: ${error.message}`);
        }
    }
}
