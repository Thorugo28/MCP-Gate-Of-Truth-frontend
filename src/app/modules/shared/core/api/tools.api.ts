import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { CallToolResultDto, ToolArguments } from './tool-call.dto';
import { ToolDto } from './tool.dto';

@Injectable({ providedIn: 'root' })
export class ToolsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/admin/tools`;

  /**
   * Chama a tool de verdade no upstream. `isError: true` volta como 200 (resultado normal);
   * nome desconhecido ou tool desligada responde 404.
   */
  call(name: string, args: ToolArguments): Observable<CallToolResultDto> {
    return this.http.post<CallToolResultDto>(
      `${this.baseUrl}/${encodeURIComponent(name)}/call`,
      args,
    );
  }

  /**
   * Liga ou desliga a tool no gateway e devolve o `ToolDto` atualizado. Repetir o estado não muda nada.
   * Nome desconhecido responde 404; banco fora do ar, 503 (e nada muda).
   */
  setEnabled(name: string, enabled: boolean): Observable<ToolDto> {
    return this.http.put<ToolDto>(`${this.baseUrl}/${encodeURIComponent(name)}/enabled`, {
      enabled,
    });
  }
}
