export const ERROR_CODES = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',

  GRAPHQL_VALIDATION_FAILED: 'GRAPHQL_VALIDATION_FAILED',
  GRAPHQL_EXECUTION_FAILED: 'GRAPHQL_EXECUTION_FAILED',

  HTTP_EXCEPTION: 'HTTP_EXCEPTION',

  LEADS: {
    LEAD_ALREADY_EXISTS: 'LEAD_ALREADY_EXISTS',
    INVALID_SERVICE_TYPE: 'INVALID_SERVICE_TYPE',
  },
};

export const PRISMA_ERROR_CODES = {
  PRISMA_UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
};
