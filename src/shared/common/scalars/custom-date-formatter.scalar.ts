import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import * as moment from 'moment';
import { IDateFormat } from '../interfaces/date-format.interface';

@Scalar('CustomDateFormat', () => Date)
export class CustomDateFormatScalar implements CustomScalar<IDateFormat, Date> {
  description = 'Custom date format scalar type';

  parseValue(value: string): Date {
    return new Date(value);
  }

  serialize(value: Date): IDateFormat {
    const stringDate = value.toDateString();
    const formattedDate = this.formatDate(stringDate);
    return formattedDate;
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
  formatDate(dateValue: string): IDateFormat {
    const dateTime = moment(dateValue).format('MM/DD/YYYY (hh:mm A)');
    const time = moment(dateValue).format('hh:mm A');
    const date = moment(dateValue).format('MM/DD/YYYY');
    const dateFull = moment(dateValue).format('MMMM D, YYYY');
    const timeAgo = moment(dateValue).fromNow();
    const day = moment(dateValue).format('dddd');
    const raw = dateValue;
    return { dateTime, time, date, dateFull, raw, timeAgo, day };
  }
}
