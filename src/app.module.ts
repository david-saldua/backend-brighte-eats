import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configValidationSchema } from './shared/config/config.schema';
import { SharedModule } from './shared/shared.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { LeadsModule } from './leads/leads.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { GraphQLErrorFilter } from './shared/common/filters/global-exception.filter';
import { formatGraphQLError } from './shared/common/utils/graphql-error-formatter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      formatError: formatGraphQLError,
    }),
    SharedModule,
    LeadsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GraphQLErrorFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
    AppService,
  ],
})
export class AppModule {}
