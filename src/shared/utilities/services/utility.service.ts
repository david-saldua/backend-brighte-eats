import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ISuccessResponse } from '../interfaces/response.interface';
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } from 'src/shared/common/constants';

@Injectable()
export class UtilityService {
  /**
   * Handles successful response globally
   * @param data the data to be returned
   * @param statusCode status code of the response
   * @param message success message
   * @returns Formatted success response
   */
  handleSuccess<T>(
    data: T,
    message: string = SUCCESS_MESSAGES.DEFAULT,
    statusCode: number = HttpStatus.OK,
  ): ISuccessResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  /**
   * Handles errors by categorizing them by type and throwing appropriate exceptions
   * with standardized error information.
   * @param error - The error to be processed
   * @throws HttpException with standardized error format
   */
  handleError(error: unknown): never {
    if (error instanceof HttpException) {
      throw error;
    }

    if (error instanceof Error) {
      throw new BadRequestException({
        message: error.message ?? ERROR_MESSAGES.BAD_REQUEST,
        code: ERROR_CODES.BAD_REQUEST,
      });
    }

    throw new InternalServerErrorException({
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}
