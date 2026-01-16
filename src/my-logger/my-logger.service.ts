// my-logger.service.ts
import { Injectable, ConsoleLogger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
    private file = path.join(process.cwd(), 'logs', 'app.log');

    private format(level: string, context: string | undefined, message: any) {
        const time = new Date().toISOString();
        return `${time}\t${level}\t${context ?? '-'}\t${typeof message === 'string' ? message : JSON.stringify(message)}\n`;
    }

    async log(message: any, context?: string) {
        const entry = this.format('LOG', context, message);
        await fs.appendFile(this.file, entry).catch(() => { });
        super.log(message, context);
    }

    async error(message: any, trace?: string, context?: string) {
        const entry = this.format('ERROR', context, { message, trace });
        await fs.appendFile(this.file, entry).catch(() => { });
        super.error(message, trace, context);
    }

    warn(message: any, context?: string) {
        const entry = this.format('WARN', context, message);
        fs.appendFile(this.file, entry).catch(() => { });
        super.warn(message, context);
    }

    debug(message: any, context?: string) {
        const entry = this.format('DEBUG', context, message);
        fs.appendFile(this.file, entry).catch(() => { });
        super.debug(message, context);
    }
}
