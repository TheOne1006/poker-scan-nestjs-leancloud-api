import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { FlowiseClient } from 'flowise-sdk'
import type { PredictionData } from 'flowise-sdk/dist/flowise-sdk'
// import type { PredictionData } from 'flowise-sdk'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { config } from '../../../config';



@Injectable()
export class FlowiseService {
    private client: FlowiseClient;
    private chatflowId: string;

    /**
     * @param logger 日志服务
     */
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
    ) { 
        this.chatflowId = config.flowise.chatflowId;
        const client = new FlowiseClient({
            baseUrl: config.flowise.baseUrl,
            apiKey: config.flowise.token
        });
        this.client = client;
    }


    async prediction(question: string, sessionId: string = ''): Promise<any> {

        let overrideConfig: Record<string, any> | undefined;

        if (sessionId) {
            overrideConfig = {
                sessionId: sessionId,
            }
        }

        // prediction
        try {
            const predRes: any = await this.client.createPrediction<PredictionData>({
                chatflowId: this.chatflowId,
                question: question,
                streaming: false,
                overrideConfig,
            });

            return predRes;
        } catch (error) {
            console.error('Error:', error);
        
        }
    }
}
