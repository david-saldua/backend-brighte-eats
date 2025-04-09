import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { RegisterInput } from '../dto/register.input';
import { Lead, Prisma, ServiceInterest } from '@prisma/client';

@Injectable()
export class LeadsRepository {
  constructor(private prismaService: PrismaService) {}

  /**
   * Creates a new lead record with associated service interests
   *
   * @param data - The lead registration data including optional service types
   * @returns A promise that resolves to the created lead with its service interests
   */
  async create(data: RegisterInput): Promise<Lead & { ServiceInterest: ServiceInterest[] }> {
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
  }
}
