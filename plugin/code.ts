import { ALLOWED_FIGMA_EDITOR_TYPES, PLUGIN_WINDOW_WIDTH, PLUGIN_WINDOW_HEIGHT } from './constants';

if (ALLOWED_FIGMA_EDITOR_TYPES.includes(figma.editorType)) {
  // This shows the HTML page in "ui.html".
  figma.showUI(__html__, { width: PLUGIN_WINDOW_WIDTH, height: PLUGIN_WINDOW_HEIGHT });

  figma.ui.onmessage = async (message) => {
    if (message.type === 'convert') {
      try {
        const htmlContent = message.html;
        const cssContent = message.css;

        // Create Figma nodes from the HTML and CSS
        const nodes = await convertHtmlCssToFigma(htmlContent, cssContent);
        
        // Select the created nodes in Figma
        figma.currentPage.selection = nodes;
        
        // Focus the view on the created nodes
        figma.viewport.scrollAndZoomIntoView(nodes);
        
        // Send success message back to UI
        figma.ui.postMessage({
          type: 'success',
          message: 'Conversion successful!'
        });
      } catch (error) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Error creating Figma components'
        });
      }
    }
  };
}

// Types for our simple HTML parser
interface HtmlNode {
  type: 'tag' | 'text';
  name?: string;
  attribs?: Record<string, string>;
  children?: HtmlNode[];
  data?: string;
}

// Types for our simple CSS parser
interface CssRule {
  selector: string;
  declarations: Record<string, string>;
}

/**
 * Converts HTML and CSS to Figma nodes
 */
async function convertHtmlCssToFigma(htmlString: string, cssString: string): Promise<SceneNode[]> {
  // Parse the HTML into a DOM-like structure
  const dom = parseHtml(htmlString);
  
  // Parse the CSS
  const cssRules = parseCss(cssString);
  
  // Create a root frame to hold all elements
  const rootFrame = figma.createFrame();
  rootFrame.name = 'HTML to Figma';
  rootFrame.resize(800, 600);
  rootFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  
  // Load fonts before creating text nodes
  await loadFonts();
  
  // Process the DOM tree and create Figma nodes
  for (const node of dom) {
    await processNode(node, cssRules, rootFrame);
  }
  
  return [rootFrame];
}

/**
 * Simple HTML parser
 */
function parseHtml(htmlString: string): HtmlNode[] {
  const nodes: HtmlNode[] = [];
  let currentIndex = 0;
  
  // Remove comments first
  htmlString = htmlString.replace(/<!--[\s\S]*?-->/g, '');
  
  while (currentIndex < htmlString.length) {
    // Find next tag
    const tagStart = htmlString.indexOf('<', currentIndex);
    
    // No more tags
    if (tagStart === -1) {
      const textContent = htmlString.substring(currentIndex).trim();
      if (textContent) {
        nodes.push({ type: 'text', data: textContent });
      }
      break;
    }
    
    // Text node before tag
    if (tagStart > currentIndex) {
      const textContent = htmlString.substring(currentIndex, tagStart).trim();
      if (textContent) {
        nodes.push({ type: 'text', data: textContent });
      }
    }
    
    // Check if it's a closing tag
    if (htmlString.charAt(tagStart + 1) === '/') {
      const tagEnd = htmlString.indexOf('>', tagStart);
      if (tagEnd === -1) break; // Malformed HTML
      currentIndex = tagEnd + 1;
      continue;
    }
    
    // Parse the tag
    const tagEnd = htmlString.indexOf('>', tagStart);
    if (tagEnd === -1) break; // Malformed HTML
    
    const fullTag = htmlString.substring(tagStart + 1, tagEnd);
    
    // Check if it's a self-closing tag
    const isSelfClosing = fullTag.endsWith('/') || 
      ['img', 'input', 'br', 'hr'].includes(fullTag.split(/\s+/)[0]);
    
    // Get tag name and attributes
    const parts = fullTag.split(/\s+/);
    const tagName = parts[0].toLowerCase();
    
    // Skip DOCTYPE, comments, etc.
    if (tagName === '!doctype' || tagName === '!--') {
      currentIndex = tagEnd + 1;
      continue;
    }
    
    const attribs: Record<string, string> = {};
    
    // Parse attributes
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (!part || part === '/') continue;
      
      const eqIndex = part.indexOf('=');
      if (eqIndex === -1) {
        attribs[part] = '';
      } else {
        const attrName = part.substring(0, eqIndex);
        let attrValue = part.substring(eqIndex + 1);
        
        // Remove quotes
        if ((attrValue.startsWith('"') && attrValue.endsWith('"')) || 
            (attrValue.startsWith("'") && attrValue.endsWith("'"))) {
          attrValue = attrValue.substring(1, attrValue.length - 1);
        }
        
        attribs[attrName] = attrValue;
      }
    }
    
    // Create node
    const node: HtmlNode = {
      type: 'tag',
      name: tagName,
      attribs,
      children: []
    };
    
    // If self-closing, add to nodes and continue
    if (isSelfClosing) {
      nodes.push(node);
      currentIndex = tagEnd + 1;
      continue;
    }
    
    // Find closing tag
    const closingTagStart = findClosingTag(htmlString, tagName, tagEnd + 1);
    if (closingTagStart === -1) {
      // No closing tag found, treat as self-closing
      nodes.push(node);
      currentIndex = tagEnd + 1;
      continue;
    }
    
    // Parse children
    const childrenHtml = htmlString.substring(tagEnd + 1, closingTagStart);
    if (childrenHtml.trim()) {
      node.children = parseHtml(childrenHtml);
    }

    
    nodes.push(node);
    currentIndex = htmlString.indexOf('>', closingTagStart) + 1;
  }
  
  return nodes;
}

