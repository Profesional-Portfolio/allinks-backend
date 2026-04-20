import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

const g = globalThis as unknown as Record<string, unknown>;

g.jest = jest;
g.expect = expect;
g.beforeEach = beforeEach;
g.afterEach = afterEach;
g.beforeAll = beforeAll;
g.afterAll = afterAll;
g.describe = describe;
g.it = it;
