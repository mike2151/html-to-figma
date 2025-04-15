// Define types for our mocks to match Figma API types
export type MockFrameNode = {
  name: string;
  resize: jest.Mock;
  fills: any[];
  appendChild: jest.Mock;
  x: number;
  y: number;
};

export type MockTextNode = {
  characters: string;
  fontSize: number;
  fills: any[];
  x: number;
  y: number;
  appendChild: jest.Mock;
};

export function createMockFrameNode(): MockFrameNode {
  return {
    name: '',
    resize: jest.fn(),
    fills: [],
    appendChild: jest.fn(),
    x: 0,
    y: 0
  };
}

export function createMockTextNode(): MockTextNode {
  return {
    characters: '',
    fontSize: 0,
    fills: [],
    x: 0,
    y: 0,
    appendChild: jest.fn()
  };
}