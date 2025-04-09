import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ServiceInterest } from './service-interest.model';

@ObjectType()
export class Lead {
  @Field(() => ID)
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
