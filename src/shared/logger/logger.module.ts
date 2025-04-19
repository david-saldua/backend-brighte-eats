import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { join } from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${level}] ${context ? `[${context}]` : ''}: ${message}`;
            }),
          ),
        }),

        ...(process.env.NODE_ENV === 'production'
          ? [
              new winston.transports.DailyRotateFile({
                dirname: join(process.cwd(), 'logs'),
                filename: 'application-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '7d',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
              }),

              new winston.transports.DailyRotateFile({
                dirname: join(process.cwd(), 'logs'),
                filename: 'error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '7d',
                level: 'error',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
              }),
            ]
          : []),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
