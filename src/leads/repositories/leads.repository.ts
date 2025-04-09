import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { RegisterInput } from '../dto/register.input';
import { Lead, Prisma, ServiceInterest } from '@prisma/client';
import { ERROR_CODES, ERROR_MESSAGES, PRISMA_ERROR_CODES } from 'src/shared/common/constants';
import { BaseRepository } from 'src/shared/common/repository/base.repository';

@Injectable()
export class LeadsRepository extends BaseRepository<Lead> {
  constructor(prismaService: PrismaService) {
    super(prismaService, 'lead');
  }

  /**
   * Creates a new lead record with associated service interests
   *
   * @param data - The lead registration data including optional service types
   * @returns A promise that resolves to the created lead with its service interests
   */
  async create(data: RegisterInput): Promise<Lead & { ServiceInterest: ServiceInterest[] }> {
    try {
      const { serviceType, ...leadData } = data;

      const createLeadInput: Prisma.LeadCreateInput = {
        ...leadData,
        ...(serviceType?.length && {
          ServiceInterest: {
            create: serviceType.map((type) => ({
              serviceType: type,
            })),
          },
        }),
      };

      const includeServiceInterest: Prisma.LeadInclude = {
        ServiceInterest: true,
      };

      const newLeadData = await this.prismaService.lead.create({
        data: createLeadInput,
        include: includeServiceInterest,
      });

      return newLeadData;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }
}
