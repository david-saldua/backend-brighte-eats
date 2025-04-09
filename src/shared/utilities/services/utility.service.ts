import { HttpStatus, Injectable } from '@nestjs/common';
import { ISuccessResponse } from '../interfaces/response.interface';

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
    message: string = 'Success',
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
