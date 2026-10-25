import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { ToolDto } from './tool.dto';
import { UpstreamDto } from './upstream.dto';

@Injectable({ providedIn: 'root' })
export class UpstreamsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/admin/upstreams`;

  /** Faz `ping` em cada upstream no backend: pode demorar. */
  list(): Observable<UpstreamDto[]> {
    return this.http.get<UpstreamDto[]>(this.baseUrl);
  }

  /** Tools do upstream, ordenadas por nome. Chave desconhecida responde 404. */
  listTools(key: string): Observable<ToolDto[]> {
    return this.http.get<ToolDto[]>(`${this.baseUrl}/${encodeURIComponent(key)}/tools`);
  }
}
