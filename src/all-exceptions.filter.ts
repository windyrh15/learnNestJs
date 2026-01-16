// all-exceptions.filter.ts
import {
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { MyLoggerService } from './my-logger/my-logger.service';
// import { v4 as uuidv4 } from 'uuid'; // dihapus
import { randomUUID } from 'crypto';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

const SENSITIVE_KEYS = ['password', 'token', 'accessToken', 'refreshToken', 'creditCard'];

function sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitize);
    const out: any = {};
    for (const k of Object.keys(obj)) {
        if (SENSITIVE_KEYS.includes(k)) {
            out[k] = '[REDACTED]';
            continue;
        }
        const v = obj[k];
        out[k] = typeof v === 'object' ? sanitize(v) : v;
    }
    return out;
}

function makeErrorId(): string {
    // Node 14.17+, 16+ support randomUUID; fallback ke timestamp+random jika tidak tersedia
    try {
        return typeof randomUUID === 'function' ? randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    } catch {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
}

@Injectable()
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    constructor(private readonly logger: MyLoggerService) {
        super();
    }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        const errorId = makeErrorId();

        if (exception instanceof PrismaClientValidationError) {
            const status = HttpStatus.BAD_REQUEST;
            const message = 'Invalid query or input for database';
            const payload = {
                errorId,
                status,
                message,
                path: req.url,
                method: req.method,
                params: sanitize(req.params),
                query: sanitize(req.query),
                body: sanitize(req.body),
                timestamp: new Date().toISOString(),
                context: 'PrismaClientValidationError',
            };
            this.logger.error(payload, 'AllExceptionsFilter');
            res.setHeader('X-Error-Id', errorId);
            return res.status(status).json({
                statusCode: status,
                timestamp: payload.timestamp,
                path: req.url,
                error: message,
                errorId,
            });
        }

        const isHttp = exception instanceof HttpException;
        const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        let message: any = 'Internal server error';
        if (isHttp) {
            const resp = exception.getResponse();
            message = typeof resp === 'string' ? resp : (resp as any).message ?? resp;
        }

        const logPayload = {
            errorId,
            status,
            message,
            stack: (exception as any)?.stack,
            path: req.url,
            method: req.method,
            params: sanitize(req.params),
            query: sanitize(req.query),
            body: sanitize(req.body),
            headers: { 'user-agent': req.headers['user-agent'] },
            timestamp: new Date().toISOString(),
            context: 'AllExceptionsFilter',
        };

        try {
            this.logger.error(logPayload, 'AllExceptionsFilter');
        } catch (e) {
            try { console.error('Logger fallback', e); } catch { }
        }

        const isDev = process.env.NODE_ENV !== 'production';
        const responseBody: any = {
            statusCode: status,
            timestamp: logPayload.timestamp,
            path: req.url,
            error: typeof message === 'string' ? message : (message?.message ?? message),
            errorId,
        };
        if (isDev) responseBody.stack = logPayload.stack;

        res.setHeader('X-Error-Id', errorId);
        res.status(status).json(responseBody);
    }
}
