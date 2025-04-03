import { parseHtml, HtmlNode } from './html-parser';
import { parseCss, getMatchingRules } from './css-parser';
import { 
  FigmaNode,
  FigmaFrameNode,
  FigmaTextNode,
  FigmaRectangleNode,
  RGB,
  RGBA,
  Size
} from '../types/figma';

// Main conversion function
export function convertHtmlCssToFigma(html: string, css: string): FigmaNode {
  const htmlTree = parseHtml(html);
  const cssRules = parseCss(css);
  
  // Create a root frame to contain all elements
  const rootFrame: FigmaFrameNode = {
    type: 'FRAME',
    name: 'HTML to Figma',
    size: { width: 800, height: 600 },
    children: []
  };
  
  // Process the HTML tree and add nodes to the Figma tree
  processNode(htmlTree, cssRules, rootFrame);
  
  return rootFrame;
}

// Process an HTML node and convert it to Figma nodes
function processNode(
  node: HtmlNode, 
  cssRules: any[], 
  parentFigmaNode: FigmaNode,
  position = { x: 0, y: 0 }
): void {
  // Get CSS properties for this node
  const cssProperties = getMatchingRules(node, cssRules);
  
  // Convert CSS to Figma properties
  const figmaProperties = convertCssToFigmaProps(cssProperties);
  
  let figmaNode: FigmaNode | null = null;
  
  // Create Figma node based on HTML tag
  switch (node.tag.toLowerCase()) {
    case 'div':
    case 'section':
    case 'article':
    case 'header':
    case 'footer':
    case 'nav':
    case 'aside':
    case 'main':
      // Container elements become frames
      figmaNode = createFrameNode(node, figmaProperties, position);
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
    case '#text':
      // Text elements
      if (node.textContent.trim()) {
        figmaNode = createTextNode(node, figmaProperties, position);
      }
      break;
      
    case 'img':
      // Images would become rectangles with fills for now
      // In a more advanced version, you'd handle actual images
      figmaNode = createRectangleNode(node, figmaProperties, position);
      break;
      
    case 'button':
    case 'input':
      // Form elements become rectangles or frames with text
      figmaNode = createFrameNode(node, figmaProperties, position);
      
      // If it has text content, add a text node
      if (node.textContent.trim()) {
        const textNode = createTextNode(node, figmaProperties, { x: 10, y: 10 });
        (figmaNode as FigmaFrameNode).children?.push(textNode);
      }
      break;
      
    default:
      // Default to a frame for unknown elements
      figmaNode = createFrameNode(node, figmaProperties, position);
  }
  
  // If we created a node, add it to the parent
  if (figmaNode && parentFigmaNode.children) {
    parentFigmaNode.children.push(figmaNode);
    
    // If the node can have children, process them
    if ('children' in figmaNode && node.children.length > 0) {
      // Simple layout algorithm (very basic)
      let yOffset = 0;
      
      node.children.forEach(childNode => {
        const childPosition = { x: 10, y: yOffset + 10 };
        processNode(childNode, cssRules, figmaNode as FigmaFrameNode, childPosition);
        yOffset += 40; // Very simple positioning, would need improvement
      });
    }
  }
}

