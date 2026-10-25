import { argumentsTemplate, parseArguments } from './tool-arguments';

describe('argumentsTemplate', () => {
  it('fills only the required properties with empty values', () => {
    const schema = {
      type: 'object',
      properties: {
        path: { type: 'string' },
        depth: { type: 'integer' },
        tail: { type: 'number' },
        options: { type: 'object' },
      },
      required: ['path', 'depth', 'options'],
    };
    expect(argumentsTemplate(schema)).toEqual({ path: '', depth: 0, options: {} });
  });

  it('uses null for unknown types and {} for schemas without required', () => {
    expect(argumentsTemplate({ properties: { x: {} }, required: ['x'] })).toEqual({ x: null });
    expect(argumentsTemplate({ type: 'object' })).toEqual({});
  });
});

describe('parseArguments', () => {
  it('accepts a JSON object', () => {
    expect(parseArguments('{"path": "/a"}')).toEqual({ ok: true, value: { path: '/a' } });
  });

  it('rejects invalid JSON and non-objects', () => {
    expect(parseArguments('{').ok).toBe(false);
    expect(parseArguments('[]').ok).toBe(false);
    expect(parseArguments('null').ok).toBe(false);
    expect(parseArguments('"x"').ok).toBe(false);
  });
});
