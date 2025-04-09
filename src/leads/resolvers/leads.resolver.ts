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

  @Mutation(() => LeadResponse)
  async register(@Args('input') input: RegisterInput) {
    const lead = await this.leadService.registerLead(input);
    return lead;
  }
}
