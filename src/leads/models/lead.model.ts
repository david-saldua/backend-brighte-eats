import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ServiceInterest } from './service-interest.model';

@ObjectType()
export class Lead {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  mobile: string;

  @Field()
  email: string;

  @Field()
  postCode: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [ServiceInterest])
  ServiceInterest: ServiceInterest[];
}
