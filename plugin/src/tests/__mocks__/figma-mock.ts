// Define types for our mocks to match Figma API types
export type MockFrameNode = {
  name: string;
  resize: jest.Mock;
  fills: any[];
  appendChild: jest.Mock;
  x: number;
  y: number;
  children: any[];
  layoutMode: string;
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
  // Create the mock object
  const mockFrameNode: MockFrameNode = {
    name: '',
    resize: jest.fn(),
    fills: [],
    appendChild: jest.fn((child) => {
      // When appendChild is called, add the child to the children array
      mockFrameNode.children.push(child);
      return child;
    }),
    x: 0,
    y: 0,
    children: [],
    layoutMode: 'NONE'
  };
  
  return mockFrameNode;
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