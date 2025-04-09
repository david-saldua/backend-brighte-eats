import { registerEnumType } from '@nestjs/graphql';
import { ServiceType as PrismaServiceType } from '@prisma/client';

export const ServiceType = PrismaServiceType;
export type ServiceType = PrismaServiceType;

registerEnumType(ServiceType, {
  name: 'ServiceType',
  description: 'The types of services offered',
});
