import { parseCss } from "./css-parser";
import { camelCase } from "./figma-conversion-utils";
import { parseHtml } from "./html-parser";
import { HTMLElement, TextNode as HtmlTextNode, Node, NodeType } from "node-html-parser";
import { CssRule } from "./types";

  /**
   * Load required fonts
   */
  async function loadInterFonts(): Promise<void> {
    await Promise.all([
      figma.loadFontAsync({ family: "Inter", style: "Regular" }),
      figma.loadFontAsync({ family: "Inter", style: "Bold" }),
    ]);
  }

/**
 * Converts HTML and CSS to Figma nodes
 */
export async function convertHtmlCssToFigma(
    htmlString: string,
    cssString: string,
  ): Promise<SceneNode[]> {
    const dom = parseHtml(htmlString);
  
    // Parse the CSS
    const cssRules = parseCss(cssString);
  
    // Create a root frame to hold all elements
    const rootFrame = createCanvasForFigma();
  
    // Load fonts before creating text nodes
    await loadInterFonts();
  
    // Process the DOM tree and create Figma nodes
    for (const node of dom) {
      await processNode(node, cssRules, rootFrame);
    }
  
    return [rootFrame];
  }

  function createCanvasForFigma(): FrameNode {
    const canvas = figma.createFrame();
    canvas.name = "HTML to Figma";
    canvas.resize(800, 600);
    canvas.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    return canvas;
  }

  /**
 * Process a DOM node and create corresponding Figma nodes
 */