// Convert CSS properties to Figma properties
function convertCssToFigmaProps(cssProps: Record<string, string>): any {
  const figmaProps: any = {
    fills: [],
    strokes: [],
    effects: [],
    textStyle: {}
  };
  
  // Process each CSS property
  Object.entries(cssProps).forEach(([property, value]) => {
    switch (property) {
      case 'background-color':
      case 'background':
        // Handle background color
        const bgColor = parseCssColor(value);
        if (bgColor) {
          figmaProps.fills.push({
            type: 'SOLID',
            color: bgColor
          });
        }
        break;
        
      case 'color':
        // Text color
        const textColor = parseCssColor(value);
        if (textColor) {
          figmaProps.textStyle.color = textColor;
        }
        break;
        
      case 'font-size':
        // Font size (convert from px to number)
        const fontSize = parseInt(value);
        if (!isNaN(fontSize)) {
          figmaProps.textStyle.fontSize = fontSize;
        }
        break;
        
      case 'font-weight':
        // Font weight
        const fontWeight = parseInt(value);
        if (!isNaN(fontWeight)) {
          figmaProps.textStyle.fontWeight = fontWeight;
        } else if (value === 'bold') {
          figmaProps.textStyle.fontWeight = 700;
        }
        break;
        
      case 'font-family':
        // Font family
        figmaProps.textStyle.fontFamily = value.split(',')[0].trim().replace(/["']/g, '');
        break;
        
      case 'width':
        // Width
        const width = parseSize(value);
        if (width !== null) {
          figmaProps.size = { ...figmaProps.size || {}, width };
        }
        break;
        
      case 'height':
        // Height
        const height = parseSize(value);
        if (height !== null) {
          figmaProps.size = { ...figmaProps.size || {}, height };
        }
        break;
        
      case 'border':
      case 'border-width':
        // Border/stroke
        const borderWidth = parseInt(value);
        if (!isNaN(borderWidth)) {
          figmaProps.strokes.push({
            strokeWeight: borderWidth,
            strokeAlign: 'CENTER',
            color: { r: 0, g: 0, b: 0, a: 1 }  // Default black
          });
        }
        break;
        
      case 'border-color':
        // Border color
        const borderColor = parseCssColor(value);
        if (borderColor && figmaProps.strokes.length > 0) {
          figmaProps.strokes[0].color = borderColor;
        }
        break;
        
      case 'border-radius':
        // Border radius
        const borderRadius = parseInt(value);
        if (!isNaN(borderRadius)) {
          figmaProps.cornerRadius = borderRadius;
        }
        break;
        
      case 'box-shadow':
        // Box shadow
        const shadowMatch = value.match(/(\d+)px\s+(\d+)px\s+(\d+)px\s+(\d+)px\s+rgba?\(([^)]+)\)/);
        if (shadowMatch) {
          const [, offsetX, offsetY, blur, spread, colorString] = shadowMatch;
          const shadowColor = parseCssColor(`rgba(${colorString})`);
          
          if (shadowColor) {
            figmaProps.effects.push({
              type: 'DROP_SHADOW',
              radius: parseInt(blur) || 0,
              offset: {
                x: parseInt(offsetX) || 0,
                y: parseInt(offsetY) || 0
              },
              spread: parseInt(spread) || 0,
              color: shadowColor
            });
          }
        }
        break;
    }
  });
  
  return figmaProps;
}

// Create a Figma frame node from an HTML node
function createFrameNode(
  htmlNode: HtmlNode, 
  figmaProps: any, 
  position: { x: number, y: number }
): FigmaFrameNode {
  return {
    type: 'FRAME',
    name: htmlNode.tag,
    position,
    size: figmaProps.size || { width: 200, height: 100 },  // Default size
    fills: figmaProps.fills,
    strokes: figmaProps.strokes,
    effects: figmaProps.effects,
    cornerRadius: figmaProps.cornerRadius,
    children: []
  };
}

// Create a Figma text node from an HTML node
function createTextNode(
  htmlNode: HtmlNode, 
  figmaProps: any,
  position: { x: number, y: number }
): FigmaTextNode {
  return {
    type: 'TEXT',
    name: `${htmlNode.tag} Text`,
    characters: htmlNode.textContent.trim(),
    style: figmaProps.textStyle || {
      fontSize: 16,
      fontWeight: 400,
      fontFamily: 'Inter',
      color: { r: 0, g: 0, b: 0 } // Default black
    },
    position,
    size: figmaProps.size
  };
}

// Create a Figma rectangle node from an HTML node
function createRectangleNode(
  htmlNode: HtmlNode, 
  figmaProps: any,
  position: { x: number, y: number }
): FigmaRectangleNode {
  return {
    type: 'RECTANGLE',
    name: htmlNode.tag,
    position,
    size: figmaProps.size || { width: 100, height: 100 }, // Default size
    fills: figmaProps.fills,
    strokes: figmaProps.strokes,
    cornerRadius: figmaProps.cornerRadius
  };
}

// Helper function to parse CSS colors into Figma RGBA
function parseCssColor(cssColor: string): RGBA | null {
  // Handle named colors
  const namedColors: Record<string, RGB> = {
    black: { r: 0, g: 0, b: 0 },
    white: { r: 1, g: 1, b: 1 },
    red: { r: 1, g: 0, b: 0 },
    green: { r: 0, g: 1, b: 0 },
    blue: { r: 0, g: 0, b: 1 },
    // Add more named colors as needed
  };
  
  if (cssColor in namedColors) {
    return { ...namedColors[cssColor], a: 1 };
  }
  
  // Handle hex colors
  if (cssColor.startsWith('#')) {
    const hex = cssColor.substring(1);
    
    // #RGB format
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16) / 255;
      const g = parseInt(hex[1] + hex[1], 16) / 255;
      const b = parseInt(hex[2] + hex[2], 16) / 255;
      return { r, g, b, a: 1 };
    }
    
    // #RRGGBB format
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      return { r, g, b, a: 1 };
    }
  }
  
  // Handle rgb/rgba colors
  const rgbMatch = cssColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]) / 255;
    const g = parseInt(rgbMatch[2]) / 255;
    const b = parseInt(rgbMatch[3]) / 255;
    const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
    return { r, g, b, a };
  }
  
  return null;
}

