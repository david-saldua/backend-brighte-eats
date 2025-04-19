import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { GraphQLError } from 'graphql';

interface ResponseData {
  [key: string]: unknown;
}

interface StandardResponseField {
  success: boolean;
  statusCode: number;
  message: string;
  [key: string]: unknown;
}

interface SingleResponseBody {
  kind: 'single';
  singleResult: {
    data?: ResponseData;
    errors?: readonly GraphQLError[];
  };
}

interface IncrementalResponseBody {
  kind: 'incremental';
  initialResult: {
    data?: ResponseData;
    errors?: readonly GraphQLError[];
  };
}

interface LegacyResponseBody {
  data?: ResponseData;
  errors?: readonly GraphQLError[];
}

type ResponseBodyHandler = {
  getData: (body: unknown) => ResponseData | null | undefined;
  hasErrors: (body: unknown) => boolean;
};

@Plugin()
export class GraphqlLoggingPlugin implements ApolloServerPlugin {
  private responseHandlers: Record<string, ResponseBodyHandler> = {
    single: {
      getData: (body: unknown): ResponseData | undefined => {
        if (this.isSingleResponse(body)) {
          return body.singleResult.data;
        }
        return undefined;
      },
      hasErrors: (body: unknown): boolean => {
        if (this.isSingleResponse(body)) {
          const errors = body.singleResult.errors;
          return Array.isArray(errors) ? errors.length > 0 : false;
        }
        return false;
      },
    },
    incremental: {
      getData: (body: unknown): ResponseData | undefined => {
        if (this.isIncrementalResponse(body)) {
          return body.initialResult.data;
        }
        return undefined;
      },
      hasErrors: (body: unknown): boolean => {
        if (this.isIncrementalResponse(body)) {
          const errors = body.initialResult.errors;
          return Array.isArray(errors) ? errors.length > 0 : false;
        }
        return false;
      },
    },
    legacy: {
      getData: (body: unknown): ResponseData | undefined => {
        if (this.isLegacyResponse(body) && body.data) {
          return body.data;
        }
        return undefined;
      },
      hasErrors: (body: unknown): boolean => {
        if (this.isLegacyResponse(body) && body.errors) {
          return Array.isArray(body.errors) ? body.errors.length > 0 : false;
        }
        return false;
      },
    },
  };

  async requestDidStart({ request, contextValue }): Promise<GraphQLRequestListener<unknown>> {
    const requestId = contextValue?.req?.requestId ?? 'No id available';
    const startTime = Date.now();

    this.logRequestStart(requestId, request);

    const addRequestIdToResponseData = this.addRequestIdToResponseData.bind(this);
    const checkForErrors = this.checkForErrors.bind(this);
    const logResponse = this.logResponse.bind(this);
    const logErrors = this.logErrors.bind(this);

    return {
      async didResolveOperation(requestContext) {
        const operationName = requestContext?.operationName ?? 'anonymous operation';
        console.log(`[GraphQL][${requestId}] Operations resolved: ${operationName}`);
      },

      async executionDidStart() {
        console.log(`[GraphQL][${requestId}] Execution started`);
        const execStartTime = Date.now();

        return {
          async executionDidEnd(err) {
            const execEndTime = Date.now();
            const executionTime = execEndTime - execStartTime;

            console.log(`[GraphQL][${requestId}] Execution completed in ${executionTime}ms`);

            if (err) {
              console.error(`[GraphQL][${requestId}] Execution error:`, err);
            }
          },
        };
      },

      async didEncounterErrors(requestContext) {
        logErrors(requestId, requestContext.errors);
      },

      async willSendResponse(requestContext) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const { body } = requestContext.response;

        try {
          addRequestIdToResponseData(body, requestId);
        } catch (error) {
          console.error(`[GraphQL][${requestId}] Error modifying response:`, error);
        }

        const hasErrors = checkForErrors(body);
        logResponse(requestId, request, body, duration, hasErrors);
      },
    };
  }

  /**
   * Logs the start of a GraphQL request
   */
  private logRequestStart(requestId: string, request: any): void {
    console.log(
      `[GraphQL][${requestId}] Request started: ${request?.operationName ?? 'anonymous operation'}`,
    );
    console.log(`[GraphQL][${requestId}] Query: ${request.query}`);

    if (request.variables && Object.keys(request.variables).length > 0) {
      console.log(
        `[GraphQL][${requestId}] Variables: ${JSON.stringify(request.variables, null, 2)}`,
      );
    }
  }

  /**
   * Logs GraphQL errors
   */
  private logErrors(requestId: string, errors: readonly GraphQLError[]): void {
    const errorCount = errors.length;
    const formattedErrors = errors.map((error) => ({
      message: error.message,
      path: error.path,
      extensions: error.extensions,
    }));

    console.error(`[GraphQL][${requestId}] Encountered ${errorCount} error(s):`, formattedErrors);
  }

  /**
   * Logs the GraphQL response
   */
  private logResponse(
    requestId: string,
    request: any,
    body: unknown,
    duration: number,
    hasErrors: boolean,
  ): void {
    const { operationName = 'anonymous operation', query, variables } = request;

    const responseLog = {
      requestId,
      operationName,
      query,
      variables,
      responseSize: JSON.stringify(body).length,
      duration: `${duration}ms`,
      hasErrors,
    };

    console.log(`[GraphQL][${requestId}] Response sent in ${duration}ms:`, responseLog);
  }

  /**
   * Adds requestId to response data fields that match our standard response format
   */
  private addRequestIdToResponseData(body: unknown, requestId: string): void {
    const handler = this.getResponseHandler(body);
    const data = handler.getData(body);

    if (!data) return;

    for (const fieldName in data) {
      const field = data[fieldName];

      if (this.isStandardResponseField(field)) {
        data[fieldName] = { ...(field as StandardResponseField), requestId };
      }
    }
  }

  /**
   * Checks if the response contains errors
   */
  private checkForErrors(body: unknown): boolean {
    const handler = this.getResponseHandler(body);
    return handler.hasErrors(body);
  }

  /**
   * Gets the appropriate handler for the response body type
   */
  private getResponseHandler(body: unknown): ResponseBodyHandler {
    if (this.isSingleResponse(body)) {
      return this.responseHandlers.single;
    }

    if (this.isIncrementalResponse(body)) {
      return this.responseHandlers.incremental;
    }

    return this.responseHandlers.legacy;
  }

  /**
   * Check if a field matches our standard response format
   */
  private isStandardResponseField(field: unknown): field is StandardResponseField {
    return (
      field !== null &&
      typeof field === 'object' &&
      'success' in field &&
      'statusCode' in field &&
      'message' in field
    );
  }

  isSingleResponse(body: unknown): body is SingleResponseBody {
    return (
      !!body &&
      typeof body === 'object' &&
      'kind' in body &&
      body.kind === 'single' &&
      'singleResult' in body &&
      !!body.singleResult &&
      typeof body.singleResult === 'object'
    );
  }

  isIncrementalResponse(body: unknown): body is IncrementalResponseBody {
    return (
      !!body &&
      typeof body === 'object' &&
      'kind' in body &&
      body.kind === 'incremental' &&
      'initialResult' in body &&
      !!body.initialResult &&
      typeof body.initialResult === 'object'
    );
  }

  isLegacyResponse(body: unknown): body is LegacyResponseBody {
    return !!body && typeof body === 'object' && ('data' in body || 'errors' in body);
  }
}
