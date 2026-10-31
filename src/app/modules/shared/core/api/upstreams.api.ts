import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { ToolDto } from './tool.dto';
import { AuthorizeResponse, CreateUpstreamRequest, UpstreamDto } from './upstream.dto';

@Injectable({ providedIn: 'root' })
export class UpstreamsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/admin/upstreams`;

  /** Status guardado pelo health check do backend: responde rápido. */
  list(): Observable<UpstreamDto[]> {
    return this.http.get<UpstreamDto[]>(this.baseUrl);
  }

  /** Tools do upstream, ordenadas por nome. Chave desconhecida responde 404. */
  listTools(key: string): Observable<ToolDto[]> {
    return this.http.get<ToolDto[]>(`${this.baseUrl}/${encodeURIComponent(key)}/tools`);
  }

  /** Comandos que um upstream do painel pode usar, já resolvidos (ex.: `/usr/bin/npx`). */
  allowedCommands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/allowed-commands`);
  }

  /**
   * Cadastra e devolve o upstream em DOWN; o health check conecta em segundos. Entrada inválida, comando fora da
   * lista ou referência que não resolve: 400 com `{ error }`; chave já usada: 409; banco fora do ar: 503.
   */
  create(request: CreateUpstreamRequest): Observable<UpstreamDto> {
    return this.http.post<UpstreamDto>(this.baseUrl, request);
  }

  /**
   * Começa o login OAuth de um upstream HTTP; o login acontece no navegador e a volta cai no gateway.
   * Desconhecido: 404; STDIO: 400 com `{ error }`; servidor de autorização falhou: 502 com `{ error }`; banco fora: 503.
   */
  authorize(key: string): Observable<AuthorizeResponse> {
    return this.http.post<AuthorizeResponse>(
      `${this.baseUrl}/${encodeURIComponent(key)}/authorize`,
      null,
    );
  }

  /** 204: as tools somem na hora. Do yml: 409; desconhecido: 404. */
  remove(key: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(key)}`);
  }
}
