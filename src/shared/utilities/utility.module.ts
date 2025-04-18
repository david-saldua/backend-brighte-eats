import { Module } from '@nestjs/common';
import { UtilityService } from './services/utility.service';
import { CustomDateFormatScalar } from '../common/scalars/custom-date-formatter.scalar';

@Module({
  providers: [UtilityService, CustomDateFormatScalar],
  exports: [UtilityService, CustomDateFormatScalar],
})
export class UtilityModule {}
