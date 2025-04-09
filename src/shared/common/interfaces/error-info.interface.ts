import { HttpStatus } from '@nestjs/common';

export interface IErrorInfo {
  status: HttpStatus;
  message: string;
  code: string | unknown;
  extensions?: Record<string, unknown>;
}
