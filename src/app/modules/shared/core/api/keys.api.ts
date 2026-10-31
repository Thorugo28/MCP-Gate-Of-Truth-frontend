import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { CreatedKeyDto, CreateKeyRequest, KeyDto } from './key.dto';

@Injectable({ providedIn: 'root' })
export class KeysApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/admin/keys`;

  /** Todas as chaves, revogadas inclusive, ordenadas por nome; nunca o valor. */
  list(): Observable<KeyDto[]> {
    return this.http.get<KeyDto[]>(this.baseUrl);
  }

  /**
   * Cria a chave e devolve o valor, que não aparece de novo. Nome inválido ou upstream desconhecido: 400;
   * nome já usado (yml, banco ou revogada): 409; banco fora do ar: 503.
   */
  create(request: CreateKeyRequest): Observable<CreatedKeyDto> {
    return this.http.post<CreatedKeyDto>(this.baseUrl, request);
  }

  /** Revoga na hora (204, também se já estava revogada). Chave do yml: 409; desconhecida: 404. */
  revoke(name: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(name)}`);
  }
}
