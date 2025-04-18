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

  /**
   * Registers a new lead in the system
   * @param data - The lead registration data
   * @returns A promise containing the lead response with success message
   * @throws Will handle and propagate any errors that occur during registration
   */
  async registerLead(data: RegisterInput): Promise<LeadResponse> {
    try {
      const lead = await this.leadRepository.create(data);

      return this.utilityService.handleSuccess(
        lead,
        SUCCESS_MESSAGES.LEADS.REGISTERED,
        HttpStatus.CREATED,
      );
    } catch (error) {
      this.utilityService.handleError(error);
    }
  }
}
