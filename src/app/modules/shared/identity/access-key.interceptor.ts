import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../core/api/api-base-url';
import { httpStatusOf } from '../core/http/http-error';
import { AccessKeyService } from './access-key.service';

/**
 * Anexa `Authorization: Bearer <chave guardada>` nas chamadas para o gateway (e só para ele).
 * 401 com a chave guardada: apaga a chave e manda para a tela de chave.
 * Pedido que já vem com `Authorization` (o teste de uma chave nova) passa sem mudança.
 */
export const accessKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = inject(API_BASE_URL);
  const accessKey = inject(AccessKeyService);
  const key = accessKey.key();
  if (!req.url.startsWith(`${baseUrl}/`) || req.headers.has('Authorization') || !key) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${key}` } })).pipe(
    catchError((error: unknown) => {
      if (httpStatusOf(error) === 401) {
        accessKey.expire();
      }
      return throwError(() => error);
    }),
  );
};
