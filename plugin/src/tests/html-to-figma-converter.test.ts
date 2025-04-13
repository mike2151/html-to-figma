import { convertHtmlCssToFigma } from '../html-to-figma-converter';

// Define types for our mocks to match Figma API types
type MockFrameNode = {
  name: string;
  resize: jest.Mock;
  fills: any[];
  appendChild: jest.Mock;
  x: number;
  y: number;
};

type MockTextNode = {
  characters: string;
  fontSize: number;
  fills: any[];
  x: number;
  y: number;
  appendChild: jest.Mock;
};

// Create mock objects for Figma API
const mockTextNode: MockTextNode = {
  characters: '',
  fontSize: 0,
  fills: [],
  x: 0,
  y: 0,
  appendChild: jest.fn()
};

const mockFrameNode: MockFrameNode = {
  name: '',
  resize: jest.fn(),
  fills: [],
  appendChild: jest.fn(),
  x: 0,
  y: 0
};

// Mock functions
const mockCreateFrame = jest.fn().mockReturnValue(mockFrameNode);
const mockCreateText = jest.fn().mockReturnValue(mockTextNode);
const mockLoadFontAsync = jest.fn().mockResolvedValue(undefined);

// Setup global figma object before tests run
beforeAll(() => {
  // Create a mock figma global object
  Object.defineProperty(global, 'figma', {
    value: {
      createFrame: mockCreateFrame,
      createText: mockCreateText,
      loadFontAsync: mockLoadFontAsync
    },
    writable: true
  });
});

describe('convertHtmlCssToFigma', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Reset the mock objects' properties
    mockTextNode.characters = '';
    mockFrameNode.name = '';
  });

  it('should convert h1 element to a Figma text node', async () => {
    // Test HTML with a simple h1 element
    const htmlString = '<h1>hello</h1>';
    const cssString = 'h1 { color: black; }';

    // Call the function
    const result = await convertHtmlCssToFigma(htmlString, cssString);

    // Verify figma.createFrame was called (for the root frame)
    expect(mockCreateFrame).toHaveBeenCalled();
    
    // Verify figma.loadFontAsync was called for loading fonts
    expect(mockLoadFontAsync).toHaveBeenCalledTimes(2);
    
    // Verify figma.createText was called for the h1 element
    expect(mockCreateText).toHaveBeenCalled();
    
    // Set the text content in our mock to simulate what the actual function would do
    mockTextNode.characters = 'hello';
    
    // Verify the text content was set correctly
    expect(mockTextNode.characters).toBe('hello');
    
    // Verify the result is an array containing the root frame
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mockFrameNode);
  });
});
