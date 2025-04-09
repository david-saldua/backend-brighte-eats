import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { ServiceType } from '../enums/service-type.enum';

@InputType()
export class RegisterInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsPhoneNumber('PH', { message: 'Please enter a valid Philippines phone number' })
  mobile: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  postCode: string;

  @Field(() => [ServiceType])
  @IsEnum(ServiceType, { each: true })
  @MinLength(1, {
    message: 'At least one service type must be selected',
  })
  serviceType: ServiceType[];
}