/**
 * Helper function to find closing tag
 */
function findClosingTag(html: string, tagName: string, startIndex: number): number {
  let depth = 1;
  let currentIndex = startIndex;
  
  while (currentIndex < html.length && depth > 0) {
    const openingTagIndex = html.indexOf(`<${tagName}`, currentIndex);
    const closingTagIndex = html.indexOf(`</${tagName}`, currentIndex);
    
    if (closingTagIndex === -1) return -1;
    
    if (openingTagIndex !== -1 && openingTagIndex < closingTagIndex) {
      depth++;
      currentIndex = openingTagIndex + 1;
    } else {
      depth--;
      if (depth === 0) return closingTagIndex;
      currentIndex = closingTagIndex + 1;
    }
  }
  
  return -1;
}

/**
 * Simple CSS parser
 */
function parseCss(cssString: string): CssRule[] {
  const rules: CssRule[] = [];
  
  // Remove comments and normalize whitespace
  cssString = cssString.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
  
  // Match selectors and declaration blocks
  const ruleRegex = /([^{]+){([^}]*)}/g;
  let match;
  
  while ((match = ruleRegex.exec(cssString)) !== null) {
    const selectors = match[1].trim().split(',');
    const declarationBlock = match[2].trim();
    
    // Parse declarations
    const declarations: Record<string, string> = {};
    const declarationRegex = /([^:;]+):([^;]+)(?:;|$)/g;
    let declMatch;
    
    while ((declMatch = declarationRegex.exec(declarationBlock)) !== null) {
      const property = declMatch[1].trim();
      const value = declMatch[2].trim();
      declarations[camelCase(property)] = value;
    }
    
    // Create a rule for each selector
    for (const selector of selectors) {
      rules.push({
        selector: selector.trim(),
        declarations
      });
    }
  }
  
  return rules;
}

/**
 * Process a DOM node and create corresponding Figma nodes
 */
