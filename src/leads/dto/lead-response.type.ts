import { ObjectType } from '@nestjs/graphql';
import { createListResponseType, createResponseType } from 'src/shared/utilities/dto/response.type';
import { Lead } from '../models/lead.model';

@ObjectType()
export class LeadResponse extends createResponseType(Lead) {}

@ObjectType()
export class LeadListResponse extends createListResponseType(Lead) {}
