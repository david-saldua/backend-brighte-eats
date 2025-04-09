import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ServiceType } from '../enums/service-type.enum';

@ObjectType()
export class ServiceInterest {
  @Field(() => Int)
  id: number;

  @Field(() => ServiceType)
  serviceType: ServiceType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
