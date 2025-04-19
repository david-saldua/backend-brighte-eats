import { Module } from '@nestjs/common';
import { UtilityService } from './services/utility.service';
import { CustomDateFormatScalar } from '../common/scalars/custom-date-formatter.scalar';
import { GraphqlLoggingPlugin } from '../common/plugin/graphql-logging.plugin';

@Module({
  providers: [UtilityService, CustomDateFormatScalar, GraphqlLoggingPlugin],
  exports: [UtilityService, CustomDateFormatScalar, GraphqlLoggingPlugin],
})
export class UtilityModule {}
