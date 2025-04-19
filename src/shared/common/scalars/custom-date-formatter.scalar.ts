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
    return this.formatDate(value);
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
  formatDate(dateValue: Date | string): IDateFormat {
    const momentDate = moment(dateValue);

    const dateTime = momentDate.format('MM/DD/YYYY (hh:mm A)');
    const time = momentDate.format('hh:mm A');
    const date = momentDate.format('MM/DD/YYYY');
    const dateFull = momentDate.format('MMMM D, YYYY');
    const timeAgo = momentDate.fromNow();
    const day = momentDate.format('dddd');
    const raw = dateValue instanceof Date ? dateValue.toISOString() : String(dateValue);

    return { dateTime, time, date, dateFull, raw, timeAgo, day };
  }
}
