import { HttpStatus } from '@nestjs/common';

/**
 * Interface defining error information structure with HTTP status, message, error code and optional extensions.
 */
export interface IErrorInfo {
  status: HttpStatus;
  message: string;
  code: string | unknown;
  extensions?: Record<string, unknown>;
}
