import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UtilityModule } from './utilities/utility.module';
import { LoggerModule } from './logger/logger.module';

@Global()
@Module({
  imports: [PrismaModule, UtilityModule, LoggerModule],
  exports: [PrismaModule, UtilityModule, LoggerModule],
})
export class SharedModule {}
