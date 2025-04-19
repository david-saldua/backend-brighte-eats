import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { Injectable, Logger } from '@nestjs/common';

interface StandardResponseField {
  success: boolean;
  statusCode: number;
  message: string;
  [key: string]: unknown;
}

interface ResponseBody {
  kind?: string;
  singleResult?: {
    data?: Record<string, unknown>;
    errors?: Array<{
      message: string;
      path?: ReadonlyArray<string | number>;
      extensions?: Record<string, unknown>;
    }>;
  };
  initialResult?: {
    data?: Record<string, unknown>;
    errors?: Array<{
      message: string;
      path?: ReadonlyArray<string | number>;
      extensions?: Record<string, unknown>;
    }>;
  };
  data?: Record<string, unknown>;
  errors?: Array<{
    message: string;
    path?: ReadonlyArray<string | number>;
    extensions?: Record<string, unknown>;
  }>;
}

@Injectable()
@Plugin()
export class GraphqlLoggingPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger('GraphQL');

  async requestDidStart({ request, contextValue }): Promise<GraphQLRequestListener<unknown>> {
    const requestId = contextValue?.req?.requestId ?? 'No id available';
    const startTime = Date.now();
    const operationName = request?.operationName ?? 'anonymous operation';

    this.logger.log(`[${requestId}] Request started: ${operationName}`);

    if (request.query) {
      this.logger.debug(`[${requestId}] Query: ${request.query}`);
    }

    if (request.variables && Object.keys(request.variables).length > 0) {
      this.logger.debug(`[${requestId}] Variables: ${JSON.stringify(request.variables)}`);
    }

    return {
      didResolveOperation: async () => {
        this.logger.log(`[${requestId}] Operations resolved: ${operationName}`);
      },

      executionDidStart: async () => {
        this.logger.log(`[${requestId}] Execution started`);
        const execStartTime = Date.now();

        return {
          executionDidEnd: async (err) => {
            const executionTime = Date.now() - execStartTime;
            this.logger.log(`[${requestId}] Execution completed in ${executionTime}ms`);

            if (err) {
              this.logger.error(`[${requestId}] Execution error: ${err}`);
            }
          },
        };
      },

      didEncounterErrors: async ({ errors }) => {
        const errorCount = errors.length;
        const formattedErrors = errors.map((error) => ({
          message: error.message,
          path: error.path,
          extensions: error.extensions,
        }));

        this.logger.error(
          `[${requestId}] Encountered ${errorCount} error(s): ${JSON.stringify(formattedErrors)}`,
        );
      },

      willSendResponse: async ({ response }) => {
        const duration = Date.now() - startTime;
        const { body } = response;

        try {
          this.addRequestIdToResponse(body as ResponseBody, requestId);
        } catch (error) {
          this.logger.error(`[${requestId}] Error modifying response: ${error}`);
        }

        const hasErrors = this.hasErrors(body as ResponseBody);

        const logMethod = hasErrors
          ? this.logger.error.bind(this.logger)
          : this.logger.log.bind(this.logger);
        logMethod(`[${requestId}] Response sent in ${duration}ms for ${operationName}`);
      },
    };
  }

  private addRequestIdToResponse(body: ResponseBody, requestId: string): void {
    const data = this.extractData(body);
    if (!data) return;

    Object.keys(data).forEach((key) => {
      const field = data[key];
      if (this.isStandardResponseField(field)) {
        data[key] = { ...field, requestId };
      }
    });
  }

  private extractData(body: ResponseBody): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object') return undefined;

    if (body.kind === 'single' && body.singleResult?.data) {
      return body.singleResult.data;
    }

    if (body.kind === 'incremental' && body.initialResult?.data) {
      return body.initialResult.data;
    }

    if (body.data) {
      return body.data;
    }

    return undefined;
  }

  private hasErrors(body: ResponseBody): boolean {
    if (!body || typeof body !== 'object') return false;

    if (body.kind === 'single' && body.singleResult?.errors?.length > 0) {
      return true;
    }

    if (body.kind === 'incremental' && body.initialResult?.errors?.length > 0) {
      return true;
    }

    if (body.errors?.length > 0) {
      return true;
    }

    return false;
  }

  private isStandardResponseField(field: unknown): field is StandardResponseField {
    return (
      field !== null &&
      typeof field === 'object' &&
      field !== null &&
      'success' in (field as object) &&
      'statusCode' in (field as object) &&
      'message' in (field as object)
    );
  }
}
