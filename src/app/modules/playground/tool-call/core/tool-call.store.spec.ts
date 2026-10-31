import { HttpErrorResponse } from '@angular/common/http';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToolDto } from '../../../shared/core/api/tool.dto';
import { ToolsApi } from '../../../shared/core/api/tools.api';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';
import { ToolCallStore } from './tool-call.store';

describe('ToolCallStore', () => {
  const readFile: ToolDto = {
    name: 'filesystem__read_file',
    originalName: 'read_file',
    description: null,
    inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
    enabled: true,
  };
  const writeFile: ToolDto = {
    name: 'filesystem__write_file',
    originalName: 'write_file',
    description: null,
    inputSchema: { type: 'object' },
    enabled: false,
  };
  let call: ReturnType<typeof vi.fn>;

  async function setup(tool: string | null): Promise<ToolCallStore> {
    TestBed.configureTestingModule({
      providers: [
        ToolCallStore,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(tool ? { tool } : {}) } },
        },
        {
          provide: UpstreamsApi,
          useValue: {
            list: () => of([]),
            listTools: (key: string) =>
              key === 'filesystem'
                ? of([readFile, writeFile])
                : throwError(() => new HttpErrorResponse({ status: 404 })),
          },
        },
        { provide: ToolsApi, useValue: { call } },
      ],
    });
    const store = TestBed.inject(ToolCallStore);
    await TestBed.inject(ApplicationRef).whenStable();
    return store;
  }

  beforeEach(() => {
    call = vi.fn(() => of({ content: [{ type: 'text', text: 'ok' }] }));
  });

  it('preselects upstream and tool from ?tool= and prefills the arguments', async () => {
    const store = await setup('filesystem__read_file');

    expect(store.upstreamKey()).toBe('filesystem');
    expect(store.selectedTool()).toEqual(readFile);
    expect(JSON.parse(store.argumentsText())).toEqual({ path: '' });
  });

  it('flags a tool from the URL that does not exist', async () => {
    expect((await setup('filesystem__nope')).toolNotFound()).toBe(true);
    TestBed.resetTestingModule();
    expect((await setup('xpto__a')).toolNotFound()).toBe(true);
  });

  it('offers only the enabled tools', async () => {
    const store = await setup(null);
    store.selectUpstream('filesystem');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.tools()).toEqual([readFile]);
  });

  it('flags a disabled tool from the URL without offering the call', async () => {
    const store = await setup('filesystem__write_file');

    expect(store.selectedToolDisabled()).toBe(true);
    expect(store.toolNotFound()).toBe(false);
    expect(store.selectedTool()).toBeNull();
    expect(store.canCall()).toBe(false);
  });

  it('calls the tool with the parsed arguments and treats missing isError as false', async () => {
    const store = await setup('filesystem__read_file');
    store.argumentsText.set('{"path": "/a"}');

    store.call();

    expect(call).toHaveBeenCalledWith('filesystem__read_file', { path: '/a' });
    expect(store.result()?.isError).toBe(false);
  });

  it('reports a 404 on call as missing, disabled or down and refreshes the picker', async () => {
    const store = await setup('filesystem__read_file');
    call.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const upstreamsApi = TestBed.inject(UpstreamsApi);
    const list = vi.spyOn(upstreamsApi, 'list');
    const listTools = vi.spyOn(upstreamsApi, 'listTools');

    store.call();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.callError()).toBe(
      'Tool não encontrada, desligada ou com o upstream filesystem fora do ar.',
    );
    expect(list).toHaveBeenCalled();
    expect(listTools).toHaveBeenCalled();
  });

  it('does not call with invalid JSON', async () => {
    const store = await setup('filesystem__read_file');
    store.argumentsText.set('{');

    expect(store.canCall()).toBe(false);
    store.call();
    expect(call).not.toHaveBeenCalled();
  });
});
