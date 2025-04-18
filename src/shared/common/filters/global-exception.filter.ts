import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { IErrorInfo } from '../interfaces/error-info.interface';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants';

@Catch()
export class GraphQLErrorFilter implements GqlExceptionFilter {
  /**
   * Catches and processes exceptions by type (HTTP, GraphQL, Error), creating appropriate GraphQL error responses.
   * Converts exceptions to standardized error format using context from GraphQL request.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();
    console.log('context ===', context);

    let errorInfo: IErrorInfo;

    switch (true) {
      case exception instanceof HttpException:
        errorInfo = this.handleHttpException(exception);
        break;

      case exception instanceof GraphQLError:
        errorInfo = this.handleGraphQLError(exception);
        break;

      case exception instanceof Error:
        errorInfo = this.handleGenericError(exception);
        break;

      default:
        errorInfo = this.handleUnknownError();
        break;
    }

    return this.createGraphQLError(errorInfo);
  }

  /**
   * Handles GraphQL errors by converting them to a standardized error info format.
   * Maps GraphQL errors to HTTP status codes and extracts relevant error details.
   * @param exception - The GraphQL error to process
   * @returns Standardized error information object
   */
  private handleHttpException(exception: HttpException): IErrorInfo {
    const status = exception.getStatus();
    const response = exception.getResponse();

    let message = (response as string) ?? exception.message;
    let code = ERROR_CODES.HTTP_EXCEPTION;

    if (typeof response === 'object') {
      message = (response as any).message ?? exception.message;
      code = (response as any).code ?? ERROR_CODES.HTTP_EXCEPTION;
    }

    return { status, message, code };
  }

  /**
   * Handles GraphQL errors by converting them into a standardized error info structure.
   * Maps GraphQL errors to HTTP status codes and extracts relevant error information.
   * @param exception - The GraphQL error to be processed
   * @returns A standardized error info object with status, message, code, and extensions
   */
  private handleGraphQLError(exception: GraphQLError): IErrorInfo {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: exception?.message ?? ERROR_MESSAGES.BAD_REQUEST,
      code: exception?.extensions?.code ?? ERROR_CODES.GRAPHQL_VALIDATION_FAILED,
      extensions: exception?.extensions,
    };
  }

  /**
   * Handles generic errors by creating a standardized error information object.
   * @param exception - The error object to process
   * @returns An error information object with internal server error status, message, and code
   */
  private handleGenericError(exception: Error): IErrorInfo {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message ?? ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    };
  }

  /**
   * Handles unknown errors by creating a standardized error information object.
   * @returns An error information object with internal server error status, message, and code.
   */
  private handleUnknownError(): IErrorInfo {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    };
  }

  /**
   * Creates a GraphQLError instance with formatted error information.
   * Includes status, code, timestamp, and any additional extensions in the error.
   * @param errorInfo - The error information containing status, message, code and optional extensions
   * @returns A GraphQLError instance with formatted extensions
   */
  private createGraphQLError(errorInfo: IErrorInfo): GraphQLError {
    const { status, message, code, extensions = {} } = errorInfo;

    return new GraphQLError(message, {
      extensions: {
        code,
        status,
        timestamp: new Date().toISOString(),
        ...extensions,
      },
    });
  }
}
