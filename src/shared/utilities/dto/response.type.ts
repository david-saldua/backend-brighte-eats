import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

/**
 * Create a base response type for GraphQL
 * @param ItemType  the type of data being return
 */
export function createResponseType<T>(ItemType: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class ResponseType {
    @Field(() => Boolean)
    success: boolean;

    @Field(() => Int)
    statusCode: number;

    @Field(() => String)
    message: string;

    @Field(() => ItemType, { nullable: true })
    data?: T;
  }

  return ResponseType;
}

/**
 * Create a response type for the list data
 * @param ItemType  the type of data being return in the list
 */
export function createListResponseType<T>(ItemType: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class ListResponseType {
    @Field(() => Boolean)
    success: boolean;

    @Field(() => String)
    statusCode: number;

    @Field(() => String)
    message: string;

    @Field(() => [ItemType], { nullable: true })
    data?: T[];
  }
  return ListResponseType;
}
