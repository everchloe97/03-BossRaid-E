import { ExecutionContext, Injectable, NestInterceptor, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/minimal';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        Sentry.captureException(error);

        return of({
          statusCode: error.response.statusCode || 400,
          errorType: error.response.error || 'Unexpected Error',
          message: error.response.message || 'Unexpected Error MSG',
        });
      }),
    );
  }
}
