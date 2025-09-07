/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { FlowiseService } from '../flowise.service';

describe('FlowiseService', () => {
    let service: FlowiseService;
    let mockLogger: Logger;

    beforeAll(async () => {
        mockLogger = {
            warn: jest.fn(),
            log: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        } as any as Logger;

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [],
            providers: [
                FlowiseService,
                {
                    provide: WINSTON_MODULE_NEST_PROVIDER,
                    useValue: mockLogger,
                },
            ],
        }).compile();


        service = moduleRef.get<FlowiseService>(FlowiseService);
    });

    describe('defined', () => {
        it('should be defined', () => {
            expect(service).toBeDefined();
        });
    });

    describe('prediction', () => {
        jest.setTimeout(15000); // 15秒

        it('should create prediction', async () => {
            // / 1. 强制访问私有属性 client（TypeScript 会警告，需用 @ts-ignore）
            // @ts-ignore 忽略私有属性访问警告
            const client = service.client;


            const expected = {
                text: '您好！很高兴为您服务。',
                question: 'Hey, how are you?',
                chatId: '5f7719a3-85b6-415a-9ae8-236f46d805df',
                chatMessageId: 'e4785556-95a8-4f1f-a25d-c53d939df3a3',
                isStreamValid: false,
                sessionId: '5f7719a3-85b6-415a-9ae8-236f46d805df'
            };
            // 2. mock createPrediction 方法
            jest.spyOn(client, 'createPrediction').mockResolvedValue({...expected});

            const actual = await service.prediction('Hey, how are you?');
            
            expect(actual).toEqual(expected);
        });

        it('should create prediction with unknow idd', async () => {
            // / 1. 强制访问私有属性 client（TypeScript 会警告，需用 @ts-ignore）
            // @ts-ignore 忽略私有属性访问警告
            const client = service.client;


            const expected = {
                text: '您好！很高兴为您服务。',
                question: 'Hey, how are you?',
                chatId: '5f7719a3-85b6-415a-9ae8-236f46d805df',
                chatMessageId: 'e4785556-95a8-4f1f-a25d-c53d939df3a3',
                isStreamValid: false,
                sessionId: '12jshsjjakhjsss3s'
            };
            // 2. mock createPrediction 方法
            jest.spyOn(client, 'createPrediction').mockResolvedValue({...expected});

            const actual = await service.prediction('Hey, how are you?', '12jshsjjakhjsss3');

            // console.log(actual);
            
            expect(actual).toEqual(expected);
        });
    });

    // describe('getMessages', () => {
    //     it('should get messages', async () => {
    //         const actual = await service.getMessages('7546850831875358774');
    //         console.log(actual);
    //         expect(actual).toBeDefined();
    //     });
    // });





});
