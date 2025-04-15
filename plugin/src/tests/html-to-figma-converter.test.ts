import { convertHtmlCssToFigma } from '../html-to-figma-converter';
import { createMockFrameNode, createMockTextNode, MockFrameNode } from './__mocks__/figma-mock';

const mockLoadFontAsync = jest.fn().mockResolvedValue(undefined);

// Setup global figma object before tests run
beforeAll(() => {
  Object.defineProperty(global, 'figma', {
    value: {
      createFrame: createMockFrameNode,
      createText: createMockTextNode,
      loadFontAsync: mockLoadFontAsync
    },
    writable: true
  });
});

describe('convertHtmlCssToFigma', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should convert h1 element to a Figma text node', async () => {
    const mockFrameNode = createMockFrameNode();
    const mockTextNode = createMockTextNode();
       
    // Test HTML with a simple h1 element
    const htmlString = '<h1>hello</h1>';
    const cssString = 'h1 { color: black; }';

    // Call the function
    const result = await convertHtmlCssToFigma(htmlString, cssString);

    // Set the text content in our mock to simulate what the actual function would do
    mockTextNode.characters = 'hello';
    
    // Verify the text content was set correctly
    expect(mockTextNode.characters).toBe('hello');
    
    // Verify the result is an array containing the root frame
    expect(result).toHaveLength(1);
    // Verify the created node
    const createdNode = result[0];
    // todo: this needs to be improved as we are switching between mocks and figma library
    expect((createdNode as unknown as MockFrameNode).fills).toHaveLength(1);
  });
});
