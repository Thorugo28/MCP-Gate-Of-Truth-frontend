import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../../shared/core/http/http-error';
import {
  createUpstreamErrorOf,
  envEntryError,
  EnvEntry,
  parseArgs,
  toEnv,
  upstreamKeyError,
} from './upstream-create';

describe('upstream-create', () => {
  describe('upstreamKeyError', () => {
    it('accepts the backend pattern', () => {
      expect(upstreamKeyError('docs')).toBeNull();
      expect(upstreamKeyError('my-docs-2')).toBeNull();
      expect(upstreamKeyError('a'.repeat(32))).toBeNull();
    });

    it('rejects empty, "_", a leading "-" and too long', () => {
      expect(upstreamKeyError('')).toBe('Dê uma chave para o upstream.');
      expect(upstreamKeyError('my_docs')).not.toBeNull();
      expect(upstreamKeyError('-docs')).not.toBeNull();
      expect(upstreamKeyError('a'.repeat(33))).not.toBeNull();
    });
  });

  it('turns one arg per line into an array, keeping spaces inside a line', () => {
    expect(
      parseArgs('-y\n@modelcontextprotocol/server-filesystem\r\n\n/home/x/Meus Docs  \n'),
    ).toEqual(['-y', '@modelcontextprotocol/server-filesystem', '/home/x/Meus Docs']);
    expect(parseArgs('  \n')).toEqual([]);
  });

  it('turns the env lines into an object, skipping empty lines', () => {
    expect(
      toEnv([
        { name: ' PATH ', value: '${NODE_BIN}:/usr/bin' },
        { name: '', value: '' },
      ]),
    ).toEqual({ PATH: '${NODE_BIN}:/usr/bin' });
  });

  describe('envEntryError', () => {
    function check(entry: EnvEntry, others: EnvEntry[] = []): string | null {
      return envEntryError(entry, [entry, ...others]);
    }

    it('blocks a literal secret in a secret-looking name', () => {
      expect(check({ name: 'NOTION_TOKEN', value: 'ntn_123' })).toContain('${VARIAVEL}');
      expect(check({ name: 'api_key', value: 'abc' })).toContain('${VARIAVEL}');
      expect(check({ name: 'DB_PASSWORD', value: '' })).toContain('${VARIAVEL}');
      expect(check({ name: 'NOTION_TOKEN', value: '${NOTION_TOKEN}' })).toBeNull();
    });

    it('lets a plain value through when the name is not a secret', () => {
      expect(check({ name: 'PATH', value: '/usr/bin' })).toBeNull();
      expect(check({ name: '', value: '' })).toBeNull();
    });

    it('rejects an invalid or repeated name', () => {
      expect(check({ name: '1A', value: 'x' })).not.toBeNull();
      expect(check({ name: '', value: 'x' })).not.toBeNull();
      expect(check({ name: 'PATH', value: 'x' }, [{ name: 'PATH', value: 'y' }])).toBe(
        'Variável repetida.',
      );
    });
  });

  describe('createUpstreamErrorOf', () => {
    function apiError(status: number, body: unknown = null): ApiError {
      return new ApiError(status, `HTTP ${status}`, {
        cause: new HttpErrorResponse({ status, error: body }),
      });
    }

    it('puts 409 on the key field', () => {
      expect(createUpstreamErrorOf(apiError(409))).toEqual({
        key: 'Chave já usada, no application.yml ou no painel.',
        form: null,
      });
    });

    it('shows the backend message of a 400 on the form', () => {
      const error = apiError(400, {
        error: "O comando '/bin/sh' não está em gate.upstreams.allowed-commands",
      });

      expect(createUpstreamErrorOf(error)).toEqual({
        key: null,
        form: "O comando '/bin/sh' não está em gate.upstreams.allowed-commands",
      });
      expect(createUpstreamErrorOf(apiError(400)).form).toContain('recusou');
    });

    it('leaves 503 to the snackbar', () => {
      expect(createUpstreamErrorOf(apiError(503))).toEqual({ key: null, form: null });
    });
  });
});
