import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

export interface ClassContrustor {
  new (...args: any[]): object;
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassContrustor) {}
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // run something before a request is handled by the request handler

    return handler.handle().pipe(
      map((data: ClassContrustor) => {
        // Run something before the response is sent out

        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
          exposeUnsetFields: false, // remove fields with value of undefined
        });
      }),
    );
  }
}
