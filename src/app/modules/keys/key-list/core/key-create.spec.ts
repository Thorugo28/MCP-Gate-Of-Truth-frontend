import { ApiError } from '../../../shared/core/http/http-error';
import { createKeyErrorOf, keyNameError, mcpAddCommand, normalizeUpstreams } from './key-create';

describe('key-create', () => {
  describe('keyNameError', () => {
    it('accepts the backend pattern', () => {
      expect(keyNameError('teste_1-a')).toBeNull();
      expect(keyNameError('a'.repeat(64))).toBeNull();
    });

    it('rejects empty, too long and other characters', () => {
      expect(keyNameError('')).toBe('Dê um nome para a chave.');
      expect(keyNameError('a'.repeat(65))).not.toBeNull();
      expect(keyNameError('com espaço')).not.toBeNull();
      expect(keyNameError('a/b')).not.toBeNull();
    });
  });

  describe('normalizeUpstreams', () => {
    it('keeps only "*" when it is picked', () => {
      expect(normalizeUpstreams(['filesystem'], ['filesystem', '*'])).toEqual(['*']);
    });

    it('drops "*" when another upstream is picked after it', () => {
      expect(normalizeUpstreams(['*'], ['*', 'notion'])).toEqual(['notion']);
    });

    it('leaves a plain selection alone', () => {
      expect(normalizeUpstreams(['notion'], ['notion', 'filesystem'])).toEqual([
        'notion',
        'filesystem',
      ]);
      expect(normalizeUpstreams(['*'], [])).toEqual([]);
    });
  });

  describe('createKeyErrorOf', () => {
    it('puts 409 on the name field', () => {
      expect(createKeyErrorOf(new ApiError(409, 'HTTP 409'))).toEqual({
        name: 'Nome já usado, inclusive por chave revogada.',
        form: null,
      });
    });

    it('puts 400 on the form', () => {
      expect(createKeyErrorOf(new ApiError(400, 'HTTP 400')).form).toContain('recusou');
    });

    it('leaves 503 to the snackbar', () => {
      expect(createKeyErrorOf(new ApiError(503, 'HTTP 503'))).toEqual({ name: null, form: null });
    });
  });

  it('builds the Claude Code command', () => {
    expect(mcpAddCommand('http://gw/mcp', 'teste', 'abc')).toBe(
      'claude mcp add --transport http teste http://gw/mcp --header "Authorization: Bearer abc"',
    );
  });
});
