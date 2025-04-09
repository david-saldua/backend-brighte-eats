import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
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
   * //TODO:
   * - apply the other error handling instances of prisma error
   * - add jsdocs to all of the functions
   * - use base repository for finding the leads list
   * - ube base repository for finding lead information
   *
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

  private handleKnownRequestError(error: PrismaClientKnownRequestError): never {
    switch (error.code) {
      case PRISMA_ERROR_CODES.PRISMA_UNIQUE_CONSTRAINT:
        this.throwPrismaUniqueConstraint(error);

      default:
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: ERROR_MESSAGES.DATABASE_ERROR(error),
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        });
    }
  }

  private throwPrismaUniqueConstraint(error: PrismaClientKnownRequestError): never {
    const fields = (error.meta.target as string[]) ?? [];
    const fieldNames = fields
      .map((field) => field.charAt(0).toUpperCase() + field.slice(1))
      .join(' and ');

    throw new ConflictException({
      status: HttpStatus.CONFLICT,
      message: ERROR_MESSAGES.FIELD_NAMES_EXIST(fieldNames),
      code: ERROR_CODES.CONFLICT,
    });
  }

  private handleUnknownError() {
    throw new InternalServerErrorException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}
