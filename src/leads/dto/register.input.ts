import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { ServiceType } from '../enums/service-type.enum';
import { ERROR_MESSAGES } from 'src/shared/common/constants';

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
  @IsPhoneNumber('PH', { message: ERROR_MESSAGES.LEADS.INVALID_PHONE_NUMBER })
  mobile: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  postCode: string;

  @Field(() => [ServiceType])
  @IsEnum(ServiceType, { each: true })
  @ArrayMinSize(1, {
    message: ERROR_MESSAGES.LEADS.MINIMUM_SERVICE_TYPE,
  })
  serviceType: ServiceType[];
}
