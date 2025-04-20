import { Lead, Prisma, ServiceInterest, ServiceType } from '@prisma/client';
import { RegisterInput } from 'src/leads/dto/register.input';

export const baseLeadData = {
  email: 'Garrison_Greenfelder87@hotmail.com',
  mobile: '+63-946-922-8301',
  name: 'Dr. Lana Mann',
  postCode: '15-886-982-1098',
};

export const defaultServiceTypes = [ServiceType.DELIVERY, ServiceType.PAYMENT];

export const baseRegisterInput: RegisterInput = {
  ...baseLeadData,
  serviceType: defaultServiceTypes,
};

export const basePrismaInput: Prisma.LeadCreateInput = {
  ...baseLeadData,
  ServiceInterest: {
    create: defaultServiceTypes.map((serviceType) => ({ serviceType })),
  },
};

export const baseMockCreatedLead: Lead & { ServiceInterest: ServiceInterest[] } = {
  id: 1,
  ...baseLeadData,
  createdAt: new Date(),
  updatedAt: new Date(),
  ServiceInterest: defaultServiceTypes.map((serviceType, index) => ({
    id: index + 1,
    leadId: 1,
    serviceType,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
};
