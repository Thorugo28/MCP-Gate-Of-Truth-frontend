// Espelha admin/UpstreamDto (record) do backend.
export type UpstreamStatus = 'UP' | 'DOWN';

export interface UpstreamDto {
  key: string;
  serverName: string;
  serverVersion: string;
  status: UpstreamStatus;
  toolCount: number;
}
