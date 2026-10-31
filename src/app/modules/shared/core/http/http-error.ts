import { HttpErrorResponse } from '@angular/common/http';

/** Erro HTTP da API /admin já com mensagem para a tela. O interceptor converte todo `HttpErrorResponse` nele. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ApiError';
  }
}

export function toApiError(error: HttpErrorResponse, baseUrl: string): ApiError {
  const options = { cause: error };
  if (error.status === 0) {
    return new ApiError(
      0,
      `Não foi possível falar com o gateway em ${baseUrl}. Ele está no ar?`,
      options,
    );
  }
  if (error.status >= 500) {
    return new ApiError(
      error.status,
      `O gateway respondeu com erro (HTTP ${error.status}).`,
      options,
    );
  }
  return new ApiError(
    error.status,
    `A requisição foi recusada pelo gateway (HTTP ${error.status}).`,
    options,
  );
}

/**
 * Status HTTP de um erro da API, direto ou embrulhado por um `resource` (em `cause`).
 * `null` se o erro não for HTTP.
 */
export function httpStatusOf(error: unknown): number | null {
  const candidate = isHttpError(error) ? error : (error as { cause?: unknown })?.cause;
  return isHttpError(candidate) ? candidate.status : null;
}

/** Mensagem para a tela; `null` se não houver erro. */
export function errorMessageOf(error: unknown): string | null {
  if (!error) {
    return null;
  }
  return error instanceof ApiError
    ? error.message
    : 'Erro inesperado. Veja o console do navegador.';
}

/** O `error` do corpo `{"error": "..."}` que o backend manda em alguns 400; `null` se não vier. */
export function serverErrorOf(error: unknown): string | null {
  const response = error instanceof ApiError ? error.cause : error;
  if (!(response instanceof HttpErrorResponse)) {
    return null;
  }
  const body = response.error as { error?: unknown } | null;
  return typeof body?.error === 'string' && body.error !== '' ? body.error : null;
}

function isHttpError(error: unknown): error is ApiError | HttpErrorResponse {
  return error instanceof ApiError || error instanceof HttpErrorResponse;
}
