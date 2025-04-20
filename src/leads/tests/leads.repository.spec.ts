import { Test, TestingModule } from '@nestjs/testing';
import { LeadsRepository } from '../repositories/leads.repository';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RegisterInput } from '../dto/register.input';
import { Lead, Prisma, ServiceInterest, ServiceType } from '@prisma/client';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import {
  createRegisterInputFactory,
  createPrismaInputFactory,
  createMockLeadFactory,
  createTestLeadData,
  createUniqueEmailRegisterInput,
} from './factories/lead.factory';
import { defaultServiceTypes } from './fixtures/lead.fixture';

describe('LeadsRepository', () => {
  let leadsRepository: LeadsRepository;
  let prismaService: PrismaService;

  const testCreateLead = async (
    input: RegisterInput,
    expectedDataInput: Prisma.LeadCreateInput,
    mockResponse: Lead & { ServiceInterest: ServiceInterest[] },
  ): Promise<Lead & { ServiceInterest: ServiceInterest[] }> => {
    jest.spyOn(prismaService.lead, 'create').mockResolvedValue(mockResponse);

    const result = await leadsRepository.create(input);

    expect(prismaService.lead.create).toHaveBeenCalledWith({
      data: expectedDataInput,
      include: { ServiceInterest: true },
    });
    expect(result).toEqual(mockResponse);
    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: expect.any(String),
        name: expect.any(String),
        mobile: expect.any(String),
        postCode: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        ServiceInterest: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            leadId: expect.any(Number),
            serviceType: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        ]),
      }),
    );

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
      const { registerInput, expectedPrismaInput, mockCreatedLead } = createTestLeadData();
      await testCreateLead(registerInput, expectedPrismaInput, mockCreatedLead);
    });

    it('SHOULD create multiple ServiceInterest records for multiple service types', async () => {
      const updatedServiceTypes = [...defaultServiceTypes, ServiceType.PICKUP];
      const { registerInput, expectedPrismaInput, mockCreatedLead } = createTestLeadData(
        undefined,
        updatedServiceTypes,
      );

      const result = await testCreateLead(registerInput, expectedPrismaInput, mockCreatedLead);

      expect(result.ServiceInterest).toHaveLength(3);
      expect(result.ServiceInterest.map((service) => service.serviceType)).toEqual(
        updatedServiceTypes,
      );
    });

    it('SHOULD handle duplicate email error and throw conflict exception', async () => {
      const { registerInput, expectedPrismaInput, mockCreatedLead } = createTestLeadData();
      await testCreateLead(registerInput, expectedPrismaInput, mockCreatedLead);

      jest.spyOn(prismaService.lead, 'create').mockImplementationOnce(() => {
        throw new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the fields: (`email`)',
          {
            code: 'P2002',
            clientVersion: '4.0.0',
            meta: { target: ['email'] },
          },
        );
      });

      await expect(leadsRepository.create(registerInput)).rejects.toThrow(ConflictException);
    });

    it('SHOULD handle other database errors appropriately', async () => {
      const registerInput = createRegisterInputFactory();

      jest.spyOn(prismaService.lead, 'create').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      await expect(leadsRepository.create(registerInput)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('SHOULD include ServiceInterest in the returned lead object', async () => {
      const { registerInput, expectedPrismaInput, mockCreatedLead } = createTestLeadData();
      const result = await testCreateLead(registerInput, expectedPrismaInput, mockCreatedLead);
      expect(result).toHaveProperty('ServiceInterest');
    });

    it('SHOULD properly construct the Prisma create input from RegisterInput', async () => {
      const { registerInput, expectedPrismaInput } = createTestLeadData();
      const createSpy = jest.spyOn(prismaService.lead, 'create');

      jest.spyOn(prismaService.lead, 'create').mockResolvedValue(createMockLeadFactory());
      await leadsRepository.create(registerInput);

      expect(createSpy).toHaveBeenCalledWith({
        data: expectedPrismaInput,
        include: { ServiceInterest: true },
      });
    });

    it('SHOULD handle unique email inputs', async () => {
      const uniqueInput = createUniqueEmailRegisterInput();
      const expectedInput = createPrismaInputFactory(uniqueInput);
      const mockLead = createMockLeadFactory(1, uniqueInput);

      await testCreateLead(uniqueInput, expectedInput, mockLead);
    });
  });
});
