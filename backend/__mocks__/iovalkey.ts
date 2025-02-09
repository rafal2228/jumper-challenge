import { beforeEach, vi } from 'vitest';

const map = new Map<string, string>();

const valkeyMock = {
  get: vi.fn(async (key) => map.get(key)),
  set: vi.fn(async (key, value) => {
    map.set(key, value);
  }),
  del: vi.fn(async (key) => {
    map.delete(key);
  }),
};

beforeEach(() => {
  map.clear();
  valkeyMock.get.mockClear();
  valkeyMock.set.mockClear();
  valkeyMock.del.mockClear();
});

export default vi.fn(() => valkeyMock);