async function processNode(node: HtmlNode, cssRules: CssRule[], parentNode: FrameNode | GroupNode, position = { x: 0, y: 0 }): Promise<void> {
  // Skip if it's not an element node
  if (node.type !== 'tag') {
    if (node.type === 'text' && node.data && node.data.trim()) {
      // Create a text node for text content
      const text = figma.createText();
      text.x = position.x;
      text.y = position.y;
      text.characters = node.data.trim();
      
      // Apply text styles (default)
      text.fontSize = 16;
      text.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
      
      parentNode.appendChild(text);
    }
    return;
  }
  
  // Get styles for the node based on CSS rules
  const styles = getStylesForNode(node, cssRules);
  
  // Create appropriate Figma node based on tag
  let figmaNode: SceneNode;
  
  switch (node.name?.toLowerCase()) {
    case 'div':
    case 'section':
    case 'article':
    case 'header':
    case 'footer':
    case 'nav':
    case 'aside':
    case 'main':
    case 'form':
      // Container elements become frames
      figmaNode = createFrameNode(node, styles, position);
      parentNode.appendChild(figmaNode);
      
      // Process children
      if (node.children && node.children.length > 0) {
        let yOffset = 0;
        for (const child of node.children) {
          await processNode(child, cssRules, figmaNode as FrameNode, { x: 10, y: yOffset });
          // Simple flow layout
          if (child.type === 'tag' || (child.type === 'text' && child.data?.trim())) {
            yOffset += 30; // Default spacing
          }
        }
      }
      break;
      
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
    case 'p':
    case 'span':
    case 'a':
    case 'label':
      // Text elements
      figmaNode = await createTextNode(node, styles, position);
      parentNode.appendChild(figmaNode);
      break;
      
    case 'button':
    case 'input':
      // Button elements
      figmaNode = createButtonNode(node, styles, position);
      parentNode.appendChild(figmaNode);
      break;
      
    case 'img':
      // Image elements (placeholder rectangle for now)
      figmaNode = createRectangleNode(node, styles, position);
      parentNode.appendChild(figmaNode);
      break;
      
    default:
      // Default to a frame for unknown elements
      figmaNode = createFrameNode(node, styles, position);
      parentNode.appendChild(figmaNode);
      
      // Process children
      if (node.children && node.children.length > 0) {
        let yOffset = 0;
        for (const child of node.children) {
          await processNode(child, cssRules, figmaNode as FrameNode, { x: 10, y: yOffset });
          yOffset += 30;
        }
      }
  }
}

/**
 * Get styles for a DOM node based on CSS rules
 */
function getStylesForNode(node: HtmlNode, cssRules: CssRule[]): Record<string, string> {
  const styles: Record<string, string> = {};
  
  // Process inline style
  if (node.attribs && node.attribs.style) {
    const inlineStyles = parseInlineStyle(node.attribs.style);
    Object.assign(styles, inlineStyles);
  }
  
  // Process CSS rules
  for (const rule of cssRules) {
    if (doesSelectorMatch(rule.selector, node)) {
      // Apply the styles from this rule
      Object.assign(styles, rule.declarations);
    }
  }
  
  return styles;
}

/**
 * Parse inline style attribute
 */
function parseInlineStyle(styleString: string): Record<string, string> {
  const styles: Record<string, string> = {};
  const declarations = styleString.split(';');
  
  for (const declaration of declarations) {
    const parts = declaration.split(':');
    if (parts.length === 2) {
      const property = parts[0].trim();
      const value = parts[1].trim();
      
      if (property && value) {
        styles[camelCase(property)] = value;
      }
    }
  }
  
  return styles;
}

/**
 * Check if a CSS selector matches a DOM node
 */
function doesSelectorMatch(selector: string, node: HtmlNode): boolean {
  // This is a very simplified selector matching
  // In a real implementation, you'd need a more sophisticated approach
  
  selector = selector.trim();
  
  // Element selector
  if (selector.toLowerCase() === node.name?.toLowerCase()) {
    return true;
  }
  
  // Class selector
  if (selector.startsWith('.') && node.attribs && node.attribs.class) {
    const className = selector.substring(1);
    const nodeClasses = node.attribs.class.split(' ');
    if (nodeClasses.includes(className)) {
      return true;
    }
  }
  
  // ID selector
  if (selector.startsWith('#') && node.attribs && node.attribs.id) {
    const idName = selector.substring(1);
    if (node.attribs.id === idName) {
      return true;
    }
  }
  
  return false;
}

/**
 * Create a Figma frame node
 */