// Helper function to parse size values (px, rem, em, etc.)
function parseSize(value: string): number | null {
  // Handle px values
  const pxMatch = value.match(/^(\d+)px$/);
  if (pxMatch) {
    return parseInt(pxMatch[1]);
  }
  
  // Handle percentage values - convert to a reasonable pixel value
  const percentMatch = value.match(/^(\d+)%$/);
  if (percentMatch) {
    // Convert percentage to pixels based on a default container size
    return (parseInt(percentMatch[1]) / 100) * 500; // Assuming 500px container
  }
  
  // Handle rem values - assuming 1rem = 16px
  const remMatch = value.match(/^([\d.]+)rem$/);
  if (remMatch) {
    return parseFloat(remMatch[1]) * 16;
  }
  
  // Handle plain numbers
  const numMatch = value.match(/^(\d+)$/);
  if (numMatch) {
    return parseInt(numMatch[1]);
  }
  
  return null;
}

// New addition: Generate Figma clipboard data
export function generateFigmaClipboardData(figmaNode: FigmaNode): string {
    // Generate a random ID for the paste operation
    const randomId = Math.floor(Math.random() * 10000000);
    
    // Create the metadata in the exact format Figma expects
    const metadata = {
      fileKey: `NJT94DfXs1bTd0tWG89G75`, // Using a consistent file key like Figma
      pasteID: randomId,
      dataType: "scene"
    };
    
    // Transform our node structure to match Figma's format better
    const transformedNode = transformNodeForFigma(figmaNode);
    
    // Base64 encode the metadata - add newline to match Figma's format
    const metadataBase64 = btoa(JSON.stringify(metadata) + "\n");
    const nodeDataBase64 = btoa(JSON.stringify(transformedNode));
    
    // Create the HTML structure that exactly matches Figma's clipboard format
    const clipboardHtml = `<meta charset='utf-8'><meta charset="utf-8"><span data-metadata="<!--(figmeta)${metadataBase64}(/figmeta)-->"></span><span data-buffer="<!--(figma)${nodeDataBase64}(/figma)-->"></span><span style="white-space:pre-wrap;"></span>`;
    
    return clipboardHtml;
  }

// Transform our node structure to match Figma's internal format more closely
function transformNodeForFigma(node: FigmaNode): any {
  // This is a simplified transformation based on observed Figma clipboard format
  // A real implementation would need more fine-tuning through trial and error
  
  const base = {
    id: `${Math.floor(Math.random() * 1000)}:${Math.floor(Math.random() * 1000)}`,
    name: node.name,
    type: node.type,
    blendMode: "NORMAL",
    absoluteBoundingBox: {
      x: node.position?.x || 0,
      y: node.position?.y || 0,
      width: node.size?.width || 100,
      height: node.size?.height || 100
    },
    constraints: {
      vertical: "TOP",
      horizontal: "LEFT"
    }
  };
  
  let transformed: any = { ...base };
  
  // Add type-specific properties
  switch (node.type) {
    case 'FRAME':
      transformed.fills = (node as FigmaFrameNode).fills || [];
      transformed.strokes = (node as FigmaFrameNode).strokes || [];
      transformed.cornerRadius = (node as FigmaFrameNode).cornerRadius || 0;
      transformed.children = [];
      
      // Process children
      if ((node as FigmaFrameNode).children) {
        (node as FigmaFrameNode).children.forEach(child => {
          transformed.children.push(transformNodeForFigma(child));
        });
      }
      break;
      
    case 'TEXT':
      transformed.characters = (node as FigmaTextNode).characters || '';
      transformed.style = (node as FigmaTextNode).style || {};
      break;
      
    case 'RECTANGLE':
      transformed.fills = (node as FigmaRectangleNode).fills || [];
      transformed.strokes = (node as FigmaRectangleNode).strokes || [];
      transformed.cornerRadius = (node as FigmaRectangleNode).cornerRadius || 0;
      break;
  }
  
  return transformed;
}

// Compress node data for Figma clipboard
// This is a placeholder for the actual compression that Figma uses
function compressNodeData(node: any): string {
  // In a real implementation, this would use Figma's specific compression format
  // For now, we'll just do a simple JSON serialization and Base64 encoding
  
  // First, convert to a JSON string
  const jsonString = JSON.stringify(node);
  
  // Then Base64 encode it
  // Note: Figma likely uses a more sophisticated binary format or compression
  return btoa(jsonString);
}