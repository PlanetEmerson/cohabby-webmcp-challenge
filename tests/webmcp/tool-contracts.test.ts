import { describe, expect, it, vi } from 'vitest';

import { parseToolInput, ToolContractError } from '@/lib/webmcp/tool-contracts';

describe('WebMCP input contracts', () => {
  it('executes the generated validators as native ESM without a CommonJS require global', () => {
    const moduleUrl = pathToFileURL(path.resolve('lib/webmcp/generated/tool-validators.mjs')).href;
    const script = `const validators = await import(${JSON.stringify(moduleUrl)}); if (!validators.validateStageLivingBrief({ market: 'New York' })) process.exit(2);`;
    expect(() => execFileSync(process.execPath, ['--input-type=module', '--eval', script]))
      .not.toThrow();
  });

  it('loads and validates without access to the Function constructor required by unsafe-eval', async () => {
    const originalFunction = globalThis.Function;
    vi.resetModules();
    globalThis.Function = function blockedFunction(): never {
      throw new EvalError('unsafe-eval blocked');
    } as unknown as FunctionConstructor;
    try {
      const contracts = await import('@/lib/webmcp/tool-contracts');
      expect(contracts.parseToolInput('get_living_context', {})).toEqual({});
    } finally {
      globalThis.Function = originalFunction;
      vi.resetModules();
    }
  });

  it('accepts the exact bounded inputs for all six public tools', () => {
    expect(parseToolInput('get_living_context', {})).toEqual({});
    expect(parseToolInput('find_compatible_rooms', {
      limit: 6,
      order: 'lowest_price',
    })).toEqual({ limit: 6, order: 'lowest_price' });
    expect(parseToolInput('compare_shortlist', {
      roomRefs: ['room_nyc_cedar', 'room_nyc_hudson'],
      dimensions: ['synergy_read', 'budget', 'house_rules'],
    })).toEqual({
      roomRefs: ['room_nyc_cedar', 'room_nyc_hudson'],
      dimensions: ['synergy_read', 'budget', 'house_rules'],
    });
    expect(parseToolInput('explain_synergy_match', {
      roomRef: 'room_nyc_cedar',
    })).toEqual({ roomRef: 'room_nyc_cedar' });
    expect(parseToolInput('prepare_introduction', {
      roomRef: 'room_nyc_cedar',
      tone: 'warm',
      highlightCodes: ['budget_fit', 'daily_rhythm_fit'],
    })).toEqual({
      roomRef: 'room_nyc_cedar',
      tone: 'warm',
      highlightCodes: ['budget_fit', 'daily_rhythm_fit'],
    });
  });

  it('accepts a bounded practical living brief', () => {
    expect(parseToolInput('stage_living_brief', {
      market: 'New York',
      currency: 'USD',
      maxMonthlyBudget: 1900,
      moveWindow: 'within_30_days',
      homeType: 'room_in_shared_home',
      pets: 'cat',
      smoking: 'no_smoking',
      quietTime: 'early_evenings',
    })).toEqual({
      market: 'New York',
      currency: 'USD',
      maxMonthlyBudget: 1900,
      moveWindow: 'within_30_days',
      homeType: 'room_in_shared_home',
      pets: 'cat',
      smoking: 'no_smoking',
      quietTime: 'early_evenings',
    });
  });

  it('rejects unknown living-brief properties before they reach product state', () => {
    expect(() => parseToolInput('stage_living_brief', {
      market: 'New York',
      religion: 'any',
    })).toThrowError(new ToolContractError('invalid_input'));
  });

  it('rejects non-plain, accessor-backed, and trap-throwing input objects', () => {
    class LivingPlanPayload {
      market = 'New York';
    }
    const accessorPayload = Object.defineProperty({}, 'market', {
      enumerable: true,
      get: () => 'New York',
    });
    const trappedPayload = new Proxy({ market: 'New York' }, {
      ownKeys: () => { throw new Error('proxy trap'); },
    });

    expect(() => parseToolInput('stage_living_brief', new LivingPlanPayload()))
      .toThrowError(new ToolContractError('invalid_input'));
    expect(() => parseToolInput('stage_living_brief', accessorPayload))
      .toThrowError(new ToolContractError('invalid_input'));
    expect(() => parseToolInput('stage_living_brief', trappedPayload))
      .toThrowError(new ToolContractError('invalid_input'));
  });

  it.each([
    ['stage_living_brief', {}],
    ['stage_living_brief', { market: 'N' }],
    ['stage_living_brief', { currency: 'usd' }],
    ['stage_living_brief', { maxMonthlyBudget: 99 }],
    ['find_compatible_rooms', { limit: 7 }],
    ['find_compatible_rooms', { order: 'nearest' }],
    ['compare_shortlist', { roomRefs: ['room_nyc_cedar', 'room_nyc_cedar'] }],
    ['compare_shortlist', { roomRefs: ['listing_123', 'room_nyc_cedar'] }],
    ['explain_synergy_match', {}],
    ['explain_synergy_match', { roomRef: 'person_demo_maya' }],
    ['explain_synergy_match', { roomRef: 'room_nyc_cedar', includeFormula: true }],
    ['prepare_introduction', { roomRef: 'room_nyc_cedar', tone: 'salesy' }],
    ['get_living_context', { includeHidden: true }],
  ] as const)('rejects an out-of-contract %s payload', (name, input) => {
    expect(() => parseToolInput(name, input)).toThrowError(new ToolContractError('invalid_input'));
  });

  it('rejects demographic and protected-trait language hidden in the market field', () => {
    expect(() => parseToolInput('stage_living_brief', {
      market: 'a mostly white Christian neighborhood',
    })).toThrowError(new ToolContractError('unsafe_housing_request'));
  });
});
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
