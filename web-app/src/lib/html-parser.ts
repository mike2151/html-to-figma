// Simple HTML parser to create a DOM-like structure

export interface HtmlNode {
    tag: string;
    attributes: Record<string, string>;
    children: HtmlNode[];
    textContent: string;
  }
  
  export function parseHtml(htmlString: string): HtmlNode {
    // For a full implementation, you'd want to use a proper HTML parser
    // This is a simplified version for demonstration
    
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Convert the parsed DOM to our simplified structure
    const rootElement = doc.body;
    return domToHtmlNode(rootElement);
  }
  
  function domToHtmlNode(element: Element | ChildNode): HtmlNode {
    // Handle text nodes
    if (element.nodeType === Node.TEXT_NODE) {
      return {
        tag: '#text',
        attributes: {},
        children: [],
        textContent: element.textContent || '',
      };
    }
    
    // Handle element nodes
    if (element instanceof Element) {
      const node: HtmlNode = {
        tag: element.tagName.toLowerCase(),
        attributes: {},
        children: [],
        textContent: element.textContent || '',
      };
      
      // Extract attributes
      Array.from(element.attributes).forEach(attr => {
        node.attributes[attr.name] = attr.value;
      });
      
      // Process children
      Array.from(element.childNodes)
        .filter(child => {
          // Filter out empty text nodes (whitespace)
          return !(child.nodeType === Node.TEXT_NODE && child.textContent?.trim() === '');
        })
        .forEach(child => {
          node.children.push(domToHtmlNode(child));
        });
      
      return node;
    }
    
    // Fallback for other node types
    return {
      tag: 'unknown',
      attributes: {},
      children: [],
      textContent: '',
    };
  }