import { HttpStatus, Injectable } from '@nestjs/common';
import { LeadsRepository } from '../repositories/leads.repository';
import { RegisterInput } from '../dto/register.input';
import { UtilityService } from 'src/shared/utilities/services/utility.service';
import { LeadResponse } from '../dto/lead-response.type';
import { SUCCESS_MESSAGES } from 'src/shared/common/constants';

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
      SUCCESS_MESSAGES.LEADS.REGISTERED,
      HttpStatus.CREATED,
    );

    return leadResponse;
  }
}
