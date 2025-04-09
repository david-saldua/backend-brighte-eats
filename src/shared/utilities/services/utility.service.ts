import { HttpStatus, Injectable } from '@nestjs/common';
import { ISuccessResponse } from '../interfaces/response.interface';
import { SUCCESS_MESSAGES } from 'src/shared/common/constants';

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
}
