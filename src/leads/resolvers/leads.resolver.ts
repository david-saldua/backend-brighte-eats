import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RegisterInput } from '../dto/register.input';
import { LeadsService } from '../services/leads.service';
import { LeadResponse } from '../dto/lead-response.type';

@Resolver()
export class LeadsResolver {
  constructor(private leadService: LeadsService) {}
  @Query(() => String)
  getLeadSample(): string {
    return 'Lead resolver';
  }

  /**
   * Registers a new lead in the system
   * @param input - The registration data for the lead
   * @returns A promise that resolves to the created lead wrapped in a LeadResponse
   */
  @Mutation(() => LeadResponse)
  async register(@Args('input') input: RegisterInput) {
    return await this.leadService.registerLead(input);
  }
}
