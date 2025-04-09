import { Module } from '@nestjs/common';
import { UtilityService } from './services/utility.service';

@Module({
  providers: [UtilityService],
  exports: [UtilityService],
})
export class UtilityModule {}
