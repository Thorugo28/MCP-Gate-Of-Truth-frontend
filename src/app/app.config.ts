import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { apiErrorInterceptor } from './modules/shared/core/http/api-error.interceptor';
import { accessKeyInterceptor } from './modules/shared/identity/access-key.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([accessKeyInterceptor, apiErrorInterceptor])),
    // Campos com contorno fino em vez do bloco preenchido do Material; cores em src/styles.scss.
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' } satisfies MatFormFieldDefaultOptions,
    },
  ],
};