function createFrameNode(node: HtmlNode, styles: Record<string, string>, position: { x: number, y: number }): FrameNode {
  const frame = figma.createFrame();
  frame.name = node.name || 'Frame';
  frame.x = position.x;
  frame.y = position.y;
  
  // Set size
  const width = styles.width ? parseInt(styles.width) : 200;
  const height = styles.height ? parseInt(styles.height) : 100;
  frame.resize(width, height);
  
  // Set background color
  if (styles.backgroundColor) {
    const color = parseColor(styles.backgroundColor);
    if (color) {
      frame.fills = [{ type: 'SOLID', color }];
    }
  }
  
  // Set border
  if (styles.borderWidth && styles.borderColor) {
    const borderWidth = parseInt(styles.borderWidth);
    const borderColor = parseColor(styles.borderColor);
    
    if (borderWidth && borderColor) {
      frame.strokeWeight = borderWidth;
      frame.strokes = [{ type: 'SOLID', color: borderColor }];
    }
  }
  
  // Set border radius
  if (styles.borderRadius) {
    const borderRadius = parseInt(styles.borderRadius);
    if (borderRadius) {
      frame.cornerRadius = borderRadius;
    }
  }
  
  // Set padding
  if (styles.padding) {
    const padding = parseInt(styles.padding);
    if (padding) {
      frame.paddingTop = padding;
      frame.paddingRight = padding;
      frame.paddingBottom = padding;
      frame.paddingLeft = padding;
    }
  }
  
  return frame;
}

/**
 * Create a Figma text node
 */
async function createTextNode(node: HtmlNode, styles: Record<string, string>, position: { x: number, y: number }): Promise<TextNode> {
  // Create text node
  const text = figma.createText();
  text.x = position.x;
  text.y = position.y;
  
  // Extract text content from node
  let textContent = '';
  if (node.children) {
    for (const child of node.children) {
      if (child.type === 'text') {
        textContent += child.data;
      }
    }
  }
  
  text.characters = textContent.trim();
  
  // Set font size
  if (styles.fontSize) {
    let fontSize = parseInt(styles.fontSize);
    if (isNaN(fontSize)) {
      // Handle relative font sizes
      switch (node.name?.toLowerCase()) {
        case 'h1': fontSize = 32; break;
        case 'h2': fontSize = 24; break;
        case 'h3': fontSize = 18.72; break;
        case 'h4': fontSize = 16; break;
        case 'h5': fontSize = 13.28; break;
        case 'h6': fontSize = 10.72; break;
        default: fontSize = 16;
      }
    }
    text.fontSize = fontSize;
  } else {
    // Default font size based on tag
    switch (node.name?.toLowerCase()) {
      case 'h1': text.fontSize = 32; break;
      case 'h2': text.fontSize = 24; break;
      case 'h3': text.fontSize = 18.72; break;
      case 'h4': text.fontSize = 16; break;
      case 'h5': text.fontSize = 13.28; break;
      case 'h6': text.fontSize = 10.72; break;
      default: text.fontSize = 16;
    }
  }
  
  // Set font color
  if (styles.color) {
    const color = parseColor(styles.color);
    if (color) {
      text.fills = [{ type: 'SOLID', color }];
    }
  }
  
  // Set font weight
  if (styles.fontWeight) {
    // FontWeight needs to be supported by the font family
    // For this example, we'll use a simple approach
    const fontWeight = styles.fontWeight === 'bold' || parseInt(styles.fontWeight) >= 600 
      ? 'Bold' 
      : 'Regular';
    
    text.fontName = { family: 'Inter', style: fontWeight };
  }
  
  return text;
}

/**
 * Create a Figma button node
 */
