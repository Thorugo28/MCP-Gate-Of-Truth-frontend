import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../api/api-base-url';
import { toApiError } from './http-error';

/** Todo erro HTTP vira `ApiError` (status + mensagem); cada tela decide o que fazer com ele, inclusive 404. */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = inject(API_BASE_URL);
  return next(req).pipe(
    catchError((error: unknown) =>
      throwError(() => (error instanceof HttpErrorResponse ? toApiError(error, baseUrl) : error)),
    ),
  );
};
