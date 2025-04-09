import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UtilityModule } from './utilities/utility.module';

@Global()
@Module({
  imports: [PrismaModule, UtilityModule],
  exports: [PrismaModule, UtilityModule],
})
export class SharedModule {}
