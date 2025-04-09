export class ISuccessResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export class IErrorResponse {
  success: boolean;
  statusCode: number;
  errorMessage: string;
  error?: Record<string, any>;
}
