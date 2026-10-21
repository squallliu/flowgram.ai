/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
vi.stubGlobal('crypto', { randomUUID });

import type { WorkflowNode, WorkflowSchema, RuntimeEvent } from './types';
import { createNode } from './node-catalog';
import { branches, editControlConfiguration, mapScope, portModelSignature, portModels, staticPorts } from './control-nodes';
import { executionSignature } from '../components/node-inspector/model';
import { sampleBindings } from './execution-samples';

describe('structured workflow port contracts', () => {
  const fork: WorkflowNode = { id: 'fork', type: 'control.switch', data: { mode: 'first', joinId: 'join', branches: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] } };
  const join: WorkflowNode = { id: 'join', type: 'control.merge-branches', data: { forkId: 'fork' } };
  const schema: WorkflowSchema = { nodes: [fork, join], edges: [] };
  it('builds named inputs and outputs with static numeric coordinates and no DOM targets', () => {
    const layout = staticPorts(fork, schema);
    expect(layout.ports.filter((p) => p.type === 'output').map((p) => p.portID)).toEqual(['a', 'b', 'else']);
    expect(staticPorts(join, schema).ports.filter((p) => p.type === 'input').map((p) => p.portID)).toEqual(['a', 'b', 'else']);
    expect(layout.ports.every((p) => !('targetElement' in p))).toBe(true);
    expect(layout.ports[1].locationConfig.top).toBe(102);
  });
  it('keeps identities on rename and reorder, and excludes pointer movement from port invalidation', () => {
    const next = { ...fork, data: { ...fork.data, branches: [{ id: 'b', label: '新名字' }, { id: 'a', label: 'A' }] } };
    expect(branches(next).map((b) => b.id)).toEqual(['b', 'a', 'else']);
    expect(portModelSignature({ ...schema, nodes: [{ ...fork, meta: { position: { x: 900, y: 1 } } }, join] })).toBe(portModelSignature(schema));
    expect(portModels({ ...schema, nodes: [next, join] }).join.input[0].label).toBe('新名字');
  });
  it('changes the matching join contract when switching from exclusive to inclusive', () => {
    const next = editControlConfiguration(schema, 'fork', { ...fork.data, mode: 'all' });
    expect(next.nodes[1].type).toBe('control.join');
    expect(next.nodes[1].data.forkId).toBe('fork');
  });
  it('edits and inserts in the intended nested graph only', () => {
    const loop = createNode('loop', 0);
    const root: WorkflowSchema = { nodes: [loop, fork], edges: [] };
    const childId = loop.blocks![0].id;
    const next = mapScope(root, childId, (graph) => ({ ...graph, nodes: [...graph.nodes, join] }));
    expect(next.nodes).toHaveLength(2);
    expect(next.nodes[0].blocks).toHaveLength(3);
    expect(root.nodes[0].blocks).toHaveLength(2);
  });
  it('invalidates execution samples when a target input port changes', () => {
    const loop = createNode('loop', 0);
    const modified = structuredClone(loop);
    modified.edges![0].targetPortID = 'another';
    expect(executionSignature(loop)).not.toBe(executionSignature(modified));
  });
});
describe('execution samples', () => {
  const finished = (id: string, nodeId: string, scopeId: string, parentExecutionId: string | null, iteration: number[], output: unknown): RuntimeEvent => ({ sequence: 1, kind: 'node_finished', objectId: 'run', createdAt: '', data: JSON.stringify({ executionId: id, nodeId, scopeId, parentExecutionId, iterationPath: iteration, branchPath: [], outputs: output }) });
  it('does not collapse different rounds into a single node binding', () => {
    const events = [finished('start-e', 'start', 'root', null, [], { input: 1 }), finished('loop-e', 'loop', 'root', null, [], {}), finished('round0', 'worker', 'scope0', 'loop-e', [0], { result: 'zero' }), finished('round1', 'worker', 'scope1', 'loop-e', [1], { result: 'one' })];
    expect(sampleBindings(events)).not.toHaveProperty('worker');
    expect(sampleBindings(events, 'round0').worker).toEqual({ result: 'zero' });
    expect(sampleBindings(events, 'round1').worker).toEqual({ result: 'one' });
    expect(sampleBindings(events, 'round0').start).toEqual({ input: 1 });
  });
});

it('provides declared loop locals through a nested parallel branch', () => {
  const event = (data: object): RuntimeEvent => ({ sequence: 1, kind: 'node_finished', objectId: 'run', createdAt: '', data: JSON.stringify(data) });
  const events = [
    event({ executionId: 'loop-e', nodeId: 'loop', scopeId: 'root', parentExecutionId: null, outputs: {} }),
    event({ executionId: 'entry-e', nodeId: 'entry', nodeType: 'block-start', scopeId: 'round', parentExecutionId: 'loop-e', outputs: { state: { count: 2 }, index: 0 } }),
    event({ executionId: 'fork-e', nodeId: 'fork', scopeId: 'round', parentExecutionId: 'loop-e', outputs: {} }),
    event({ executionId: 'worker-e', nodeId: 'worker', scopeId: 'branch', parentExecutionId: 'fork-e', branchPath: ['a'], iterationPath: [0], outputs: { value: 4 } }),
  ];
  expect(sampleBindings(events, 'worker-e').state).toEqual({ count: 2 });
  expect(sampleBindings(events, 'worker-e').loop_locals).toEqual({ state: { count: 2 }, index: 0 });
});
