import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { CallDto, CallQuery } from './call.dto';

@Injectable({ providedIn: 'root' })
export class CallsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/admin/calls`;

  /**
   * Últimas chamadas de tool, mais recentes primeiro. Ficam no banco do gateway (sobrevivem ao reinício);
   * banco fora do ar responde 503. Filtro vazio não vai na URL.
   */
  list(query: CallQuery = {}): Observable<CallDto[]> {
    let params = new HttpParams();
    for (const [name, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(name, String(value));
      }
    }
    return this.http.get<CallDto[]>(this.baseUrl, { params });
  }
}
