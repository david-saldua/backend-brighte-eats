import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ERROR_CODES, ERROR_MESSAGES, PRISMA_ERROR_CODES } from '../constants';

@Injectable()
export abstract class BaseRepository<T> {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly model: string,
  ) {}

  /**
   * Handles Prisma errors by determining their type and delegating to appropriate handlers.
   * @param error - The error thrown by Prisma operations
   * @throws The original error after handling
   */
  protected handlePrismaError(error: unknown): never {
    switch (true) {
      case error instanceof PrismaClientKnownRequestError:
        this.handleKnownRequestError(error);
      default:
        this.handleUnknownError();
    }

    throw error;
  }

  /**
   * Handles Prisma known request errors by throwing appropriate HTTP exceptions.
   * @param error - The Prisma client known request error to handle
   * @throws {NotFoundException} When a record is not found
   * @throws {InternalServerErrorException} For other database errors
   */
  private handleKnownRequestError(error: PrismaClientKnownRequestError): never {
    switch (error.code) {
      case PRISMA_ERROR_CODES.PRISMA_UNIQUE_CONSTRAINT:
        this.throwPrismaUniqueConstraint(error);

      case PRISMA_ERROR_CODES.RECORD_NOT_FOUND:
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          message: ERROR_MESSAGES.NOT_FOUND,
          code: ERROR_CODES.NOT_FOUND,
        });

      default:
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: ERROR_MESSAGES.DATABASE_ERROR(error),
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        });
    }
  }

  /**
   * Handles Prisma unique constraint violations by throwing a formatted ConflictException. *
   * @param error - The Prisma error containing information about the unique constraint violation
   * @throws {ConflictException} With formatted field names and standardized error structure
   */
  private throwPrismaUniqueConstraint(error: PrismaClientKnownRequestError): never {
    const { target = [] } = error.meta ?? {};
    const fields: string[] = Array.isArray(target)
      ? target.filter((item): item is string => typeof item === 'string')
      : typeof target === 'string'
        ? [target]
        : [];
    const fieldNames = fields
      .map((field) => field.charAt(0).toUpperCase() + field.slice(1))
      .join(' and ');

    throw new ConflictException({
      status: HttpStatus.CONFLICT,
      message: ERROR_MESSAGES.FIELD_NAMES_EXIST(fieldNames),
      code: ERROR_CODES.CONFLICT,
    });
  }

  /**
   * Handles unknown errors by throwing an InternalServerErrorException
   * @private
   * @throws {InternalServerErrorException} Always throws this exception
   */
  private handleUnknownError() {
    throw new InternalServerErrorException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}
