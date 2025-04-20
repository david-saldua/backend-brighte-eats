import { Lead, Prisma, ServiceInterest, ServiceType } from '@prisma/client';
import { RegisterInput } from 'src/leads/dto/register.input';
import { baseLeadData, baseRegisterInput, defaultServiceTypes } from '../fixtures/lead.fixture';

/**
 * Creates a RegisterInput object for testing
 * @param overrides - Optional properties to override default values
 * @param serviceTypes - Optional service types to use (defaults to [DELIVERY, PAYMENT])
 * @returns A RegisterInput object for testing
 */
export function createRegisterInputFactory(
  overrides?: Partial<RegisterInput>,
  serviceTypes: ServiceType[] = defaultServiceTypes,
): RegisterInput {
  return {
    ...baseRegisterInput,
    serviceType: serviceTypes,
    ...overrides,
  };
}

/**
 * Creates a RegisterInput with a unique email for testing
 * @param overrides - Optional properties to override default values
 * @returns A RegisterInput with unique email
 */
export function createPrismaInputFactory(
  registerInput: RegisterInput = baseRegisterInput,
): Prisma.LeadCreateInput {
  const { serviceType, ...leadData } = registerInput;

  return {
    ...leadData,
    ...(serviceType?.length && {
      ServiceInterest: {
        create: serviceType.map((type) => ({
          serviceType: type,
        })),
      },
    }),
  };
}

/**
 * Creates a mock Lead with ServiceInterest for testing
 * @param id - Optional lead ID (defaults to 1)
 * @param leadData - Optional lead data (defaults to baseLeadData)
 * @param serviceTypes - Optional service types (defaults to [DELIVERY, PAYMENT])
 * @returns A Lead with ServiceInterest object for testing
 */
export function createMockLeadFactory(
  id: number = 1,
  leadData = baseLeadData,
  serviceTypes: ServiceType[] = defaultServiceTypes,
): Lead & { ServiceInterest: ServiceInterest[] } {
  return {
    id,
    ...leadData,
    createdAt: new Date(),
    updatedAt: new Date(),
    ServiceInterest: serviceTypes.map((serviceType, index) => ({
      id: index + 1,
      leadId: id,
      serviceType,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };
}

/**
 * Creates a RegisterInput with a unique email for testing
 * @param overrides - Optional properties to override default values
 * @returns A RegisterInput with unique email
 */
export function createUniqueEmailRegisterInput(overrides?: Partial<RegisterInput>): RegisterInput {
  return createRegisterInputFactory({
    email: `test-${Date.now()}@example.com`,
    ...overrides,
  });
}

/**
 * Helper function to create test data for the testCreateLead function
 * @param registerInputOverrides - Optional RegisterInput overrides
 * @param serviceTypes - Optional service types
 * @returns Object with registerInput, expectedPrismaInput, and mockCreatedLead
 */
export function createTestLeadData(
  registerInputOverrides?: Partial<RegisterInput>,
  serviceTypes: ServiceType[] = defaultServiceTypes,
) {
  const registerInput = createRegisterInputFactory(registerInputOverrides, serviceTypes);
  const expectedPrismaInput = createPrismaInputFactory(registerInput);
  const mockCreatedLead = createMockLeadFactory(1, registerInput, serviceTypes);

  return {
    registerInput,
    expectedPrismaInput,
    mockCreatedLead,
  };
}
