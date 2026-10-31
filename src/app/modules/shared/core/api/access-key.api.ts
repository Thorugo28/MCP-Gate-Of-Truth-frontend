import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';

@Injectable({ providedIn: 'root' })
export class AccessKeyApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * Testa uma chave antes de guardar, com `GET /admin/upstreams` (o gateway não tem endpoint próprio).
   * Completa se a chave vale para o painel; 401 = chave inválida, 403 = chave sem `admin: true`.
   */
  verify(key: string): Observable<void> {
    return this.http
      .get(`${this.baseUrl}/admin/upstreams`, { headers: { Authorization: `Bearer ${key}` } })
      .pipe(map(() => undefined));
  }
}
