import {
  jest,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  describe,
  it,
} from '@jest/globals';

(globalThis as any).jest = jest;
(globalThis as any).expect = expect;
(globalThis as any).beforeEach = beforeEach;
(globalThis as any).afterEach = afterEach;
(globalThis as any).beforeAll = beforeAll;
(globalThis as any).afterAll = afterAll;
(globalThis as any).describe = describe;
(globalThis as any).it = it;
