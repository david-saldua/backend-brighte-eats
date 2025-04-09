import { HttpStatus, Injectable } from '@nestjs/common';
import { LeadsRepository } from '../repositories/leads.repository';
import { RegisterInput } from '../dto/register.input';
import { UtilityService } from 'src/shared/utilities/services/utility.service';
import { LeadResponse } from '../dto/lead-response.type';

@Injectable()
export class LeadsService {
  constructor(
    private leadRepository: LeadsRepository,
    private utilityService: UtilityService,
  ) {}

  async registerLead(data: RegisterInput): Promise<LeadResponse> {
    const lead = await this.leadRepository.create(data);

    const leadResponse = this.utilityService.handleSuccess(
      lead,
      'Lead registered successfully',
      HttpStatus.CREATED,
    );

    return leadResponse;
  }
}