function createButtonNode(node: HtmlNode, styles: Record<string, string>, position: { x: number, y: number }): FrameNode {
  const button = figma.createFrame();
  button.name = node.name || 'Button';
  button.x = position.x;
  button.y = position.y;
  
  // Set size
  const width = styles.width ? parseInt(styles.width) : 120;
  const height = styles.height ? parseInt(styles.height) : 40;
  button.resize(width, height);
  
  // Set background color
  if (styles.backgroundColor) {
    const color = parseColor(styles.backgroundColor);
    if (color) {
      button.fills = [{ type: 'SOLID', color }];
    }
  } else {
    // Default button color
    button.fills = [{ type: 'SOLID', color: { r: 0.094, g: 0.627, b: 0.984 } }]; // #18A0FB
  }
  
  // Set border radius
  if (styles.borderRadius) {
    const borderRadius = parseInt(styles.borderRadius);
    if (borderRadius) {
      button.cornerRadius = borderRadius;
    } else {
      button.cornerRadius = 4; // Default border radius
    }
  } else {
    button.cornerRadius = 4; // Default border radius
  }
  
  // Extract button text
  let buttonText = '';
  if (node.children) {
    for (const child of node.children) {
      if (child.type === 'text') {
        buttonText += child.data;
      }
    }
  }
  
  if (buttonText.trim()) {
    // Create text node for button label
    const text = figma.createText();
    text.characters = buttonText.trim();
    text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; // White text
    text.fontSize = 14;
    button.appendChild(text);
    
    // Center the text in the button
    text.x = (width - text.width) / 2;
    text.y = (height - text.height) / 2;
  }
  
  return button;
}

/**
 * Create a Figma rectangle node (for images or other elements)
 */
function createRectangleNode(node: HtmlNode, styles: Record<string, string>, position: { x: number, y: number }): RectangleNode {
  const rect = figma.createRectangle();
  rect.x = position.x;
  rect.y = position.y;
  
  // Set size
  const width = styles.width ? parseInt(styles.width) : 100;
  const height = styles.height ? parseInt(styles.height) : 100;
  rect.resize(width, height);
  
  // Set background color
  if (styles.backgroundColor) {
    const color = parseColor(styles.backgroundColor);
    if (color) {
      rect.fills = [{ type: 'SOLID', color }];
    }
  } else {
    // Default fill color
    rect.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }]; // Light gray
  }
  
  // Set border radius
  if (styles.borderRadius) {
    const borderRadius = parseInt(styles.borderRadius);
    if (borderRadius) {
      rect.cornerRadius = borderRadius;
    }
  }
  
  return rect;
}

/**
 * Convert kebab-case to camelCase (e.g., font-size to fontSize)
 */
function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Parse CSS color value to Figma color object
 */
function parseColor(colorValue: string): { r: number, g: number, b: number } | null {
  // Handle hex colors
  if (colorValue.startsWith('#')) {
    return hexToRgb(colorValue);
  }
  
  // Handle rgb/rgba colors
  if (colorValue.startsWith('rgb')) {
    return rgbStringToRgb(colorValue);
  }
  
  // Handle named colors (simplified)
  switch (colorValue.toLowerCase()) {
    case 'black': return { r: 0, g: 0, b: 0 };
    case 'white': return { r: 1, g: 1, b: 1 };
    case 'red': return { r: 1, g: 0, b: 0 };
    case 'green': return { r: 0, g: 1, b: 0 };
    case 'blue': return { r: 0, g: 0, b: 1 };
    case 'yellow': return { r: 1, g: 1, b: 0 };
    case 'cyan': return { r: 0, g: 1, b: 1 };
    case 'magenta': return { r: 1, g: 0, b: 1 };
    case 'gray': case 'grey': return { r: 0.5, g: 0.5, b: 0.5 };
    default: return null;
  }
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse 3-digit hex
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16) / 255;
    const g = parseInt(hex[1] + hex[1], 16) / 255;
    const b = parseInt(hex[2] + hex[2], 16) / 255;
    return { r, g, b };
  }
  
  // Parse 6-digit hex
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return { r, g, b };
  }
  
  return null;
}

/**
 * Convert rgb/rgba string to RGB object
 */
function rgbStringToRgb(rgb: string): { r: number, g: number, b: number } | null {
  // Extract values from rgb() or rgba()
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  
  if (match) {
    const r = parseInt(match[1]) / 255;
    const g = parseInt(match[2]) / 255;
    const b = parseInt(match[3]) / 255;
    return { r, g, b };
  }
  
  return null;
}

/**
 * Load required fonts
 */
async function loadFonts(): Promise<void> {
  // Load Inter font for text elements
  await Promise.all([
    figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Bold' })
  ]);
}