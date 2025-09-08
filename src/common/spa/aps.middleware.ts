import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';

@Injectable()
export class SpaMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // 排除 API 路由和已存在的静态文件
        if (req.path.startsWith('/api') || req.path.includes('.')) {
            return next();
        }

        // console.log('req.path', req.path);

        // 所有其他请求都返回 index.html
        res.sendFile(join(__dirname, '..', '..', 'public', 'index.html'));
    }
}
