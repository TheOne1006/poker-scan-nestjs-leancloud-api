/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { RSAService } from '../rsa.service';

describe('RSAService', () => {
    let service: RSAService;
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
                RSAService,
                {
                    provide: WINSTON_MODULE_NEST_PROVIDER,
                    useValue: mockLogger,
                },
            ],
        }).compile();

        service = moduleRef.get<RSAService>(RSAService);
    });

    describe('base test', () => {
        it('should be defined', () => {
            expect(service).toBeDefined();
        });
    });
    describe('encrypt and decrypt', () => {
        beforeEach(async () => {
            mockLogger = {
                error: jest.fn(),
            } as any as Logger;

            const moduleRef: TestingModule = await Test.createTestingModule({
                imports: [],
                providers: [
                    RSAService,
                    {
                        provide: WINSTON_MODULE_NEST_PROVIDER,
                        useValue: mockLogger,
                    },  
                ],
            }).compile();

            service = moduleRef.get<RSAService>(RSAService);
        });

        it('should encrypt and decrypt', async () => {
            // @ts-ignore
            const encodeStr = service.encrypt('123456');
            const decodeStr = service.decrypt(encodeStr);
            expect(decodeStr).toEqual('123456');
        });

        it('should check data with rsa', async () => {
            const data = {
                username: 'test',
                password: '123456',
            };
            const rsaData = service.encrypt(JSON.stringify(data));
            const result = service.checkDataWithRSA(data, rsaData);
            expect(result).toEqual(true);
        });
    });
});