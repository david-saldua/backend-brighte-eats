/**
 * Interface representing a successful API response.
 * Contains standard response fields including success status, HTTP status code,
 * a message, and the actual response data of generic type T.
 */
export class ISuccessResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
