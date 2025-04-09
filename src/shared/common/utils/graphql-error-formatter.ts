import { HttpStatus } from '@nestjs/common';
import { GraphQLFormattedError } from 'graphql';

export const formatGraphQLError = (formattedError: GraphQLFormattedError) => {
  const originalError = formattedError.extensions;

  if (!originalError) {
    return {
      status: formattedError.extensions?.status ?? HttpStatus.BAD_REQUEST,
      message: formattedError.message,
      code: formattedError.extensions?.code ?? 'INTERNAL_SERVER_ERROR',
      path: formattedError.path,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    status: originalError.status ?? HttpStatus.BAD_REQUEST,
    message:
      typeof originalError.message === 'string' ? originalError.message : formattedError.message,
    code: formattedError.extensions?.code ?? 'INTERNAL_SERVER_ERROR',
    path: formattedError.path,
    timestamp: originalError.timestamp ?? new Date().toISOString(),
  };
};
