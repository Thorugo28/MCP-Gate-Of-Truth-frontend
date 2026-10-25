import { InjectionToken } from '@angular/core';
import { environment } from '../../../../../environments/environment';

/** Origem do gateway (sem barra final). Só os services de `shared/core/api` usam. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});
