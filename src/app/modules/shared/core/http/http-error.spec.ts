import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, errorMessageOf, httpStatusOf, serverErrorOf, toApiError } from './http-error';

describe('http-error', () => {
  const notFound = new HttpErrorResponse({ status: 404 });

  describe('httpStatusOf', () => {
    it('reads the status of an HttpErrorResponse or ApiError', () => {
      expect(httpStatusOf(notFound)).toBe(404);
      expect(httpStatusOf(new ApiError(500, 'x'))).toBe(500);
    });

    it('reads the status when wrapped in cause', () => {
      expect(httpStatusOf(new Error('wrapped', { cause: notFound }))).toBe(404);
    });

    it('returns null for non-HTTP errors', () => {
      expect(httpStatusOf(new Error('boom'))).toBeNull();
      expect(httpStatusOf(undefined)).toBeNull();
    });
  });

  describe('toApiError', () => {
    it('explains a gateway that is down (status 0)', () => {
      const error = toApiError(new HttpErrorResponse({ status: 0 }), 'http://gw');
      expect(error.status).toBe(0);
      expect(error.message).toContain('http://gw');
    });

    it('keeps the status of server errors', () => {
      expect(toApiError(new HttpErrorResponse({ status: 503 }), 'http://gw').message).toContain(
        '503',
      );
    });
  });

  describe('errorMessageOf', () => {
    it('uses the ApiError message and a generic one otherwise', () => {
      expect(errorMessageOf(new ApiError(0, 'fora do ar'))).toBe('fora do ar');
      expect(errorMessageOf(new Error('x'))).toContain('inesperado');
      expect(errorMessageOf(undefined)).toBeNull();
    });
  });

  describe('serverErrorOf', () => {
    it('reads the error field of the body, also through an ApiError', () => {
      const response = new HttpErrorResponse({ status: 400, error: { error: 'Falta o command' } });

      expect(serverErrorOf(response)).toBe('Falta o command');
      expect(serverErrorOf(toApiError(response, 'http://gw'))).toBe('Falta o command');
    });

    it('is null without a usable body', () => {
      expect(serverErrorOf(new HttpErrorResponse({ status: 409 }))).toBeNull();
      expect(serverErrorOf(new HttpErrorResponse({ status: 400, error: 'texto' }))).toBeNull();
      expect(serverErrorOf(new ApiError(400, 'x'))).toBeNull();
    });
  });
});
