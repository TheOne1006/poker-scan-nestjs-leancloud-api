import { Test, TestingModule } from '@nestjs/testing';
import { BaseFeedbackRateLimitGuard } from '../base-feedback.guard';
import { BaseFeedbackService } from '../base-feedback.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

describe('BaseFeedbackRateLimitGuard', () => {
  let guard: BaseFeedbackRateLimitGuard;
  let service: BaseFeedbackService;

  const mockService = {
    findLastByDeviceId: jest.fn(),
    findLastByIp: jest.fn(),
  };

  const mockReflector = {};

  const createMockContext = (body: any, ip: string = '127.0.0.1') => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          body,
          ip,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaseFeedbackRateLimitGuard,
        {
          provide: BaseFeedbackService,
          useValue: mockService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<BaseFeedbackRateLimitGuard>(BaseFeedbackRateLimitGuard);
    service = module.get<BaseFeedbackService>(BaseFeedbackService);

    // Reset mocks
    mockService.findLastByDeviceId.mockReset();
    mockService.findLastByIp.mockReset();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow request if device_id is missing (let validation handle it)', async () => {
    const context = createMockContext({});
    // Mock empty ip checks
    mockService.findLastByIp.mockResolvedValue([]);
    
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow request if fewer than 3 submissions', async () => {
    mockService.findLastByDeviceId.mockResolvedValue([
      { createdAt: new Date() },
      { createdAt: new Date() },
    ]);
    mockService.findLastByIp.mockResolvedValue([]);

    const context = createMockContext({ device_id: 'device-1' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should block request if device_id limit exceeded', async () => {
    const now = new Date();
    const twentyNineMinsAgo = new Date(now.getTime() - 29 * 60 * 1000);
    
    mockService.findLastByDeviceId.mockResolvedValue([
      { createdAt: new Date() },
      { createdAt: new Date() },
      { createdAt: twentyNineMinsAgo },
    ]);
    mockService.findLastByIp.mockResolvedValue([]);
    
    const context = createMockContext({ device_id: 'device-1' });
    
    await expect(guard.canActivate(context)).rejects.toThrow(
      new HttpException(
        'Submission limit exceeded. Please try again in 1 minutes.',
        HttpStatus.TOO_MANY_REQUESTS
      )
    );
  });

  it('should block request if ip limit exceeded', async () => {
    const now = new Date();
    const twentyNineMinsAgo = new Date(now.getTime() - 29 * 60 * 1000);
    
    mockService.findLastByDeviceId.mockResolvedValue([]);
    mockService.findLastByIp.mockResolvedValue([
      { createdAt: new Date() },
      { createdAt: new Date() },
      { createdAt: twentyNineMinsAgo },
    ]);
    
    const context = createMockContext({ device_id: 'device-1' }, '192.168.1.1');
    
    await expect(guard.canActivate(context)).rejects.toThrow(
      new HttpException(
        'Submission limit exceeded. Please try again in 1 minutes.',
        HttpStatus.TOO_MANY_REQUESTS
      )
    );
  });

  it('should allow if both are under limit', async () => {
    mockService.findLastByDeviceId.mockResolvedValue([
      { createdAt: new Date() },
    ]);
    mockService.findLastByIp.mockResolvedValue([
      { createdAt: new Date() },
    ]);
    
    const context = createMockContext({ device_id: 'device-1' }, '192.168.1.1');
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
