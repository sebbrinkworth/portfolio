import { vi, type Mock } from 'vitest';

export interface MockResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}

export function createFetchMock(): Mock<[], Promise<MockResponse>> {
  return vi.fn((): Promise<MockResponse> => {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    });
  });
}

export function createFetchMockWithResponse(
  data: unknown, 
  options: Partial<MockResponse> = {}
): Mock<[], Promise<MockResponse>> {
  return vi.fn((): Promise<MockResponse> => {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      ...options,
    });
  });
}
