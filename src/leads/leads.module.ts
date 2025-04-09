import { Module } from '@nestjs/common';
import { LeadsService } from './services/leads.service';
import { LeadsRepository } from './repositories/leads.repository';
import { LeadsResolver } from './resolvers/leads.resolver';

@Module({
  providers: [LeadsService, LeadsRepository, LeadsResolver],
})
export class LeadsModule {}