async function processNode(
    node: Node,
    cssRules: CssRule[],
    parentNode: FrameNode | GroupNode,
    position = { x: 0, y: 0 },
  ): Promise<void> {
    if (node.nodeType === NodeType.TEXT_NODE) {
      const textNode = node as HtmlTextNode;
      const trimmedText = textNode.text.trim();
      if (trimmedText) {
        // Create a text node for text content
        const text = figma.createText();
        setNodeAtPosition(text, position)
        text.characters = trimmedText;
  
        // Apply text styles (default)
        text.fontSize = 16;
        text.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  
        parentNode.appendChild(text);
      }
      return;
    }
  
    if (node.nodeType === NodeType.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      
      // Get styles for the node based on CSS rules
      const styles = getStylesForNode(element, cssRules);
    
      // Create appropriate Figma node based on tag
      let figmaNode: SceneNode;
    
      switch (tagName) {
      case "div":
      case "section":
      case "article":
      case "header":
      case "footer":
      case "nav":
      case "aside":
      case "main":
      case "form":
        // Container elements become frames
        figmaNode = createFrameNode(element, styles, position);
        parentNode.appendChild(figmaNode);
  
        // Process children
        if (element.childNodes && element.childNodes.length > 0) {
          let yOffset = 0;
          for (const child of element.childNodes) {
            await processNode(child, cssRules, figmaNode as FrameNode, {
              x: 10,
              y: yOffset,
            });
            // Simple flow layout
            if (
              child.nodeType === NodeType.ELEMENT_NODE ||
              (child.nodeType === NodeType.TEXT_NODE && (child as HtmlTextNode).text.trim())
            ) {
              yOffset += 30; // Default spacing
            }
          }
        }
        break;
  
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
      case "p":
      case "span":
      case "a":
      case "label":
        // Text elements
        figmaNode = await createTextNode(element, styles, position) as unknown as SceneNode;
        parentNode.appendChild(figmaNode);
        break;
  
      case "button":
      case "input":
        // Button elements
        figmaNode = createButtonNode(element, styles, position);
        parentNode.appendChild(figmaNode);
        break;
  
      case "img":
        // Image elements (placeholder rectangle for now)
        figmaNode = createRectangleNode(element, styles, position);
        parentNode.appendChild(figmaNode);
        break;
  
      default:
        // Default to a frame for unknown elements
        figmaNode = createFrameNode(element, styles, position);
        parentNode.appendChild(figmaNode);
  
        // Process children
        if (element.childNodes && element.childNodes.length > 0) {
          let yOffset = 0;
          for (const child of element.childNodes) {
            await processNode(child, cssRules, figmaNode as FrameNode, {
              x: 10,
              y: yOffset,
            });
            yOffset += 30;
          }
        }
    }
  }


/**
 * Get styles for a DOM node based on CSS rules
 */
function getStylesForNode(
    element: HTMLElement,
    cssRules: CssRule[],
  ): Record<string, string> {
    const styles: Record<string, string> = {};
  
    // Process inline style
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
      const inlineStyles = parseInlineStyle(styleAttr);
      Object.assign(styles, inlineStyles);
    }
  
    // Process CSS rules
    for (const rule of cssRules) {
      if (doesSelectorMatch(rule.selector, element)) {
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
    const declarations = styleString.split(";");
  
    for (const declaration of declarations) {
      const parts = declaration.split(":");
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
  function doesSelectorMatch(selector: string, element: HTMLElement): boolean {
    // This is a very simplified selector matching
    // In a real implementation, you'd need a more sophisticated approach
  
    selector = selector.trim();
    
    // Element selector
    if (selector.toLowerCase() === element.tagName.toLowerCase()) {
      return true;
    }
  
    // Class selector
    if (selector.startsWith(".")) {
      const className = selector.substring(1);
      const classAttr = element.getAttribute('class');
      if (classAttr) {
        const classes = classAttr.split(/\s+/);
        if (classes.includes(className)) {
          return true;
        }
      }
    }
  
    // ID selector
    if (selector.startsWith("#")) {
      const idName = selector.substring(1);
      const idAttr = element.getAttribute('id');
      if (idAttr === idName) {
        return true;
      }
    }
  
    return false;
  }
  
  /**
   * Create a Figma frame node
   */
  function createFrameNode(
    element: HTMLElement,
    styles: Record<string, string>,
    position: { x: number; y: number },
  ): FrameNode {
    const frame = figma.createFrame();
    frame.name = element.tagName ? element.tagName.toLowerCase() : "Frame";
    setNodeAtPosition(frame, position)
  
    // Set size
    const width = styles.width ? parseInt(styles.width) : 200;
    const height = styles.height ? parseInt(styles.height) : 100;
    frame.resize(width, height);
  
    // Set background color
    if (styles.backgroundColor) {
      const color = parseColor(styles.backgroundColor);
      if (color) {
        frame.fills = [{ type: "SOLID", color }];
      }
    }
  
    // Set border
    if (styles.borderWidth && styles.borderColor) {
      const borderWidth = parseInt(styles.borderWidth);
      const borderColor = parseColor(styles.borderColor);
  
      if (borderWidth && borderColor) {
        frame.strokeWeight = borderWidth;
        frame.strokes = [{ type: "SOLID", color: borderColor }];
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
  async function createTextNode(
    element: HTMLElement,
    styles: Record<string, string>,
    position: { x: number; y: number },
  ): Promise<TextNode> {
    // Create text node
    const text = figma.createText();
    setNodeAtPosition(text, position)
  
    // Extract text content from element
    const textContent = element.text || "";
  
    text.characters = textContent.trim();
  
    // Set font size
    if (styles.fontSize) {
      let fontSize = parseInt(styles.fontSize);
      if (isNaN(fontSize)) {
        // Handle relative font sizes
        switch (element.tagName.toLowerCase()) {
          case "h1":
            fontSize = 32;
            break;
          case "h2":
            fontSize = 24;
            break;
          case "h3":
            fontSize = 18.72;
            break;
          case "h4":
            fontSize = 16;
            break;
          case "h5":
            fontSize = 13.28;
            break;
          case "h6":
            fontSize = 10.72;
            break;
          default:
            fontSize = 16;
        }
      }
      text.fontSize = fontSize;
    } else {
      // Default font size based on tag
      switch (element.tagName.toLowerCase()) {
        case "h1":
          text.fontSize = 32;
          break;
        case "h2":
          text.fontSize = 24;
          break;
        case "h3":
          text.fontSize = 18.72;
          break;
        case "h4":
          text.fontSize = 16;
          break;
        case "h5":
          text.fontSize = 13.28;
          break;
        case "h6":
          text.fontSize = 10.72;
          break;
        default:
          text.fontSize = 16;
      }
    }
  
    // Set font color
    if (styles.color) {
      const color = parseColor(styles.color);
      if (color) {
        text.fills = [{ type: "SOLID", color }];
      }
    }
  
    // Set font weight
    if (styles.fontWeight) {
      // FontWeight needs to be supported by the font family
      // For this example, we'll use a simple approach
      const fontWeight =
        styles.fontWeight === "bold" || parseInt(styles.fontWeight) >= 600
          ? "Bold"
          : "Regular";
  
      text.fontName = { family: "Inter", style: fontWeight };
    }
  
    return text;
  }
  
  /**
   * Create a Figma button node
   */
  function createButtonNode(
    element: HTMLElement,
    styles: Record<string, string>,
    position: { x: number; y: number },
  ): FrameNode {
    const button = figma.createFrame();
    button.name = element.tagName ? element.tagName.toLowerCase() : "Button";
    setNodeAtPosition(button, position)
  
    // Set size
    const width = styles.width ? parseInt(styles.width) : 120;
    const height = styles.height ? parseInt(styles.height) : 40;
    button.resize(width, height);
  
    // Set background color
    if (styles.backgroundColor) {
      const color = parseColor(styles.backgroundColor);
      if (color) {
        button.fills = [{ type: "SOLID", color }];
      }
    } else {
      // Default button color
      button.fills = [{ type: "SOLID", color: { r: 0.094, g: 0.627, b: 0.984 } }]; // #18A0FB
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
    const buttonText = element.text || "Button";
  
    if (buttonText.trim()) {
      // Create text node for button label
      const text = figma.createText();
      text.characters = buttonText.trim();
      text.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]; // White text
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
  function createRectangleNode(
    element: HTMLElement,
    styles: Record<string, string>,
    position: { x: number; y: number },
  ): RectangleNode {
    const rect = figma.createRectangle();
    rect.name = element.tagName ? element.tagName.toLowerCase() : "Rectangle";
    setNodeAtPosition(rect, position)
  
    // Set size
    const width = styles.width ? parseInt(styles.width) : 100;
    const height = styles.height ? parseInt(styles.height) : 100;
    rect.resize(width, height);
  
    // Set background color
    if (styles.backgroundColor) {
      const color = parseColor(styles.backgroundColor);
      if (color) {
        rect.fills = [{ type: "SOLID", color }];
      }
    } else {
      // Default fill color
      rect.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }]; // Light gray
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
   * Parse CSS color value to Figma color object
   */
  function parseColor(
    colorValue: string,
  ): { r: number; g: number; b: number } | null {
    // Handle hex colors
    if (colorValue.startsWith("#")) {
      return hexToRgb(colorValue);
    }
  
    // Handle rgb/rgba colors
    if (colorValue.startsWith("rgb")) {
      return rgbStringToRgb(colorValue);
    }
  
    // Handle named colors (simplified)
    switch (colorValue.toLowerCase()) {
      case "black":
        return { r: 0, g: 0, b: 0 };
      case "white":
        return { r: 1, g: 1, b: 1 };
      case "red":
        return { r: 1, g: 0, b: 0 };
      case "green":
        return { r: 0, g: 1, b: 0 };
      case "blue":
        return { r: 0, g: 0, b: 1 };
      case "yellow":
        return { r: 1, g: 1, b: 0 };
      case "cyan":
        return { r: 0, g: 1, b: 1 };
      case "magenta":
        return { r: 1, g: 0, b: 1 };
      case "gray":
      case "grey":
        return { r: 0.5, g: 0.5, b: 0.5 };
      default:
        return null;
    }
  }
  
  /**
   * Convert hex color to RGB
   */
  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Remove # if present
    hex = hex.replace(/^#/, "");
  
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
  function rgbStringToRgb(
    rgb: string,
  ): { r: number; g: number; b: number } | null {
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
}

function setNodeAtPosition(node: DefaultShapeMixin, position: { x: number; y: number; }) {
  node.x = position.x;
  node.y = position.y;
}
