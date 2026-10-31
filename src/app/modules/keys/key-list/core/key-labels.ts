import { ALL_UPSTREAMS } from '../../../shared/core/api/key.dto';

/** Um chip por upstream: `["*"]` vira "todos" e `[]` vira "nenhum". */
export function upstreamLabels(upstreams: string[]): string[] {
  if (upstreams.includes(ALL_UPSTREAMS)) {
    return ['todos'];
  }
  return upstreams.length === 0 ? ['nenhum'] : upstreams;
}
