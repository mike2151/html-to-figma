/**
 * Improved utility functions for working with Figma clipboard data
 * Based on analysis of real Figma clipboard data
 */

// Generate a random file key similar to what Figma uses
function generateFigmaFileKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 22; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  // Create a minimal node representation for a simple box
  export function createSimpleBox(options: {
    width?: number;
    height?: number;
    color?: string;
    cornerRadius?: number;
    x?: number;
    y?: number;
    name?: string;
  }) {
    const {
      width = 100,
      height = 100,
      color = '#0070f3',
      cornerRadius = 0,
      x = 0,
      y = 0,
      name = 'Simple Box'
    } = options;
    
    // Parse the color
    const rgbColor = hexToRgb(color);
    
    return {
      id: `${Math.floor(Math.random() * 1000)}:${Math.floor(Math.random() * 1000)}`,
      name,
      type: 'RECTANGLE',
      blendMode: 'NORMAL',
      absoluteBoundingBox: {
        x,
        y,
        width,
        height
      },
      constraints: {
        vertical: 'TOP',
        horizontal: 'LEFT'
      },
      fills: [
        {
          type: 'SOLID',
          color: rgbColor
        }
      ],
      strokes: [],
      strokeWeight: 0,
      strokeAlign: 'CENTER',
      cornerRadius
    };
  }
  
  // Generate Figma-compatible clipboard data
  export function generateFigmaClipboardData(figmaNode: any): string {
    // Generate a random paste ID
    const pasteID = Math.floor(Math.random() * 10000000);
    
    // Create the metadata matching Figma's format
    const metadata = {
      fileKey: generateFigmaFileKey(),
      pasteID: pasteID,
      dataType: "scene"
    };
    
    // Base64 encode the metadata - append newline like Figma does
    const metadataBase64 = btoa(JSON.stringify(metadata) + '\n');
    
    // Serialize the node data to match Figma's format
    const nodeDataString = JSON.stringify(figmaNode);
    const compressedData = btoa(nodeDataString);
    
    // Create the HTML structure exactly matching Figma's format
    const clipboardHtml = `<meta charset='utf-8'><meta charset="utf-8"><span data-metadata="<!--(figmeta)${metadataBase64}(/figmeta)-->"></span><span data-buffer="<!--(figma)${compressedData}(/figma)-->"></span><span style="white-space:pre-wrap;"></span>`;
    
    return clipboardHtml;
  }
  
  // Create Figma-compatible clipboard data for a simple box (direct conversion)
  export function createSimpleBoxClipboardData(options: {
    width?: number;
    height?: number;
    color?: string;
    cornerRadius?: number;
    x?: number;
    y?: number;
    name?: string;
  }) {
    const boxNode = createSimpleBox(options);
    return generateFigmaClipboardData(boxNode);
  }
  
  // Helper function to convert hex color to RGB
  function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    let r, g, b;
    if (hex.length === 3) {
      // Short form (#RGB)
      r = parseInt(hex[0] + hex[0], 16) / 255;
      g = parseInt(hex[1] + hex[1], 16) / 255;
      b = parseInt(hex[2] + hex[2], 16) / 255;
    } else {
      // Long form (#RRGGBB)
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    }
    
    return { r, g, b, a: 1 };
  }
  
  // Parse Figma clipboard format from raw HTML
  export function parseFigmaClipboardData(html: string): any {
    try {
      // Extract the metadata
      const metadataMatch = html.match(/data-metadata="<!--\(figmeta\)(.*?)\(\/figmeta\)-->"/) || [];
      const metadataBase64 = metadataMatch[1];
      
      // Extract the buffer data
      const bufferMatch = html.match(/data-buffer="<!--\(figma\)(.*?)\(\/figma\)-->"/) || [];
      const bufferBase64 = bufferMatch[1];
      
      if (!bufferBase64) {
        throw new Error('No Figma buffer data found');
      }
      
      // Decode the buffer data
      const bufferDecoded = atob(bufferBase64);
      
      // Attempt to parse as JSON
      try {
        return JSON.parse(bufferDecoded);
      } catch (e) {
        // If it's not valid JSON, it might be using Figma's proprietary format
        // Return the raw decoded data
        return {
          rawBuffer: bufferDecoded,
          rawMetadata: metadataBase64 ? atob(metadataBase64) : null
        };
      }
    } catch (error) {
      console.error('Error parsing Figma clipboard data:', error);
      return null;
    }
  }
  
  // Create a more precise match for the simple box example provided by Galileo AI
  export function createGalileoStyleBox(): string {
    // Create a simple frame with a solid blue fill
    const simpleFrame = {
      id: "0:1",
      type: "RECTANGLE",
      name: "Rectangle",
      blendMode: "NORMAL",
      absoluteBoundingBox: {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      },
      constraints: {
        vertical: "TOP",
        horizontal: "LEFT"
      },
      fills: [
        {
          type: "SOLID",
          color: {
            r: 0.07058823853731155,
            g: 0.2235294133424759,
            b: 0.8823529481887817,
            a: 1
          }
        }
      ],
      strokes: [],
      strokeWeight: 0,
      strokeAlign: "CENTER",
      effects: [],
      cornerRadius: 8,
    };
    
    // Generate the clipboard data
    return generateFigmaClipboardData(simpleFrame);
  }