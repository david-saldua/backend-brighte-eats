import { Test, TestingModule } from '@nestjs/testing';
import { LeadsRepository } from '../repositories/leads.repository';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RegisterInput } from '../dto/register.input';
import { Lead, Prisma, ServiceInterest, ServiceType } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('LeadsRepository', () => {
  let leadsRepository: LeadsRepository;
  let prismaService: PrismaService;

  const baseLeadData = {
    email: 'Garrison_Greenfelder87@hotmail.com',
    mobile: '+63-946-922-8301',
    name: 'Dr. Lana Mann',
    postCode: '15-886-982-1098',
  };

  const serviceTypes = [ServiceType.DELIVERY, ServiceType.PAYMENT];

  const registerInput: RegisterInput = {
    ...baseLeadData,
    serviceType: serviceTypes,
  };

  const expectedPrismaInput = {
    ...baseLeadData,
    ServiceInterest: {
      create: serviceTypes.map((serviceType) => ({ serviceType })),
    },
  };

  const mockCreatedLead = {
    id: 1,
    ...baseLeadData,
    createdAt: new Date(),
    updatedAt: new Date(),
    ServiceInterest: serviceTypes.map((serviceType, index) => ({
      id: index + 1,
      leadId: 1,
      serviceType,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };

  const testCreateLead = async (
    input: RegisterInput,
    expectedDataInput: Prisma.LeadCreateInput,
    mockResponse: Lead & { ServiceInterest: ServiceInterest[] },
  ) => {
    jest.spyOn(prismaService.lead, 'create').mockResolvedValue(mockResponse);

    const result = await leadsRepository.create(input);

    expect(prismaService.lead.create).toHaveBeenCalledWith({
      data: expectedDataInput,
      include: { ServiceInterest: true },
    });
    expect(result).toEqual(mockResponse);

    return result;
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsRepository,
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            lead: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    leadsRepository = module.get<LeadsRepository>(LeadsRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test suite for LeadRepository create method
   */
  describe('Create', () => {
    it('SHOULD be defined', () => {
      expect(leadsRepository).toBeDefined();
    });

    it('SHOULD have create method that is a function', () => {
      expect(typeof leadsRepository.create).toBe('function');
    });

    it('SHOULD create a lead with valid input', async () => {
      await testCreateLead(registerInput, expectedPrismaInput, mockCreatedLead);
    });

    it('SHOULD create multiple ServiceInterest records for multiple service types', async () => {
      const updatedServiceTypes = [...serviceTypes, ServiceType.PICKUP];
      const updatedRegisterInput = {
        ...registerInput,
        serviceType: updatedServiceTypes,
      };

      const updatedExpectedPrismaInput = {
        ...expectedPrismaInput,
        ServiceInterest: {
          create: updatedServiceTypes.map((serviceType) => ({ serviceType })),
        },
      };

      const updatedMockCreatedLead = {
        ...mockCreatedLead,
        ServiceInterest: updatedServiceTypes.map((serviceType, index) => ({
          id: index + 1,
          leadId: 1,
          serviceType,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      const result = await testCreateLead(
        updatedRegisterInput,
        updatedExpectedPrismaInput,
        updatedMockCreatedLead,
      );

      expect(result.ServiceInterest).toHaveLength(3);
      expect(result.ServiceInterest.map((service) => service.serviceType)).toEqual(
        updatedServiceTypes,
      );
    });

    it('SHOULD handle duplicate email error and throw conflict exception', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          code: 'P2002',
          clientVersion: '4.0.0',
          meta: { target: ['email'] },
        },
      );

      jest.spyOn(prismaService.lead, 'create').mockRejectedValue(prismaError);
      await expect(leadsRepository.create(registerInput)).rejects.toThrow(ConflictException);
    });
  });
});
