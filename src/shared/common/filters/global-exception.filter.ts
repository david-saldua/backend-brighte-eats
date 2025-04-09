import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { IErrorInfo } from '../interfaces/error-info.interface';

@Catch()
export class GraphQLErrorFilter implements GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();

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

  private handleHttpException(exception: HttpException): IErrorInfo {
    const status = exception.getStatus();
    const response = exception.getResponse();

    let message = (response as string) ?? exception.message;
    let code = 'HTTP_EXCEPTION';

    if (typeof response === 'object') {
      message = (response as any).message ?? exception.message;
      code = (response as any).error ?? 'HTTP_EXCEPTION';
    }

    return { status, message, code };
  }

  private handleGraphQLError(exception: GraphQLError): IErrorInfo {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: exception?.message ?? 'Bad Request',
      code: exception?.extensions?.code ?? 'GRAPHQL_VALIDATION_FAILED',
      extensions: exception?.extensions,
    };
  }

  private handleGenericError(exception: Error): IErrorInfo {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message ?? 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
    };
  }

  private handleUnknownError(): IErrorInfo {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
    };
  }

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
